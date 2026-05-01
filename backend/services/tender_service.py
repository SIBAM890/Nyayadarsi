"""
Tender Service
Business logic for tender upload, criteria extraction, and integrity checking.
"""
import uuid
import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.utils.pdf_reader import extract_text
from backend.ai.criteria_extractor import extract
from backend.ai.integrity_alert import check
from backend.audit.sha256_logger import log as audit_log
from backend.models.tender import Tender as TenderModel


async def process_tender_upload(
    db: Session,
    file_bytes: bytes,
    filename: str,
) -> dict[str, Any]:
    """
    Process a tender PDF upload:
    1. Validate file
    2. Extract text via pdfplumber/PyMuPDF
    3. Extract criteria via Gemini AI
    4. Run integrity checks
    5. Persist to database
    6. Create audit record

    Returns:
        Full tender upload response dict.
    """
    # Validate
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "Only PDF files are accepted", "code": "INVALID_FILE_TYPE"},
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "Empty file uploaded", "code": "EMPTY_FILE"},
        )

    # Compute document hash
    doc_hash = hashlib.sha256(file_bytes).hexdigest()

    # Extract text from PDF
    pdf_result = extract_text(file_bytes=file_bytes)
    if not pdf_result["text"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": True,
                "message": "Could not extract text from PDF. File may be scanned or corrupted.",
                "code": "TEXT_EXTRACTION_FAILED",
            },
        )

    # Extract criteria using AI
    criteria = await extract(pdf_result["text"])

    # Run integrity checks on each criterion
    alerts: list[dict[str, Any]] = []
    for criterion in criteria:
        alert_result = check(criterion)
        if alert_result["alert"]:
            alerts.append(alert_result)

    # Generate tender ID
    tender_id = f"TENDER-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    # Save to database via ORM
    tender = TenderModel(
        id=tender_id,
        title=filename,
        criteria_json=json.dumps(criteria),
        alerts_json=json.dumps(alerts),
        doc_hash=doc_hash,
        status="draft",
    )
    db.add(tender)
    db.commit()

    # Audit log
    audit_result = audit_log(
        db=db,
        action="CRITERIA_EXTRACTED",
        entity_id=tender_id,
        entity_type="tender",
        input_data={"filename": filename, "doc_hash": doc_hash, "pages": pdf_result["pages"]},
        output_data={"criteria_count": len(criteria), "alerts_count": len(alerts)},
        model_version="gemini-1.5-flash",
    )

    mandatory_count = sum(1 for c in criteria if c.get("mandatory"))
    discretionary_count = len(criteria) - mandatory_count

    return {
        "tender_id": tender_id,
        "doc_hash": doc_hash,
        "criteria": criteria,
        "alerts": alerts,
        "total_criteria": len(criteria),
        "mandatory_count": mandatory_count,
        "discretionary_count": discretionary_count,
        "pdf_info": {
            "pages": pdf_result["pages"],
            "method": pdf_result["method"],
            "is_scanned": pdf_result["is_scanned"],
            "tables_found": len(pdf_result["tables"]),
        },
        "audit": audit_result,
    }


def check_criterion_integrity(criterion_text: str, category: str = "construction") -> dict[str, Any]:
    """Check a single criterion for integrity alerts."""
    criterion = {"description": criterion_text, "type": "general"}
    return check(criterion, category=category)


def get_tender_status(db: Session, tender_id: str) -> dict[str, Any]:
    """Get tender evaluation progress."""
    tender = db.query(TenderModel).filter(TenderModel.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": f"Tender {tender_id} not found", "code": "TENDER_NOT_FOUND"},
        )

    criteria = json.loads(tender.criteria_json or "[]")
    alerts = json.loads(tender.alerts_json or "[]")

    return {
        "tender_id": tender_id,
        "title": tender.title,
        "status": tender.status,
        "total_criteria": len(criteria),
        "alerts_count": len(alerts),
        "doc_hash": tender.doc_hash,
        "created_at": str(tender.created_at),
    }
