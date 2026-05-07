"""
Audit Routes for Nyayadarsi
Provides access to the immutable audit trail and court-admissible PDF export.
Now integrated with AI evidence processing.
"""
import hashlib
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Any

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.audit import AuditTrailResponse
from backend.services import audit_service
from backend.ai import gemini_client, openrouter_client
from backend.utils.pdf_reader import extract_text
from backend.audit.sha256_logger import log as audit_log

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.get(
    "/{entity_id}/trail",
    summary="Get entity audit trail",
)
async def get_audit_trail(
    entity_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get paginated audit entries for an entity."""
    return audit_service.get_audit_trail(db, entity_id, limit=limit, offset=offset)


@router.get(
    "/all",
    summary="Get all audit entries",
)
async def get_all_audit_entries(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get all audit entries paginated."""
    return audit_service.get_all_audit_entries(db, limit=limit, offset=offset)


@router.post(
    "/upload",
    summary="Upload evidence and run AI analysis",
    response_model=dict,
)
async def upload_evidence(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Upload a document (PDF or Text) → Extract content → Process with AI → Log to audit trail.
    """
    filename = file.filename or ""
    content_type = file.content_type or ""

    # ── 1. Read Content ───────────────────────────────────────────────────
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "Empty file uploaded", "code": "EMPTY_FILE"},
        )

    doc_hash = hashlib.sha256(file_bytes).hexdigest()
    text_content = ""

    if filename.lower().endswith(".pdf") or content_type == "application/pdf":
        try:
            pdf_result = extract_text(file_bytes=file_bytes)
            text_content = pdf_result["text"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": True, "message": f"PDF extraction failed: {str(e)}", "code": "PDF_EXTRACTION_FAILED"},
            )
    else:
        try:
            text_content = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": True, "message": "Uploaded file must be a PDF or UTF-8 text file.", "code": "INVALID_FILE_TYPE"},
            )

    if not text_content.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": True, "message": "No readable text found in document.", "code": "NO_TEXT_FOUND"},
        )

    # ── 2. AI Processing ──────────────────────────────────────────────────
    prompt = f"""You are a Senior Forensic Auditor briefing a high-ranking official on a potential procurement integrity risk. 

Write your report in a professional, advisory tone, as if you are explaining your findings directly to me. Use phrases like "I observed", "It is important to note", and "The reason this matters is...".

Perform a DEEP-DIVE forensic analysis of the provided document. Your goal is to uncover hidden risks, restrictive practices, and compliance failures.

STRUCTURE YOUR REPORT AS FOLLOWS (DO NOT provide meta-descriptions of sections, directly output the analysis):

1. EXECUTIVE SUMMARY & FORENSIC NARRATIVE: Provide a high-level overview. Start by explaining the situation in plain language. "I have reviewed the document and here is what I found..."

2. EXHAUSTIVE FACT EXTRACTION: List every significant date, monetary value, and claim found in the text. Present them as "Key findings I extracted from the document."

3. LEGAL & REGULATORY CROSS-EXAMINATION: Map specific text segments to GFR 2017 rules (especially GFR 160, 170, 171). Explain EXACTLY why a certain clause is problematic.

4. RED FLAG & COLLUSION ANALYSIS: 
   - Identify "Tailor-made" specifications or "Restrictive Eligibility".
   - "I noticed a red flag in the eligibility criteria where..."

5. RISK IMPACT ASSESSMENT: Explain the SITUATION (what is happening) and the CAUSE (why it matters). Use a helpful, advisory tone to explain the potential fallout. Assign severity: CRITICAL, HIGH, or MEDIUM.

IMPORTANT FORMATTING RULES:
- Use Markdown headers (##, ###) ONLY for the section titles above.
- DO NOT use bolding (**text**) for every sentence. Use it sparingly ONLY for critical monetary values, dates, or rule names.
- Write in clean, professional paragraphs. Avoid overly long bullet points.
- Maintain a sophisticated, uniform narrative style throughout.
- Speak to me like a professional peer, not a chatbot.

DOCUMENT TEXT:
{text_content[:15000]}"""

    ai_result = ""
    model_used = None
    error_msg = ""

    # Try Gemini first
    if gemini_client.is_configured():
        try:
            ai_result = await gemini_client.generate(prompt, max_tokens=4000)
            model_used = gemini_client.DEFAULT_MODEL
        except Exception as e:
            error_msg = f"Gemini error: {str(e)}"

    # Fallback to OpenRouter
    if not ai_result and openrouter_client.is_configured():
        try:
            ai_result = await openrouter_client.generate(prompt, max_tokens=4000)
            model_used = f"openrouter/{openrouter_client.DEFAULT_MODEL}"
        except Exception as e:
            error_msg = f"{error_msg} | OpenRouter error: {str(e)}"

    if not ai_result:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": True, "message": f"AI processing failed. {error_msg}", "code": "AI_FAILED"},
        )

    # ── 3. Create Audit Log ─────────────────────────────────────────────
    entity_id = f"EVIDENCE-{doc_hash[:12].upper()}"

    audit_result = audit_log(
        db=db,
        action="EVIDENCE_ANALYZED",
        entity_id=entity_id,
        entity_type="evidence",
        input_data={
            "filename": filename,
            "doc_hash": doc_hash,
            "content_length": len(text_content),
            "content_type": content_type,
        },
        output_data={
            "ai_analysis": ai_result[:500],  # Truncated for storage
            "model_used": model_used,
            "full_analysis_length": len(ai_result),
        },
        model_version=model_used,
        officer_id=str(current_user.id) if current_user else None,
    )

    return {
        "success": True,
        "entity_id": entity_id,
        "filename": filename,
        "doc_hash": doc_hash,
        "analysis": ai_result,
        "model_used": model_used,
        "audit": {
            "audit_id": audit_result["audit_id"],
            "input_hash": audit_result["input_hash"],
            "output_hash": audit_result["output_hash"],
            "timestamp": audit_result["timestamp"],
        },
    }


@router.get(
    "/export-pdf",
    summary="Export full global audit PDF",
    responses={200: {"content": {"application/pdf": {}}}},
)
async def export_full_audit_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Export the entire global audit trail to a PDF report."""
    trail_data = audit_service.get_all_audit_entries(db)
    from backend.audit.pdf_exporter import generate_audit_pdf
    pdf_bytes = generate_audit_pdf(
        entity_id="GLOBAL_SYSTEM_AUDIT",
        audit_trail=trail_data["trail"],
        tender_info={"Report Type": "Full System Audit Trail Export"}
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=nyayadarsi_full_audit.pdf"
        },
    )


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
