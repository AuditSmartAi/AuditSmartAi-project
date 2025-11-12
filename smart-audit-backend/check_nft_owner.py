from web3 import Web3

# L1X RPC URL
rpc_url = "https://v2-mainnet-rpc.l1x.foundation/"
w3 = Web3(Web3.HTTPProvider(rpc_url))

# NFT contract address and ABI
nft_contract_address = Web3.to_checksum_address("0x6439BbbE6619aDEbe0f74C70757Fd5842d651a24")
nft_contract = w3.eth.contract(address=nft_contract_address, abi=erc721_abi)

# Token ID to check
token_id = 4

# Check ownership
try:
    owner = nft_contract.functions.ownerOf(token_id).call()
    print(f"✅ Token ID {token_id} is owned by: {owner}")
except Exception as e:
    print(f"❌ Error fetching owner for Token ID {token_id}: {e}")
