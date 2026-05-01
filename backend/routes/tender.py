"""
Tender Routes for Nyayadarsi
Handles tender creation, PDF upload, and integrity checking.
"""
import uuid
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.utils.pdf_reader import extract_text
from backend.ai.criteria_extractor import extract
from backend.ai.integrity_alert import check
from backend.audit.sha256_logger import log as audit_log
from backend.database import get_db
from backend.models.tender import IntegrityCheckRequest

router = APIRouter(prefix="/api/tender", tags=["tender"])


@router.post("/upload")
async def upload_tender(file: UploadFile = File(...)):
    """
    Upload a tender PDF → Extract criteria via Gemini → Run integrity checks.
    Returns criteria JSON, document hash, and integrity alerts.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail={
            "error": True,
            "message": "Only PDF files are accepted",
            "code": "INVALID_FILE_TYPE"
        })

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail={
            "error": True,
            "message": "Empty file uploaded",
            "code": "EMPTY_FILE"
        })

    # Compute document hash
    doc_hash = hashlib.sha256(file_bytes).hexdigest()

    # Extract text from PDF
    pdf_result = extract_text(file_bytes=file_bytes)
    if not pdf_result["text"]:
        raise HTTPException(status_code=422, detail={
            "error": True,
            "message": "Could not extract text from PDF. File may be scanned or corrupted.",
            "code": "TEXT_EXTRACTION_FAILED"
        })

    # Extract criteria using AI
    criteria = await extract(pdf_result["text"])

    # Run integrity checks on each criterion
    alerts = []
    for criterion in criteria:
        alert_result = check(criterion)
        if alert_result["alert"]:
            alerts.append(alert_result)

    # Generate tender ID
    tender_id = f"TENDER-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    # Save to database
    with get_db() as db:
        db.execute(
            """INSERT INTO tender (id, title, criteria_json, alerts_json, doc_hash, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                tender_id,
                file.filename,
                json.dumps(criteria),
                json.dumps(alerts),
                doc_hash,
                "draft",
                datetime.now(timezone.utc).isoformat(),
            ),
        )

    # Audit log
    audit_result = audit_log(
        action="CRITERIA_EXTRACTED",
        entity_id=tender_id,
        entity_type="tender",
        input_data={"filename": file.filename, "doc_hash": doc_hash, "pages": pdf_result["pages"]},
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


@router.post("/integrity-check")
async def check_integrity(request: IntegrityCheckRequest):
    """Check a single criterion for integrity alerts."""
    criterion = {
        "description": request.criterion_text,
        "type": "general",
    }
    result = check(criterion, category=request.category)
    return result


@router.get("/{tender_id}/status")
async def get_tender_status(tender_id: str):
    """Get tender evaluation progress."""
    with get_db() as db:
        tender = db.execute("SELECT * FROM tender WHERE id = ?", (tender_id,)).fetchone()
        if not tender:
            raise HTTPException(status_code=404, detail={
                "error": True,
                "message": f"Tender {tender_id} not found",
                "code": "TENDER_NOT_FOUND"
            })

        criteria = json.loads(tender["criteria_json"] or "[]")
        alerts = json.loads(tender["alerts_json"] or "[]")

        return {
            "tender_id": tender_id,
            "title": tender["title"],
            "status": tender["status"],
            "total_criteria": len(criteria),
            "alerts_count": len(alerts),
            "doc_hash": tender["doc_hash"],
            "created_at": tender["created_at"],
        }
