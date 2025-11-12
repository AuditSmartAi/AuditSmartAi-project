import os
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from app.nft_minter import NFTMinter
from typing import Dict, Optional, Any
import logging
from pydantic import BaseModel


router = APIRouter()
logger = logging.getLogger(__name__)

class MintRequestModel(BaseModel):
    contract_address: str
    recipient: str
    metadata: Dict[str, Any]
    token_uri: Optional[str] = None
    abi_path: Optional[str] = None

@router.post("/mint")
async def mint_nft(request: MintRequestModel = Body(...)):
    """Endpoint to mint NFTs"""
    try:
        minter = NFTMinter()
        result = await minter.mint(
            request.contract_address,
            request.recipient,
            request.metadata,
            request.token_uri,
            request.abi_path
        )
        explorer_url = os.getenv("EXPLORER_URL")
        tx_hash = result.get("tx_hash", "")
        return JSONResponse({
            "status": "success",
            "data": result,
            "explorer_url": f"{explorer_url}/tx/{tx_hash}" if explorer_url and tx_hash else None
        })
    except Exception as e:
        logger.error(f"NFT minting failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
