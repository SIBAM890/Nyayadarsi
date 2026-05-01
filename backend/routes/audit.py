"""
Audit Routes for Nyayadarsi
Provides access to the immutable audit trail and court-admissible PDF export.
Thin route layer — delegates to audit_service.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.audit import AuditTrailResponse
from backend.services import audit_service

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get(
    "/{entity_id}/trail",
    response_model=AuditTrailResponse,
    summary="Get entity audit trail",
)
async def get_audit_trail(
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuditTrailResponse:
    """Get all audit entries for an entity, chronologically ordered."""
    return audit_service.get_audit_trail(db, entity_id)


@router.get(
    "/all",
    response_model=AuditTrailResponse,
    summary="Get all audit entries",
)
async def get_all_audit_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuditTrailResponse:
    """Get all audit entries (limited to 1000)."""
    return audit_service.get_all_audit_entries(db)


@router.get(
    "/{entity_id}/export-pdf",
    summary="Export audit PDF",
    responses={200: {"content": {"application/pdf": {}}}},
)
async def export_audit_pdf(
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Generate and download court-admissible PDF audit report."""
    pdf_bytes = audit_service.export_audit_pdf(db, entity_id)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=nyayadarsi_audit_{entity_id}.pdf"
        },
    )
