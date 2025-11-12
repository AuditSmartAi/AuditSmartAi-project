from fastapi import APIRouter, Depends, Request
from utils.connect_db import get_db
from reports.save_minting_report import save_minting_report
from pymongo.database import Database

router = APIRouter()

@router.post("/minting-report")
async def create_minting_report(request: Request, db: Database = Depends(get_db)):
    body = await request.json()
    inserted_id = save_minting_report(body)
    return {"message": "Minting report saved", "id": str(inserted_id)}
