"""
Audit Routes for Nyayadarsi
Provides access to the immutable audit trail and court-admissible PDF export.
"""
from fastapi import APIRouter
from fastapi.responses import Response

from backend.audit.sha256_logger import get_trail, get_full_trail
from backend.audit.pdf_exporter import generate_audit_pdf

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("/{entity_id}/trail")
async def get_audit_trail(entity_id: str):
    """Get all audit entries for an entity, chronologically ordered."""
    trail = get_trail(entity_id)
    return {
        "entity_id": entity_id,
        "total_entries": len(trail),
        "trail": trail,
    }


@router.get("/all")
async def get_all_audit_entries():
    """Get all audit entries (limited to 1000)."""
    trail = get_full_trail()
    return {
        "total_entries": len(trail),
        "trail": trail,
    }


@router.get("/{entity_id}/export-pdf")
async def export_audit_pdf(entity_id: str):
    """Generate and download court-admissible PDF audit report."""
    trail = get_trail(entity_id)

    if not trail:
        return Response(
            content='{"error": true, "message": "No audit entries found for this entity"}',
            media_type="application/json",
            status_code=404,
        )

    pdf_bytes = generate_audit_pdf(
        entity_id=entity_id,
        audit_trail=trail,
        tender_info={"Entity ID": entity_id, "Report Type": "Audit Trail Export"},
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=nyayadarsi_audit_{entity_id}.pdf"
        },
    )
