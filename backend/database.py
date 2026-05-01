"""
Nyayadarsi Database (Legacy Compatibility Shim)
Redirects to the new core.database module.

The old raw sqlite3 get_db() context manager is preserved for any
code that hasn't been migrated yet, but init_db() now uses SQLAlchemy.
"""
from backend.core.database import init_db, get_db as _get_db_sqlalchemy, SessionLocal

# Re-export the SQLAlchemy init
__all__ = ["init_db", "get_db"]


def get_db():
    """
    Legacy compatibility — returns a SQLAlchemy session.
    New code should use `Depends(backend.core.database.get_db)` instead.
    """
    return _get_db_sqlalchemy()
