import logging
logging.basicConfig(level=logging.DEBUG)

from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://v2-mainnet-rpc.l1x.foundation/"))

print("Is connected:", w3.is_connected())

try:
    block = w3.eth.block_number
    print("Latest block number:", block)
except Exception as e:
    print("Error fetching block number:", e)
