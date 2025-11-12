from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import router
import os
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from fastapi import FastAPI
from app.routers import nft

API_BASE_URL = os.getenv("VITE_API_BASE_URL", "http://localhost:8000")

# Initialize logging
def setup_logging():
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            RotatingFileHandler(
                os.path.join(log_dir, "audit_smart.log"),
                maxBytes=1024 * 1024 * 5,  # 5MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )

setup_logging()
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Audit Smart AI API",
    description="API for smart contract auditing with AI-powered analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.include_router(nft.router, prefix="/api/v1/nft")

# Include your API router
app.include_router(router, prefix="/api/v1")

# Create required directories
required_dirs = ["reports", "contracts", "logs", "artifacts"]
for dir_name in required_dirs:
    os.makedirs(dir_name, exist_ok=True)
    logger.info(f"Ensured directory exists: {dir_name}")

# Health check endpoint
@app.get("/", include_in_schema=False)
async def health_check():
    return {
        "status": "running",
        "service": "Audit Smart AI",
        "version": "1.0.0",
        "endpoints": {
            "audit": "/api/v1/audit",
            "audit_and_deploy": "/api/v1/audit-and-deploy",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

@app.on_event("startup")
async def startup_event():
    logger.info("Audit Smart API service starting up")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Audit Smart API service shutting down")