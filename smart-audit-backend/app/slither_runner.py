import subprocess
import json
import os
import re

def extract_solidity_version(contract_path: str) -> str:
    # Extract Solidity version from contract
    with open(contract_path, "r", encoding="utf-8") as file:
        for line in file:
            if "pragma solidity" in line:
                match = re.search(r"pragma solidity\s+[\^>=<]*\s*([\d.]+);", line)
                if match:
                    return match.group(1)
    return None

def run_slither(contract_path: str):
    try:
        # Set environment to use UTF-8
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'

        result = subprocess.run(
            ["slither", contract_path, "--json", "-"],  # "-" makes slither print JSON to stdout
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env
        )

        if result.returncode != 0:
            return {"error": "Slither execution failed", "details": result.stderr.strip()}

        # Parse JSON directly from stdout
        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            return {"error": "Failed to parse Slither JSON output", "details": result.stdout[:1000]}

        raw_issues = data.get("results", {}).get("detectors", [])
        parsed_issues = []
        for issue in raw_issues:
            parsed_issues.append({
                "vulnerability": issue.get("check"),
                "description": issue.get("description"),
                "impact": issue.get("impact"),
                "confidence": issue.get("confidence"),
                "severity": issue.get("impact", "Medium"),
                "recommendation": issue.get("recommendation", ""),
                "line": issue.get("elements", [{}])[0].get("source_mapping", {}).get("lines", [None])[0],
                "contract": issue.get("elements", [{}])[0].get("contract", "Unknown"),
            })

        return parsed_issues

    except UnicodeDecodeError as e:
        return {"error": "Unicode encoding error", "details": f"Failed to decode output: {str(e)}"}
    except Exception as e:
        return {"error": "Exception occurred", "details": str(e)}
