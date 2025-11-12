import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")

def pin_json_to_pinata(json_data: dict) -> str:
    """Pin JSON data to IPFS via Pinata"""
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET,
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(json_data))
    
    if response.status_code == 200:
        ipfs_hash = response.json()["IpfsHash"]
        return ipfs_hash
    else:
        raise Exception(f"Failed to pin JSON to Pinata: {response.text}")

def pin_file_to_pinata(file_path: str, filename: str) -> str:
    """Pin a file to IPFS via Pinata"""
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    # Prepare the file for upload
    with open(file_path, 'rb') as file:
        files = {
            'file': (filename, file, 'application/octet-stream')
        }
        
        # Optional metadata
        pinata_options = {
            'cidVersion': 1,
        }
        
        pinata_metadata = {
            'name': filename,
            'keyvalues': {
                'type': 'smart_contract' if filename.endswith('.sol') else 'audit_report',
                'uploaded_via': 'AuditSmart'
            }
        }
        
        data = {
            'pinataOptions': json.dumps(pinata_options),
            'pinataMetadata': json.dumps(pinata_metadata)
        }
        
        response = requests.post(url, headers=headers, files=files, data=data)
    
    if response.status_code == 200:
        ipfs_hash = response.json()["IpfsHash"]
        return ipfs_hash
    else:
        raise Exception(f"Failed to pin file to Pinata: {response.text}")

def get_pinned_content(ipfs_hash: str) -> dict:
    """Get information about pinned content from Pinata"""
    url = f"https://api.pinata.cloud/data/pinList?hashContains={ipfs_hash}"
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get pinned content info: {response.text}")

def unpin_content(ipfs_hash: str) -> bool:
    """Unpin content from Pinata (optional cleanup function)"""
    url = f"https://api.pinata.cloud/pinning/unpin/{ipfs_hash}"
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 200:
        return True
    else:
        raise Exception(f"Failed to unpin content: {response.text}")

def retrieve_json_from_ipfs(ipfs_hash: str) -> dict:
    """Retrieve JSON content from IPFS via Pinata gateway"""
    url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to retrieve JSON from IPFS: {response.text}")

def retrieve_file_from_ipfs(ipfs_hash: str) -> str:
    """Retrieve file content from IPFS via Pinata gateway"""
    url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Failed to retrieve file from IPFS: {response.text}")