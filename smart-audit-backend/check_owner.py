from web3 import Web3
import json

# Load contract ABI
with open("D:/AuditSmart/L1XEVMERC20/artifacts/contracts/MyNFT.sol/MyNFT.json") as f:
    contract_data = json.load(f)
abi = contract_data['abi']

# Connect to L1X testnet
w3 = Web3(Web3.HTTPProvider("https://v2-mainnet-rpc.l1x.foundation/"))
contract_address = Web3.to_checksum_address("0x3d3DcCB39c37d80c93Fde207c36b9a402Fc57746")
contract = w3.eth.contract(address=contract_address, abi=abi)

# Your wallet address
owner_address = "0xB97fcDcd02fe2B50D8014b80080c904845e027F1"

# Check token balance
balance = contract.functions.balanceOf(owner_address).call()
print(f"NFTs owned: {balance}")

# Try querying all token IDs (works if your contract has tokenOfOwnerByIndex or similar)
for i in range(balance):
    try:
        token_id = contract.functions.tokenOfOwnerByIndex(owner_address, i).call()
        print(f"Token ID {i}: {token_id}")
    except Exception as e:
        print(f"Could not get token ID at index {i}: {e}")
