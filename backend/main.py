"""
Nyayadarsi — AI-Powered Procurement Justice Platform
FastAPI Application Entry Point

न्यायदर्शी — One who sees justice

v2.0 — Production architecture with SQLAlchemy, JWT auth, service layer.
"""
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.database import init_db
from backend.routes import tender, evaluation, collusion, builder, payment, audit, auth


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    init_db()
    print("🏛️  Nyayadarsi API started — न्यायदर्शी")
    print(f"   Version: {settings.APP_VERSION}")
    print(f"   Docs: http://localhost:8000/docs")
    yield
    # Shutdown
    print("🏛️  Nyayadarsi API shutting down")


# ── App Factory ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS ─────────────────────────────────────────────────────────────────────
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


# ── Global Exception Handler ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — returns consistent error shape."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error",
            "code": "INTERNAL_ERROR",
            "detail": str(exc) if settings.APP_VERSION.startswith("2") else None,
        },
    )


# ── Mount Routers ────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(tender.router)
app.include_router(evaluation.router)
app.include_router(collusion.router)
app.include_router(builder.router)
app.include_router(payment.router)
app.include_router(audit.router)


# ── Health Check (Public — No Auth) ──────────────────────────────────────────
@app.get("/api/health", tags=["system"])
async def health_check() -> dict:
    """Health check endpoint — no authentication required."""
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "name": "Nyayadarsi",
        "tagline": "AI that sees justice — न्यायदर्शी",
    }


# ── Direct Run ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
