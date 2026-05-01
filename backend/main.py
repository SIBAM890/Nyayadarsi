"""
Nyayadarsi — AI-Powered Procurement Justice Platform
FastAPI Application Entry Point

न्यायदर्शी — One who sees justice
"""
import sys
from pathlib import Path

# Ensure backend is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.config import APP_VERSION
from backend.routes import tender, evaluation, collusion, builder, payment, audit

# Create FastAPI app
app = FastAPI(
    title="Nyayadarsi API",
    description="AI-Powered Procurement Justice Platform — न्यायदर्शी",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend on Vercel and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://nyaya-darshi.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(tender.router)
app.include_router(evaluation.router)
app.include_router(collusion.router)
app.include_router(builder.router)
app.include_router(payment.router)
app.include_router(audit.router)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()
    print("🏛️  Nyayadarsi API started — न्यायदर्शी")
    print(f"   Version: {APP_VERSION}")
    print(f"   Docs: http://localhost:8000/docs")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": APP_VERSION,
        "name": "Nyayadarsi",
        "tagline": "AI that sees justice — न्यायदर्शी",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
