"""
Tender Routes for Nyayadarsi
Handles tender creation, PDF upload, and integrity checking.
Thin route layer — delegates to tender_service.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.tender import IntegrityCheckRequest, TenderUploadResponse, TenderStatusResponse
from backend.services import tender_service

router = APIRouter(prefix="/api/tender", tags=["tender"])


@router.post(
    "/upload",
    response_model=TenderUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload tender PDF",
)
async def upload_tender(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TenderUploadResponse:
    """
    Upload a tender PDF → Extract criteria via Gemini → Run integrity checks.
    Returns criteria JSON, document hash, and integrity alerts.
    """
    # ── Guard 1: Extension check ──────────────────────────────────────────────
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are accepted.")

    # ── Guard 2: Size limit (10 MB) ───────────────────────────────────────────
    MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 10 MB limit.")

    # ── Guard 3: PDF magic bytes ("%PDF-") ─────────────────────────────────
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is not a valid PDF.")

    return await tender_service.process_tender_upload(db, file_bytes, filename)


@router.post(
    "/integrity-check",
    summary="Check criterion integrity",
)
async def check_integrity(
    request: IntegrityCheckRequest,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Check a single criterion for integrity alerts."""
    return tender_service.check_criterion_integrity(request.criterion_text, request.category)


@router.get(
    "/{tender_id}/status",
    response_model=TenderStatusResponse,
    summary="Get tender status",
)
async def get_tender_status(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TenderStatusResponse:
    """Get tender evaluation progress."""
    return tender_service.get_tender_status(db, tender_id)
