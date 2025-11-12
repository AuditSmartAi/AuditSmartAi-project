import sys
from web3 import Web3
import json

# --- Configuration ---

# Replace with your RPC URL, e.g. L1X testnet RPC
RPC_URL = "https://v2-mainnet-rpc.l1x.foundation/"

# NFT contract address (the one that minted the NFT)
NFT_CONTRACT_ADDRESS = "0x6439BbbE6619aDEbe0f74C70757Fd5842d651a24"

# ABI for ERC721 (minimal for ownerOf)
ERC721_ABI = json.loads("""
[
  {
    "constant":true,
    "inputs":[{"name":"tokenId","type":"uint256"}],
    "name":"ownerOf",
    "outputs":[{"name":"owner","type":"address"}],
    "payable":false,
    "stateMutability":"view",
    "type":"function"
  }
]
""")

# --- Script ---

def check_nft_owner(token_id: int, expected_owner: str):
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():

        print("Failed to connect to blockchain RPC.")
        return False

    nft_contract = w3.eth.contract(address=NFT_CONTRACT_ADDRESS, abi=ERC721_ABI)

    try:
        owner = nft_contract.functions.ownerOf(token_id).call()
        print(f"Owner of token ID {token_id}: {owner}")
        if owner.lower() == expected_owner.lower():
            print("✅ NFT is owned by the expected address!")
            return True
        else:
            print(f"❌ NFT owner does NOT match expected address: {expected_owner}")
            return False
    except Exception as e:
        print(f"Error fetching owner: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python check_nft_owner.py <token_id> <expected_owner_address>")
        print("Example: python check_nft_owner.py 19 0xb97fcdcd02fe2b50d8014b80080c904845e027f1")
        sys.exit(1)

    token_id_arg = int(sys.argv[1])
    expected_owner_arg = sys.argv[2]

    check_nft_owner(token_id_arg, expected_owner_arg)
