# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

# Centralized config variables
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
L1X_RPC_URL = os.getenv("L1X_RPC_URL")
NFT_CONTRACT_ADDRESS = os.getenv("NFT_CONTRACT_ADDRESS")
NFT_CONTRACT_ABI_CID = os.getenv("NFT_CONTRACT_ABI_CID")
L1X_RPC_URL = os.getenv("L1X_RPC_URL", "https://v2-mainnet-rpc.l1x.foundation/")
EXPLORER_URL = os.getenv("EXPLORER_URL", "https://explorer.l1x.foundation")
