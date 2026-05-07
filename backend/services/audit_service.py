"""
Audit Service
Business logic for audit trail retrieval and PDF export.
"""
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.audit.sha256_logger import get_trail, get_full_trail
from backend.audit.pdf_exporter import generate_audit_pdf


def get_audit_trail(db: Session, entity_id: str, limit: int = 50, offset: int = 0) -> dict[str, Any]:
    """Get paginated audit entries for an entity."""
    trail = get_trail(db, entity_id, limit=limit, offset=offset)
    return {
        "entity_id": entity_id,
        "total_entries": len(trail),
        "limit": limit,
        "offset": offset,
        "trail": trail,
    }


def get_all_audit_entries(db: Session, limit: int = 50, offset: int = 0) -> dict[str, Any]:
    """Get all audit entries paginated."""
    trail = get_full_trail(db, limit=limit, offset=offset)
    return {
        "total_entries": len(trail),
        "limit": limit,
        "offset": offset,
        "trail": trail,
    }


def export_audit_pdf(db: Session, entity_id: str) -> bytes:
    """
    Generate court-admissible PDF audit report.

    Raises:
        HTTPException 404: If no audit entries found.
    """
    trail = get_trail(db, entity_id)

    if not trail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": "No audit entries found for this entity", "code": "NO_AUDIT_DATA"},
        )

    return generate_audit_pdf(
        entity_id=entity_id,
        audit_trail=trail,
        tender_info={"Entity ID": entity_id, "Report Type": "Audit Trail Export"},
    )
