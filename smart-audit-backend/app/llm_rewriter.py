import os
import json
import logging
import re
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenRouter API key from environment variable
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in .env file")

# OpenRouter endpoint and headers
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

# Default model name
DEFAULT_MODEL = "openai/gpt-4o-mini"


def query_openrouter(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Query the OpenRouter API with the given prompt and return the generated text.
    """
    try:
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful smart contract auditor."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2048
        }
        logger.info("Sending request to OpenRouter API...")
        response = requests.post(OPENROUTER_URL, headers=HEADERS, json=data)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"OpenRouter query failed: {e}")
        raise


def extract_contract_name(solidity_code: str) -> str:
    contract_name_match = re.search(r'contract\s+(\w+)', solidity_code)
    return contract_name_match.group(1) if contract_name_match else "Contract"


def find_vulnerabilities(solidity_code: str) -> dict:
    """
    Analyze the smart contract and identify potential vulnerabilities.
    Returns a structured dictionary with vulnerability details.
    """
    contract_name = extract_contract_name(solidity_code)
    
    prompt = f"""Analyze the following Solidity smart contract and identify ALL potential security vulnerabilities. 

Please structure your response as a JSON object with the following format:
{{
    "contract_name": "{contract_name}",
    "total_vulnerabilities": <number>,
    "severity_breakdown": {{
        "critical": <number>,
        "high": <number>,
        "medium": <number>,
        "low": <number>
    }},
    "vulnerabilities": [
        {{
            "title": "Vulnerability Name",
            "severity": "Critical/High/Medium/Low",
            "description": "Detailed description of the vulnerability",
            "location": "Function/Line where found",
            "impact": "Potential impact description",
            "recommendation": "How to fix this vulnerability"
        }}
    ],
    "overall_risk_score": <1-10>,
    "summary": "Brief overall security assessment"
}}

Look for common vulnerabilities including but not limited to:
- Reentrancy attacks
- Integer overflow/underflow
- Access control issues
- Unchecked external calls
- Gas limit issues
- Front-running vulnerabilities
- Timestamp dependence
- Uninitialized storage pointers
- Denial of Service attacks
- Logic errors

Contract code:
```solidity
{solidity_code}
```

Please return ONLY the JSON object, no additional text."""

    try:
        vulnerability_response = query_openrouter(prompt)
        
        # Try to parse JSON response
        try:
            # Extract JSON if wrapped in code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', vulnerability_response, re.DOTALL)
            if json_match:
                vulnerability_data = json.loads(json_match.group(1))
            else:
                vulnerability_data = json.loads(vulnerability_response)
            
            return vulnerability_data
            
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response, returning raw text")
            # Fallback: return structured data with raw response
            return {
                "contract_name": contract_name,
                "total_vulnerabilities": "Unknown",
                "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "vulnerabilities": [],
                "overall_risk_score": "Unknown",
                "summary": vulnerability_response,
                "raw_response": vulnerability_response
            }
            
    except Exception as e:
        logger.error(f"Failed to analyze vulnerabilities: {e}")
        return {
            "contract_name": contract_name,
            "total_vulnerabilities": 0,
            "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "vulnerabilities": [],
            "overall_risk_score": 0,
            "summary": f"Vulnerability analysis failed: {str(e)}",
            "error": str(e)
        }


def get_contract_description(solidity_code: str) -> str:
    """
    Analyze the smart contract and provide a detailed description of what it does.
    """
    contract_name = extract_contract_name(solidity_code)
    
    prompt = f"""Analyze the following Solidity smart contract and provide a clear, comprehensive description of what it does. Focus on:

1. Main purpose and functionality
2. Key features and capabilities
3. Who would use this contract and why
4. What problems it solves
5. How users interact with it

Please provide a user-friendly description that explains the contract's purpose in plain English.

Contract code:
```solidity
{solidity_code}
```

Provide the description in a clear, concise paragraph format."""

    try:
        description = query_openrouter(prompt)
        return description
    except Exception as e:
        logger.error(f"Failed to get contract description: {e}")
        return f"Unable to generate description for {contract_name} contract due to analysis error."


def generate_fixed_contract(original_code: str, slither_results: str) -> str:
    """
    Send the contract to the LLM for a basic audit and return a corrected version.
    Preserves the original contract name and pragma directive.
    """
    if not original_code.strip():
        raise ValueError("Original Solidity code cannot be empty")

    # Extract original contract name and pragma
    original_contract_name = extract_contract_name(original_code)
    pragma_match = re.search(r'pragma\s+solidity\s+([^;]+);', original_code)
    pragma_directive = pragma_match.group(0) if pragma_match else "pragma solidity ^0.8.0;"

    prompt = f"""Please audit the following Solidity smart contract and provide a corrected version that:
1. Addresses any vulnerabilities or issues found
2. Maintains all original functionality
3. Preserves the original contract name "{original_contract_name}"
4. Uses the same or compatible Solidity version

IMPORTANT: Return ONLY the corrected Solidity code, wrapped inside triple backticks with `solidity` syntax highlighting, without any additional explanation or comments.

Original contract:
```solidity
{original_code}
```"""

    llm_response = query_openrouter(prompt)
    # logger.info(f"LLM raw response:\n{llm_response[:2000]}")

    # Extract Solidity code block if present
    code_blocks = re.findall(r'```solidity(.*?)```', llm_response, re.DOTALL)
    if not code_blocks:
        code_blocks = re.findall(r'```(.*?)```', llm_response, re.DOTALL)

    fixed_code = code_blocks[0].strip() if code_blocks else llm_response.strip()

    # Validate presence of pragma and contract keywords
    if not ("pragma solidity" in fixed_code and "contract" in fixed_code):
        logger.warning("Extracted fixed code does not appear to be valid Solidity. Response was:\n" + llm_response)
        raise ValueError("LLM response does not contain valid Solidity code")

    # Enforce original contract name
    fixed_code = re.sub(
        r'contract\s+\w+',
        f'contract {original_contract_name}',
        fixed_code,
        count=1
    )

    # Enforce pragma directive
    if not re.search(r'pragma\s+solidity\s+[^;]+;', fixed_code):
        fixed_code = pragma_directive + "\n" + fixed_code

    return fixed_code


def get_code_change_summary(original_code: str, fixed_code: str) -> str:
    """
    Ask the LLM to explain the changes made when rewriting the contract.
    """
    original_contract_name = extract_contract_name(original_code)

    prompt = f"""You previously fixed the {original_contract_name} contract. Please summarize:
1. What vulnerabilities were addressed
2. What changes were made
3. Why these changes improve security

Original contract:
```solidity
{original_code}

{fixed_code}
```"""
    return query_openrouter(prompt)

def save_solidity_code(solidity_code: str, filename: str):
    os.makedirs("contracts", exist_ok=True)
    filepath = os.path.join("contracts", f"{filename}.sol")
    with open(filepath, "w", encoding="utf-8") as file:
        file.write(solidity_code)
    logger.info(f"Saved contract to {filepath}")


def save_vulnerability_report(vulnerability_data: dict, filename: str):
    """
    Save vulnerability analysis results to a JSON file.
    """
    os.makedirs("reports", exist_ok=True)
    filepath = os.path.join("reports", f"{filename}_vulnerability_report.json")
    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(vulnerability_data, file, indent=2)
    logger.info(f"Saved vulnerability report to {filepath}")


def get_security_summary(code: str) -> str:
    """
    Analyze and summarize security risks for a given Solidity code.
    """
    contract_name = extract_contract_name(code)
    prompt = f"""Analyze the security of the {contract_name} contract below and:
1. List potential vulnerabilities
2. Rate overall security (1-10)
3. Suggest improvements

Contract code:
```solidity
{code}
```"""
    return query_openrouter(prompt)


def get_optimization_suggestions(solidity_code: str) -> list:
    """
    Get optimization suggestions based on Solidity code patterns.
    """
    suggestions = []
    if "require(" in solidity_code:
        suggestions.append("Consider custom error messages for require statements to save gas")
    if "for (" in solidity_code:
        suggestions.append("Optimize loops by caching array length and using unchecked when safe")
    if "public" in solidity_code:
        suggestions.append("Mark constants as private to save deployment gas")
    return suggestions


def get_best_practice_checklist(solidity_code: str) -> list:
    """
    Get best practice checklist for Solidity code.
    """
    checklist = []
    if "pragma solidity ^0.8." not in solidity_code:
        checklist.append("Upgrade to Solidity 0.8.x for built-in overflow protection")
    if "// SPDX-License-Identifier:" not in solidity_code:
        checklist.append("Add SPDX license identifier at the top of the file")
    if "reentrancy" in solidity_code.lower():
        checklist.append("Consider adding reentrancy guards for functions that make external calls")
    return checklist


if __name__ == "__main__":
    # Example vulnerable Solidity contract
    original_solidity_code = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.7.0;

    contract Vulnerable {
        uint public value;
        mapping(address => uint) public balances;

        function setValue(uint _value) public {
            value = _value;
        }

        function withdraw() public {
            uint balance = balances[msg.sender];
            (bool success, ) = msg.sender.call{value: balance}("");
            require(success);
            balances[msg.sender] = 0;
        }
    }
    """

    try:
        # Get contract description
        description = get_contract_description(original_solidity_code)
        print(f"\nContract Description:\n{description}")

        # Find vulnerabilities - NEW FUNCTION
        print("\n" + "="*50)
        print("VULNERABILITY ANALYSIS")
        print("="*50)
        
        vulnerability_results = find_vulnerabilities(original_solidity_code)
        
        # Display vulnerability summary
        print(f"\nContract: {vulnerability_results.get('contract_name', 'Unknown')}")
        print(f"Total Vulnerabilities Found: {vulnerability_results.get('total_vulnerabilities', 0)}")
        print(f"Overall Risk Score: {vulnerability_results.get('overall_risk_score', 0)}/10")
        
        # Display severity breakdown
        severity = vulnerability_results.get('severity_breakdown', {})
        if severity:
            print(f"\nSeverity Breakdown:")
            print(f"  Critical: {severity.get('critical', 0)}")
            print(f"  High: {severity.get('high', 0)}")
            print(f"  Medium: {severity.get('medium', 0)}")
            print(f"  Low: {severity.get('low', 0)}")
        
        # Display individual vulnerabilities
        vulnerabilities = vulnerability_results.get('vulnerabilities', [])
        if vulnerabilities:
            print(f"\nDetailed Vulnerabilities:")
            for i, vuln in enumerate(vulnerabilities, 1):
                print(f"\n{i}. {vuln.get('title', 'Unknown Vulnerability')}")
                print(f"   Severity: {vuln.get('severity', 'Unknown')}")
                print(f"   Location: {vuln.get('location', 'Unknown')}")
                print(f"   Description: {vuln.get('description', 'No description available')}")
                print(f"   Impact: {vuln.get('impact', 'Unknown impact')}")
                print(f"   Recommendation: {vuln.get('recommendation', 'No recommendation available')}")
        
        print(f"\nSummary: {vulnerability_results.get('summary', 'No summary available')}")
        
        # Save vulnerability report
        contract_name = extract_contract_name(original_solidity_code)
        save_vulnerability_report(vulnerability_results, contract_name)

        # Generate fixed contract code
        print("\n" + "="*50)
        print("GENERATING FIXED CONTRACT")
        print("="*50)
        
        fixed_code = generate_fixed_contract(original_solidity_code, "")

        # Save the fixed contract to file
        save_solidity_code(fixed_code, contract_name)

        # Get and print change summary
        change_summary = get_code_change_summary(original_solidity_code, fixed_code)
        print("\nChange Summary:\n", change_summary)

        # Get and print security summary
        security_summary = get_security_summary(fixed_code)
        print("\nSecurity Summary:\n", security_summary)

        # Get optimization suggestions
        optimizations = get_optimization_suggestions(fixed_code)
        if optimizations:
            print("\nOptimization Suggestions:")
            for suggestion in optimizations:
                print(f"- {suggestion}")

        # Get best practice checklist
        best_practices = get_best_practice_checklist(fixed_code)
        if best_practices:
            print("\nBest Practice Checklist:")
            for item in best_practices:
                print(f"- {item}")

    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise
