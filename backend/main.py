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
    
    # Warm DB (wakes up Neon Postgres from cold start)
    from sqlalchemy import text
    from backend.core.database import engine
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("   DB Connection Warmed")
    except Exception as e:
        logger.warning("   DB Warm failed: %s", e)

    import os
    import re

    def sanitize_url(url: str) -> str:
        """Redact password from connection strings."""
        return re.sub(r':([^:@]+)@', ':***@', url)

    _seed_demo_user()
    logger.info("🏛️  Nyayadarsi API started — न्यायदर्शी")
    logger.info("   Version: %s", settings.APP_VERSION)
    logger.info("   Database: %s", sanitize_url(settings.DATABASE_URL))
    logger.info("   Documentation available at: /docs")
    yield
    # Shutdown
    logger.info("🏛️  Nyayadarsi API shutting down")


def _seed_demo_user() -> None:
    """Create the demo officer account if it doesn't already exist."""
    from backend.core.database import SessionLocal
    from backend.models.user import User
    from backend.core.security import hash_password

    import os
    
    # Use environment variables for demo credentials in production
    DEMO_EMAIL = os.getenv("DEMO_OFFICER_EMAIL", "demo@nyayadarsi.gov.in")
    DEMO_PASSWORD = os.getenv("DEMO_OFFICER_PASSWORD", "nyayadarsi_demo_2026")

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


# ── CSRF Protection ─────────────────────────────────────────────────────────
@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    """
    Simple CSRF protection for state-changing methods.
    Requires X-CSRF-Token header for POST/PUT/DELETE.
    """
    if request.method in ["POST", "PUT", "DELETE"]:
        # Exclude login/health from CSRF if needed, but safer to include all
        if not request.headers.get("X-CSRF-Token"):
            logger.warning(f"CSRF blocked: Missing token for {request.method} {request.url}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": True,
                    "message": "CSRF verification failed. Missing X-CSRF-Token header.",
                    "code": "CSRF_ERROR"
                }
            )
    return await call_next(request)


# ── CORS ─────────────────────────────────────────────────────────────────────
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyaya-darshi.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com)",  # Vercel or Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import uuid
import time

# ── Structured Logging & Request IDs ──────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Inject X-Request-ID and X-Process-Time headers."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    response.headers["X-Request-ID"] = request_id
    return response


from collections import defaultdict

# ── Simple In-Memory Rate Limiting ──────────────────────────────────────────
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW_SECONDS = 60
_rate_limit_store = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Simple sliding window rate limiter."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Filter out old requests
    _rate_limit_store[client_ip] = [t for t in _rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": True,
                "message": "Too many requests. Please try again in a minute.",
                "code": "RATE_LIMIT_EXCEEDED"
            }
        )
    
    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


# ── Global Exception Handler ────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — preserves HTTP semantics."""
    request_id = getattr(request.state, "request_id", "unknown")
    
    # Let FastAPI handle HTTPExceptions normally (404, 401, 422, etc.)
    if isinstance(exc, HTTPException):
        # Ensure our standard format even for built-in HTTPExceptions
        detail = exc.detail
        if isinstance(detail, str):
            detail = {"message": detail}
            
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": detail.get("message", "Request failed"),
                "code": detail.get("code", "HTTP_ERROR"),
                "request_id": request_id,
            }
        )
        
    # Log the unexpected error with request ID
    logger.error(
        "[%s] Unhandled exception on %s %s", 
        request_id, request.method, request.url, 
        exc_info=exc
    )
    
    # Never leak internal details to the client in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected error occurred. Please try again.",
            "code": "INTERNAL_ERROR",
            "request_id": request_id,
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
