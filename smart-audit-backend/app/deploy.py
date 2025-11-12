import os
import json
import hashlib
import re
import asyncio
from pathlib import Path
from typing import Dict, List

from web3 import Web3

try:
    from web3.middleware.geth_poa import geth_poa_middleware
except ImportError:
    try:
        from web3.middleware import geth_poa_middleware
    except ImportError:
        geth_poa_middleware = None

from solcx import compile_standard, install_solc

# ✅ Import centralized config
from app.config import PRIVATE_KEY, L1X_RPC_URL, EXPLORER_URL

MAX_GAS_LIMIT = 5_000_000
MAX_CONTRACT_SIZE = 24_576  # bytes (EIP-170 limit)

def get_private_key() -> str:
    if not PRIVATE_KEY:
        raise ValueError("PRIVATE_KEY not set in environment variables")
    return PRIVATE_KEY

def hash_contract_address(contract_address: str) -> str:
    if not contract_address:
        raise ValueError("Contract address is empty")
    normalized = contract_address.lower().replace("0x", "")
    return hashlib.sha256(normalized.encode()).hexdigest()

def validate_nft_metadata(metadata: Dict[str, any]) -> bool:
    required_fields = ["name", "description"]
    if not all(field in metadata for field in required_fields):
        return False
    if "image" in metadata:
        image_uri = metadata["image"]
        if not image_uri.startswith(("ipfs://", "http://", "https://")):
            return False
    return True

def save_contract_abi(contract_address: str, abi: List[Dict]) -> str:
    abi_path = os.path.join("abis", f"{contract_address}.json")
    os.makedirs("abis", exist_ok=True)
    with open(abi_path, "w") as f:
        json.dump(abi, f)
    return abi_path

async def is_nft_contract(w3: Web3, contract_address: str, abi: List[Dict]) -> bool:
    try:
        contract = w3.eth.contract(address=contract_address, abi=abi)
        is_erc721 = contract.functions.supportsInterface("0x80ac58cd").call()
        is_erc1155 = contract.functions.supportsInterface("0xd9b67a26").call()
        return is_erc721 or is_erc1155
    except:
        return False

async def security_checks(contract_source: str) -> Dict:
    checks = {
        "has_reentrancy_guard": "ReentrancyGuard" in contract_source,
        "has_safe_math": "SafeMath" in contract_source or "pragma solidity ^0.8" in contract_source or "pragma solidity >=0.8" in contract_source,
        "has_owner_controls": "onlyOwner" in contract_source,
        "has_pausable": "Pausable" in contract_source,
        "no_delegatecall": "delegatecall" not in contract_source.lower(),
        "no_tx_origin": "tx.origin" not in contract_source,
        "no_block_timestamp_dependency": "block.timestamp" not in contract_source
    }

    critical_checks = {
        "no_delegatecall": checks["no_delegatecall"],
        "no_tx_origin": checks["no_tx_origin"]
    }

    warning_checks = {
        "has_reentrancy_guard": checks["has_reentrancy_guard"],
        "has_safe_math": checks["has_safe_math"],
        "has_owner_controls": checks["has_owner_controls"],
        "has_pausable": checks["has_pausable"],
        "no_block_timestamp_dependency": checks["no_block_timestamp_dependency"]
    }

    return {
        "passed": all(critical_checks.values()),
        "details": checks,
        "warnings": [k for k, v in warning_checks.items() if not v],
        "critical_issues": [k for k, v in critical_checks.items() if not v],
        "security_score": sum(checks.values()) / len(checks)
    }

async def compile_contract(contract_path: str) -> Dict:
    file_name = Path(contract_path).stem
    with open(contract_path, "r") as file:
        contract_source = file.read()

    contract_match = re.search(r'contract\s+(\w+)', contract_source)
    actual_contract_name = contract_match.group(1) if contract_match else file_name

    solc_version = '0.8.19'
    pragma_match = re.search(r'pragma solidity\s+[\^>=]*(\d+\.\d+\.\d*)', contract_source)
    if pragma_match:
        solc_version = pragma_match.group(1)
        if len(solc_version.split('.')) == 2:
            solc_version += ".19"

    install_solc(solc_version)

    compiled_sol = compile_standard({
        "language": "Solidity",
        "sources": {f"{file_name}.sol": {"content": contract_source}},
        "settings": {
            "outputSelection": {
                "*": {"*": ["abi", "evm.bytecode", "evm.gasEstimates"]}
            },
            "optimizer": {
                "enabled": True,
                "runs": 200
            }
        }
    }, solc_version=solc_version)

    compiled_contracts = compiled_sol["contracts"][f"{file_name}.sol"]
    if actual_contract_name not in compiled_contracts:
        actual_contract_name = list(compiled_contracts.keys())[0]

    bytecode_obj = compiled_contracts[actual_contract_name]["evm"]["bytecode"]["object"]
    if not bytecode_obj:
        raise ValueError("Compilation failed: Bytecode is empty.")

    return {
        "contract_name": actual_contract_name,
        "file_name": file_name,
        "bytecode": bytecode_obj,
        "abi": compiled_contracts[actual_contract_name]["abi"],
        "gas_estimates": compiled_contracts[actual_contract_name]["evm"]["gasEstimates"],
        "solc_version": solc_version
    }

