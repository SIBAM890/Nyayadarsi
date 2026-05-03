"""
Nyayadarsi Database Layer
SQLAlchemy ORM with SQLite WAL mode.
Provides engine, session factory, Base, and FastAPI dependency.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from typing import Generator

from backend.core.config import settings


# ── SQLite-specific pragmas ──────────────────────────────────────────────────
def _set_sqlite_pragmas(dbapi_conn, connection_record) -> None:  # type: ignore[no-untyped-def]
    """Enable WAL mode and foreign keys for every SQLite connection."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# ── Engine ───────────────────────────────────────────────────────────────────
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

# Attach SQLite pragmas
if "sqlite" in settings.DATABASE_URL:
    event.listen(engine, "connect", _set_sqlite_pragmas)


# ── Session Factory ──────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Declarative Base ─────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── Database Initialization ──────────────────────────────────────────────────
def init_db() -> None:
    """Create all tables from ORM model metadata."""
    # Import all models so they register with Base.metadata
    import backend.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


# ── Dependency ───────────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a database session, auto-closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
