from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import os
import asyncio
import re
import logging
import json
import requests
import tempfile
from pathlib import Path

from solcx import compile_standard, install_solc
from web3 import Web3
from datetime import datetime, timedelta
from app.pinata_utils import pin_json_to_pinata, pin_file_to_pinata
from app.deploy import deploy_fixed_contract, security_checks
from app.slither_runner import run_slither
from app.report_generator import generate_report
from app.llm_rewriter import generate_fixed_contract, get_contract_description, find_vulnerabilities
from pymongo.database import Database
from utils.connect_db import get_db
from reports.save_minting_report import save_minting_report
from models.report_model import MintingReport 

router = APIRouter()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
wallet_audit_registry = {}  # Track if a wallet has already audited
wallet_usage_log = []  
WALLET_DATA_FILE = Path("wallet_data.json")
WHITELISTED_WALLETS = {
    "0xb97fcdcd02fe2b50d8014b80080c904845e027f1",  # replace with your real address 1
    "0x857b213598ed77fb4e862fc4355c13c472b94078",  # replace with address 2
    "0xc1e43b61445cd96e096554a637ac2a43451ebce2",
    "0x6e7bd4a9c0b4695dd21bd7557a6c55ae4676cb1c"  
}


def extract_contract_name(solidity_code: str) -> str:
    match = re.search(r'contract\s+(\w+)', solidity_code)
    return match.group(1) if match else "Contract"

def clean_old_wallet_entries():
    """Clean wallet log entries older than 24 hours"""
    now = datetime.utcnow()
    wallet_usage_log[:] = [entry for entry in wallet_usage_log if now - entry['timestamp'] < timedelta(hours=24)]

async def async_pin_json_to_pinata(metadata: dict) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, pin_json_to_pinata, metadata)

def load_wallet_data():
    if WALLET_DATA_FILE.exists():
        print(f"Loading data from: {WALLET_DATA_FILE.absolute()}")  # 🔍 Confirm path
        with open(WALLET_DATA_FILE, 'r') as file:
            return json.load(file)
    return {"wallet_audit_registry": {}, "wallet_usage_log": []}


def save_wallet_data(data):
    with open(WALLET_DATA_FILE, "w") as file:
        json.dump(data, file, indent=4, default=str)

def clean_old_wallet_entries(data):
    """Clean wallet log entries older than 24 hours"""
    now = datetime.utcnow()
    cleaned_log = [
        entry for entry in data["wallet_usage_log"]
        if now - datetime.fromisoformat(entry['timestamp']) < timedelta(hours=24)
    ]
    data["wallet_usage_log"] = cleaned_log
    save_wallet_data(data)