async def deploy_fixed_contract(contract_path: str, force_deploy: bool = False) -> Dict:
    try:
        with open(contract_path, "r") as file:
            contract_source = file.read()

        security_check = await security_checks(contract_source)

        if not security_check["passed"] and not force_deploy:
            raise ValueError(f"Contract has critical security issues: {security_check['critical_issues']}")

        compilation = await compile_contract(contract_path)

        if len(compilation["bytecode"]) // 2 > MAX_CONTRACT_SIZE:
            raise ValueError("Contract size exceeds EIP-170 limit")

        w3 = Web3(Web3.HTTPProvider(L1X_RPC_URL))
        if geth_poa_middleware:
            w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        private_key = get_private_key()
        account = w3.eth.account.from_key(private_key)
        contract = w3.eth.contract(abi=compilation["abi"], bytecode=compilation["bytecode"])
        nonce = w3.eth.get_transaction_count(account.address)
        constructor = contract.constructor()

        estimated_gas = constructor.estimate_gas({"from": account.address, "chainId": w3.eth.chain_id})
        if estimated_gas > MAX_GAS_LIMIT:
            raise ValueError("Estimated gas exceeds limit")

        tx = constructor.build_transaction({
            "chainId": w3.eth.chain_id,
            "gas": estimated_gas + 10000,
            "gasPrice": w3.eth.gas_price,
            "from": account.address,
            "nonce": nonce
        })

        signed_tx = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

        if not tx_receipt.contractAddress:
            raise ValueError("Deployment failed")

        contract_hash = hash_contract_address(tx_receipt.contractAddress)
        is_nft = await is_nft_contract(w3, tx_receipt.contractAddress, compilation["abi"])
        if is_nft:
            save_contract_abi(tx_receipt.contractAddress, compilation["abi"])

        result = {
            "status": "success",
            "contract_name": compilation["contract_name"],
            "contract_address": tx_receipt.contractAddress,
            "contract_hash": contract_hash,
            "transaction_hash": tx_hash.hex(),
            "gas_used": tx_receipt.gasUsed,
            "gas_estimated": estimated_gas,
            "block_number": tx_receipt.blockNumber,
            "abi": compilation["abi"],
            "solc_version": compilation["solc_version"],
            "explorer_url": f"{EXPLORER_URL}/address/{tx_receipt.contractAddress}",
            "security_analysis": security_check,
            "is_nft_contract": is_nft,
            "wallet_address": account.address
        }

        if security_check["warnings"]:
            result["deployment_warnings"] = f"Deployed with warnings: {security_check['warnings']}"

        return result

    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "contract_path": contract_path,
            "security_analysis": security_check if 'security_check' in locals() else None
        }

async def mint_nft(w3: Web3, nft_contract_address: str, nft_abi: List, recipient_address: str, token_uri: str) -> Dict:
    try:
        private_key = get_private_key()
        recipient_address = Web3.to_checksum_address(recipient_address)
        nft_contract_address = Web3.to_checksum_address(nft_contract_address)
        contract = w3.eth.contract(address=nft_contract_address, abi=nft_abi)
        account = w3.eth.account.from_key(private_key)
        nonce = await asyncio.to_thread(w3.eth.get_transaction_count, account.address)

        mint_fn = contract.functions.mintToUser(recipient_address, token_uri)
        gas_estimate = await asyncio.to_thread(mint_fn.estimate_gas, {"from": account.address})

        if gas_estimate > MAX_GAS_LIMIT:
            raise ValueError("Estimated gas exceeds limit")

        tx = mint_fn.build_transaction({
            "chainId": w3.eth.chain_id,
            "gas": gas_estimate + 10000,
            "gasPrice": w3.eth.gas_price,
            "from": account.address,
            "nonce": nonce
        })

        signed_tx = account.sign_transaction(tx)
        tx_hash = await asyncio.to_thread(w3.eth.send_raw_transaction, signed_tx.raw_transaction)
        receipt = await asyncio.to_thread(w3.eth.wait_for_transaction_receipt, tx_hash, timeout=120)

        return {
            "status": "success",
            "transaction_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed,
            "nft_contract": nft_contract_address,
            "recipient": recipient_address,
            "token_uri": token_uri
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "nft_contract": nft_contract_address,
            "recipient": recipient_address
        }