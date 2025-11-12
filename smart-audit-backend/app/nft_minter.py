from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()

class NFTMinter:
    def __init__(self, contract_address, abi_path):
        self.web3 = Web3(Web3.HTTPProvider(os.getenv("L1X_RPC_URL")))
        self.account = self.web3.eth.account.from_key(os.getenv("PRIVATE_KEY"))
        self.contract_address = Web3.to_checksum_address(contract_address)

        with open(abi_path, 'r') as f:
            abi = json.load(f)

        self.contract = self.web3.eth.contract(address=self.contract_address, abi=abi)

    def mint(self, to_address, token_uri):
        tx = self.contract.functions.mint(to_address, token_uri).build_transaction({
            'from': self.account.address,
            'nonce': self.web3.eth.get_transaction_count(self.account.address),
            'gas': 500000,
            'gasPrice': self.web3.eth.gas_price,
        })

        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return self.web3.to_hex(tx_hash)
