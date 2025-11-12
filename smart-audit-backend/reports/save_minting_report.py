from datetime import datetime
from utils.connect_db import get_db
from pymongo import UpdateOne
from pymongo.errors import DuplicateKeyError  # Add this import
from bson import ObjectId

def save_minting_report(mintingResults):
    db = get_db()
    reports_collection = db["reports"]
    
    # Create a unique compound index if it doesn't exist
    reports_collection.create_index(
        [("transaction_hash", 1), ("token_id", 1)],
        unique=True,
        name="tx_hash_token_id_unique"
    )
    
    report_doc = {
        "metadata": mintingResults["metadata"],
        "token_id": mintingResults["token_id"],
        "token_uri": mintingResults["token_uri"],
        "nft_contract": mintingResults["nft_contract"],
        "transaction_hash": mintingResults["transaction_hash"],
        "block_number": mintingResults["block_number"],
        "gas_used": mintingResults["gas_used"],
        "recipient": mintingResults["recipient"].lower(),  # Normalize to lowercase
        "created_at": datetime.utcnow()
    }
    
    try:
        result = reports_collection.insert_one(report_doc)
        return str(result.inserted_id)
    except DuplicateKeyError:  # Use the imported exception class
        # Document already exists
        existing = reports_collection.find_one({
            "transaction_hash": report_doc["transaction_hash"],
            "token_id": report_doc["token_id"]
        })
        return str(existing["_id"])