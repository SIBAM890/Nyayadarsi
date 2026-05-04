"""
Nyayadarsi — AI-Powered Procurement Justice Platform
FastAPI Application Entry Point

न्यायदर्शी — One who sees justice

v2.0 — Production architecture with SQLAlchemy, JWT auth, service layer.
"""
import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.database import init_db
from backend.routes import tender, evaluation, collusion, builder, payment, audit, auth

# ── Structured logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nyayadarsi")


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    init_db()
    _seed_demo_user()
    logger.info("🏛️  Nyayadarsi API started — न्यायदर्शी")
    logger.info("   Version: %s", settings.APP_VERSION)
    logger.info("   Documentation available at: /docs")
    yield
    # Shutdown
    logger.info("🏛️  Nyayadarsi API shutting down")


def _seed_demo_user() -> None:
    """Create the demo officer account if it doesn't already exist."""
    from backend.core.database import SessionLocal
    from backend.models.user import User
    from backend.core.security import hash_password

    DEMO_EMAIL = "demo@nyayadarsi.gov.in"
    DEMO_PASSWORD = "nyayadarsi_demo_2026"

    try:
        with SessionLocal() as db:
            existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
            if not existing:
                demo_user = User(
                    email=DEMO_EMAIL,
                    hashed_password=hash_password(DEMO_PASSWORD),
                    full_name="Demo Officer (IAS)",
                    role="gov_officer",
                    is_active=True,
                )
                db.add(demo_user)
                db.commit()
                logger.info("   Demo user created: %s", DEMO_EMAIL)
            else:
                logger.info("   Demo user already exists: %s", DEMO_EMAIL)
    except Exception as e:
        logger.warning("   Could not seed demo user: %s", e)


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
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyaya-darshi.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Any Vercel domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# ── Global Exception Handler ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — preserves HTTP semantics."""
    # Let FastAPI handle HTTPExceptions normally (404, 401, 422, etc.)
    if isinstance(exc, HTTPException):
        raise exc
    # Log the unexpected error with full traceback for server-side debugging
    logger.error("Unhandled exception on %s %s", request.method, request.url, exc_info=exc)
    # Never leak internal details to the client in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected error occurred. Please try again.",
            "code": "INTERNAL_ERROR",
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


from fastapi.responses import Response
from backend.core.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session
from backend.services import audit_service
from backend.audit.pdf_exporter import generate_audit_pdf

# ── System Endpoints (Public) ──────────────────────────────────────────────
@app.get("/", tags=["system"])
async def root() -> dict:
    """Root endpoint — identity and status."""
    return {
        "status": "online",
        "app": "Nyayadarsi",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "tagline": "AI that sees justice — न्यायदर्शी"
    }


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
async def health_check() -> dict:
    """Health check endpoint — ensures service is operational."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT if hasattr(settings, "ENVIRONMENT") else "production",
        "uptime": "ready"
    }


# ── Direct Run ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
