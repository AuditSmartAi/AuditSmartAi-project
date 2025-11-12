# In your report_model.py or equivalent
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class MintingReport(BaseModel):
    metadata: Dict[str, Any]
    token_id: str
    token_uri: str
    nft_contract: str
    transaction_hash: str
    block_number: int
    gas_used: int
    recipient: str
    created_at: datetime = datetime.utcnow()