def pin_content_to_pinata(content: str, filename: str) -> str:
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        try:
            return pin_file_to_pinata(temp_path, filename)
        finally:
            os.unlink(temp_path)
    except Exception as e:
        logger.error(f"Error pinning content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def compile_contract_file(contract_path: str) -> Dict:
    file_name = Path(contract_path).stem
    with open(contract_path, "r", encoding='utf-8') as file:
        source = file.read()

    contract_match = re.search(r'contract\s+(\w+)', source)
    contract_name = contract_match.group(1) if contract_match else file_name

    solc_version = '0.8.19'
    pragma = re.search(r'pragma solidity\s+[\^>=]*(\d+\.\d+\.\d*)', source)
    if pragma:
        solc_version = pragma.group(1)
        if len(solc_version.split(".")) == 2:
            solc_version += ".0"

    install_solc(solc_version)

    compiled = compile_standard({
        "language": "Solidity",
        "sources": {f"{file_name}.sol": {"content": source}},
        "settings": {
            "optimizer": {"enabled": True, "runs": 200},
            "outputSelection": {"*": {"*": ["abi", "evm.bytecode", "evm.gasEstimates"]}}
        }
    }, solc_version=solc_version)

    compiled_contracts = compiled["contracts"][f"{file_name}.sol"]
    contract_name = list(compiled_contracts.keys())[0]
    bytecode_obj = compiled_contracts[contract_name]["evm"]["bytecode"]["object"]

    if not bytecode_obj:
        raise ValueError("Compilation failed: Bytecode is empty.")

    return {
        "contract_name": contract_name,
        "file_name": file_name,
        "bytecode": bytecode_obj,
        "abi": compiled_contracts[contract_name]["abi"],
        "gas_estimates": compiled_contracts[contract_name]["evm"]["gasEstimates"],
        "solc_version": solc_version
    }


def load_contract_abi_from_pinata(cid: str):
    url = f"https://gateway.pinata.cloud/ipfs/{cid}"
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch ABI from IPFS")
    data = response.json()
    return data.get("abi")


async def run_slither_on_content(content: str, contract_name: str):
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        try:
            return await asyncio.to_thread(run_slither, temp_path)
        finally:
            os.unlink(temp_path)
    except Exception as e:
        logger.error(f"Slither failed: {e}")
        raise


async def deploy_contract_from_content(content: str, contract_name: str):
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        try:
            return await deploy_fixed_contract(temp_path)
        finally:
            os.unlink(temp_path)
    except Exception as e:
        logger.error(f"Deployment failed: {e}")
        raise


async def process_contract_analysis(original_code: str, contract_name: str, include_llm_analysis: bool = True) -> Dict[str, Any]:
    """Enhanced contract analysis with LLM vulnerability detection"""
    
    # Get contract description
    description = await asyncio.to_thread(get_contract_description, original_code)
    
    # Pin original contract to IPFS
    original_ipfs = pin_content_to_pinata(original_code, f"{contract_name}.sol")

    # Run Slither analysis
    slither_results = await run_slither_on_content(original_code, contract_name)
    
    # LLM-based vulnerability analysis
    llm_vulnerabilities = None
    if include_llm_analysis:
        try:
            llm_vulnerabilities = await asyncio.to_thread(find_vulnerabilities, original_code)
            logger.info(f"LLM vulnerability analysis completed for {contract_name}")
        except Exception as e:
            logger.error(f"LLM vulnerability analysis failed: {e}")
            llm_vulnerabilities = {
                "error": f"LLM analysis failed: {str(e)}",
                "contract_name": contract_name,
                "total_vulnerabilities": 0,
                "overall_risk_score": 0
            }

    # Generate fixed code if vulnerabilities found
    fixed_code = fixed_uri = None
    if slither_results or (llm_vulnerabilities and llm_vulnerabilities.get('total_vulnerabilities', 0) > 0):
        try:
            fixed_code = await asyncio.to_thread(generate_fixed_contract, original_code, slither_results or "")
            fixed_ipfs = pin_content_to_pinata(fixed_code, f"{contract_name}_fixed.sol")
            fixed_uri = f"ipfs://{fixed_ipfs}"
        except Exception as e:
            logger.error(f"Failed to generate fixed contract: {e}")

    # Generate report
    report = generate_report(original_code, slither_results, fixed_code)
    report_ipfs = pin_content_to_pinata(report, f"{contract_name}_report.md")
    
    # Security checks
    sec_checks = await security_checks(original_code)

    return {
        "contract_name": contract_name,
        "contract_description": description,
        "slither_vulnerabilities": slither_results,
        "llm_vulnerabilities": llm_vulnerabilities,
        "fixed_code": fixed_code,
        "original_uri": f"ipfs://{original_ipfs}",
        "fixed_uri": fixed_uri,
        "report_uri": f"ipfs://{report_ipfs}",
        "security_checks": sec_checks,
        "analysis_summary": {
            "slither_issues_found": bool(slither_results),
            "llm_vulnerabilities_found": llm_vulnerabilities.get('total_vulnerabilities', 0) if llm_vulnerabilities else 0,
            "overall_risk_score": llm_vulnerabilities.get('overall_risk_score', 0) if llm_vulnerabilities else 0,
            "severity_breakdown": llm_vulnerabilities.get('severity_breakdown', {}) if llm_vulnerabilities else {}
        }
    }
@router.post("/audit-only/", response_model=Dict[str, Any])
async def audit_only(request: Request, file: UploadFile = File(...)):
    try:
        wallet_address = request.headers.get("wallet-address")
        if not wallet_address:
            raise HTTPException(status_code=400, detail="Wallet address is required in headers")

        # Load wallet data from JSON
        wallet_data = load_wallet_data()
        clean_old_wallet_entries(wallet_data)

        # Restriction 1: One audit per wallet
        is_whitelisted = wallet_address.lower() in WHITELISTED_WALLETS
        if not is_whitelisted:
            if wallet_address in wallet_data["wallet_audit_registry"]:
                raise HTTPException(status_code=403, detail="Your free audit trial exceeded.")

        # Restriction 2: Max 100 unique wallets per 24 hours
        unique_wallets = {entry['wallet'] for entry in wallet_data["wallet_usage_log"]}
        remaining_slots = 100 - len(unique_wallets)

        if not is_whitelisted and len(unique_wallets) >= 100:
            raise HTTPException(status_code=403, detail="Daily wallet limit reached. Please try again in 24 hours.")


        # 🔥 Log remaining wallets count live
        logger.info(f"Remaining wallets for today: {remaining_slots} out of 100")

        # Register wallet usage
        if not is_whitelisted:
    
            wallet_data["wallet_audit_registry"][wallet_address] = True
            
            wallet_data["wallet_usage_log"].append({'wallet': wallet_address, 'timestamp': datetime.utcnow().isoformat()})

        # Save back to JSON
        save_wallet_data(wallet_data)

        # Continue with your existing audit process
        original_code = (await file.read()).decode("utf-8")
        contract_name = extract_contract_name(original_code)
        audit_result = await process_contract_analysis(original_code, contract_name, include_llm_analysis=True)

        llm_vulns = audit_result.get("llm_vulnerabilities", {})
        critical_high_vulns = 0
        if llm_vulns and isinstance(llm_vulns.get('severity_breakdown'), dict):
            severity = llm_vulns.get('severity_breakdown', {})
            critical_high_vulns = severity.get('critical', 0) + severity.get('high', 0)

        deployment_ready = bool(audit_result.get("fixed_code")) and critical_high_vulns == 0

        return {
            **audit_result,
            "deployment_ready": deployment_ready,
            "message": f"Audit complete. Found {llm_vulns.get('total_vulnerabilities', 0)} vulnerabilities." if llm_vulns else "Audit complete."
        }
    except HTTPException as http_exc:
        logger.error(f"Audit failed: {http_exc.detail}")
        raise http_exc  # Return the HTTPException with your message (status code is not shown to user by default)
    except Exception as e:
        logger.error(f"Audit failed: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again later.")


@router.post("/analyze-vulnerabilities/", response_model=Dict[str, Any])
async def analyze_vulnerabilities_only(file: UploadFile = File(...)):
    """Dedicated endpoint for LLM-based vulnerability analysis only"""
    try:
        original_code = (await file.read()).decode("utf-8")
        contract_name = extract_contract_name(original_code)
        
        # Run LLM vulnerability analysis
        vulnerability_results = await asyncio.to_thread(find_vulnerabilities, original_code)
        
        return {
            "status": "success",
            "contract_name": contract_name,
            "vulnerability_analysis": vulnerability_results,
            "message": f"Found {vulnerability_results.get('total_vulnerabilities', 0)} potential vulnerabilities"
        }
    except Exception as e:
        logger.error(f"Vulnerability analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Vulnerability analysis failed: {str(e)}")


@router.post("/quick-security-scan/", response_model=Dict[str, Any])
async def quick_security_scan(file: UploadFile = File(...)):
    """Quick security scan focusing on high-level vulnerability assessment"""
    try:
        original_code = (await file.read()).decode("utf-8")
        contract_name = extract_contract_name(original_code)
        
        # Run LLM vulnerability analysis
        vulnerability_results = await asyncio.to_thread(find_vulnerabilities, original_code)
        
        # Extract key metrics
        total_vulns = vulnerability_results.get('total_vulnerabilities', 0)
        risk_score = vulnerability_results.get('overall_risk_score', 0)
        severity = vulnerability_results.get('severity_breakdown', {})
        
        # Determine risk level
        if risk_score >= 8 or severity.get('critical', 0) > 0:
            risk_level = "HIGH"
        elif risk_score >= 5 or severity.get('high', 0) > 0:
            risk_level = "MEDIUM"
        elif risk_score >= 3 or severity.get('medium', 0) > 0:
            risk_level = "LOW"
        else:
            risk_level = "MINIMAL"
        
        return {
            "status": "success",
            "contract_name": contract_name,
            "quick_scan_results": {
                "total_vulnerabilities": total_vulns,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "severity_breakdown": severity,
                "critical_issues": severity.get('critical', 0),
                "high_issues": severity.get('high', 0),
                "recommendations": [
                    vuln.get('recommendation', '') 
                    for vuln in vulnerability_results.get('vulnerabilities', [])
                    if vuln.get('severity', '').lower() in ['critical', 'high']
                ][:3]  # Top 3 critical/high recommendations
            },
            "detailed_analysis": vulnerability_results,
            "message": f"Security scan complete. Risk level: {risk_level}"
        }
    except Exception as e:
        logger.error(f"Quick security scan failed: {e}")
        raise HTTPException(status_code=500, detail=f"Security scan failed: {str(e)}")


@router.post("/get-contract-description/", response_model=Dict[str, Any])
async def get_contract_description_endpoint(file: UploadFile = File(...)):
    try:
        original_code = (await file.read()).decode("utf-8")
        contract_name = extract_contract_name(original_code)
        description = await asyncio.to_thread(get_contract_description, original_code)

        return {
            "status": "success",
            "contract_name": contract_name,
            "contract_description": description,
            "message": "Contract description generated successfully"
        }
    except Exception as e:
        logger.error(f"Failed to get contract description: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze contract: {str(e)}")


@router.post("/comprehensive-audit/", response_model=Dict[str, Any])
async def comprehensive_audit(file: UploadFile = File(...)):
    """Most comprehensive audit combining Slither + LLM analysis"""
    try:
        original_code = (await file.read()).decode("utf-8")
        contract_name = extract_contract_name(original_code)
        
        # Run comprehensive analysis
        audit_result = await process_contract_analysis(original_code, contract_name, include_llm_analysis=True)
        
        # Enhanced response with comparative analysis
        slither_issues = bool(audit_result.get("slither_vulnerabilities"))
        llm_vulns = audit_result.get("llm_vulnerabilities", {})
        llm_issues = llm_vulns.get('total_vulnerabilities', 0) > 0
        
        return {
            **audit_result,
            "audit_type": "comprehensive",
            "analysis_methods": ["slither", "llm"],
            "comparative_results": {
                "slither_found_issues": slither_issues,
                "llm_found_issues": llm_issues,
                "consensus": slither_issues and llm_issues,
                "total_unique_findings": llm_vulns.get('total_vulnerabilities', 0)
            },
            "recommendations": {
                "immediate_action_required": llm_vulns.get('severity_breakdown', {}).get('critical', 0) > 0,
                "deployment_recommended": llm_vulns.get('overall_risk_score', 10) < 5,
                "further_review_needed": llm_vulns.get('overall_risk_score', 0) >= 7
            },
            "message": "Comprehensive audit completed with both static analysis and AI-powered vulnerability detection"
        }
    except Exception as e:
        logger.error(f"Comprehensive audit failed: {e}")
        raise HTTPException(status_code=500, detail=f"Comprehensive audit failed: {str(e)}")


@router.post("/pin-metadata/", response_model=Dict[str, Any])
async def pin_metadata(metadata: Dict[str, Any]):
    try:
        cid = await async_pin_json_to_pinata(metadata)
        return {
            "status": "success",
            "cid": cid,
            "ipfs_uri": f"https://ipfs.io/ipfs/{cid}",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/nft-config/", response_model=Dict[str, Any])
async def get_nft_config():
    try:
        addr = os.getenv("NFT_CONTRACT_ADDRESS")
        cid = os.getenv("NFT_CONTRACT_ABI_CID")
        if not addr or not cid:
            raise HTTPException(status_code=404, detail="NFT config missing")
        abi = load_contract_abi_from_pinata(cid)
        return {
            "nft_contract_address": addr,
            "nft_abi": abi,
            "rpc_url": os.getenv("L1X_RPC_URL"),
            "explorer_url": os.getenv("EXPLORER_URL")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compile-only", response_model=Dict[str, Any])
async def compile_only(file: UploadFile = File(...)):
    try:
        content = (await file.read()).decode("utf-8")
        filename = file.filename or "Contract.sol"

        pragma = re.search(r'pragma solidity\s+[\^>=]*(\d+\.\d+\.\d*)', content)
        solc_version = pragma.group(1) if pragma else "0.8.19"
        if len(solc_version.split(".")) == 2:
            solc_version += ".0"

        install_solc(solc_version)

        compiled = compile_standard({
            "language": "Solidity",
            "sources": {
                filename: {
                    "content": content
                }
            },
            "settings": {
                "optimizer": {"enabled": True, "runs": 200},
                "outputSelection": {
                    "*": {"*": ["abi", "evm.bytecode"]}
                }
            }
        }, solc_version=solc_version)

        contract_name = list(compiled["contracts"][filename].keys())[0]
        contract_data = compiled["contracts"][filename][contract_name]

        return {
            "status": "success",
            "contract_name": contract_name,
            "abi": contract_data["abi"],
            "bytecode": contract_data["evm"]["bytecode"]["object"],
            "solc_version": solc_version
        }
    except Exception as e:
        logger.exception("Compilation failed")
        raise HTTPException(status_code=400, detail=f"Compilation failed: {str(e)}")


# Additional utility endpoint for vulnerability statistics
@router.get("/vulnerability-stats/", response_model=Dict[str, Any])
async def get_vulnerability_statistics():
    """Get general statistics about common vulnerability types"""
    return {
        "status": "success",
        "common_vulnerabilities": [
            "Reentrancy attacks",
            "Integer overflow/underflow", 
            "Access control issues",
            "Unchecked external calls",
            "Gas limit vulnerabilities",
            "Front-running vulnerabilities",
            "Timestamp dependence",
            "Denial of Service attacks"
        ],
        "severity_levels": {
            "critical": "Immediate action required - can lead to loss of funds",
            "high": "Significant security risk - should be fixed before deployment", 
            "medium": "Moderate risk - recommended to fix",
            "low": "Minor issue - good practice to address"
        },
        "message": "Vulnerability classification system information"
    }
    
    
@router.get("/audit-wallets/", response_model=Dict[str, Any])
async def get_audit_wallets():
    """View wallets that have performed audits"""
    try:
        wallet_data = load_wallet_data()
        clean_old_wallet_entries(wallet_data)
        return {
            "audited_wallets": list(wallet_data["wallet_audit_registry"].keys()),
            "wallet_usage_log": wallet_data["wallet_usage_log"],
            "unique_wallets_last_24_hours": len({entry['wallet'] for entry in wallet_data["wallet_usage_log"]})
        }
    except Exception as e:
        logger.error(f"Error fetching audit wallets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/minting-report")
async def create_minting_report(report: MintingReport, request: Request):
    try:
        report_dict = report.dict()
        report_dict["recipient"] = report_dict["recipient"].lower()
        
        # Check if this is a duplicate before saving
        db = get_db()
        existing = db["reports"].find_one({
            "transaction_hash": report_dict["transaction_hash"],
            "token_id": report_dict["token_id"]
        })
        
        if existing:
            return JSONResponse(
                status_code=200,
                content={
                    "message": "This NFT minting record already exists",
                    "id": str(existing["_id"]),
                    "is_duplicate": True
                }
            )
            
        inserted_id = save_minting_report(report_dict)
        return {"message": "Minting report saved", "id": inserted_id}
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to save minting report: {str(e)}"
        )

@router.get("/minting-reports/{recipient}")
async def get_reports_by_recipient(recipient: str, db: Database = Depends(get_db)):
    reports_collection = db["reports"]
    normalized_recipient = recipient.lower()
    reports = list(reports_collection.find({"recipient": normalized_recipient}))

    for report in reports:
        report["_id"] = str(report["_id"])

    return {"reports": reports}

@router.post("/audit-deployed-contract/", response_model=Dict[str, Any])
async def audit_deployed_contract(payload: Dict[str, str]):
    try:
        address = payload.get("address", "").strip()
        if not address:
            raise HTTPException(status_code=400, detail="Contract address is required.")
        
        ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
        etherscan_url = f"https://api-sepolia.etherscan.io/api"

        params = {
            "module": "contract",
            "action": "getsourcecode",
            "address": address,
            "apikey": ETHERSCAN_API_KEY
        }

        response = requests.get(etherscan_url, params=params)
        data = response.json()

        if data["status"] != "1" or not data["result"] or not data["result"][0]["SourceCode"]:
            raise HTTPException(status_code=404, detail="Verified source code not found for this contract.")

        source_code = data["result"][0]["SourceCode"]
        contract_name = extract_contract_name(source_code)

        audit_result = await process_contract_analysis(source_code, contract_name, include_llm_analysis=True)

        llm_vulns = audit_result.get("llm_vulnerabilities", {})
        critical_high_vulns = 0
        if llm_vulns and isinstance(llm_vulns.get('severity_breakdown'), dict):
            severity = llm_vulns.get('severity_breakdown', {})
            critical_high_vulns = severity.get('critical', 0) + severity.get('high', 0)

        deployment_ready = bool(audit_result.get("fixed_code")) and critical_high_vulns == 0

        return {
            **audit_result,
            "deployment_ready": deployment_ready,
            "message": f"Audit of deployed contract complete. Found {llm_vulns.get('total_vulnerabilities', 0)} vulnerabilities."
        }

    except Exception as e:
        logger.error(f"Deployed contract audit failed: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong during deployed contract audit.")
