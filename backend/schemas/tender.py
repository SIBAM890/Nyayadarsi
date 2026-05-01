"""Tender-related Pydantic schemas."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from enum import Enum


class CriterionType(str, Enum):
    FINANCIAL = "financial"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"


class TenderCriterion(BaseModel):
    """Single extracted eligibility criterion."""
    criterion_id: str
    type: CriterionType = CriterionType.COMPLIANCE
    description: str
    threshold: Optional[float] = None
    threshold_unit: Optional[str] = None
    mandatory: bool = False
    blocker: bool = False
    language_signal: Optional[str] = None
    specificity_alert: bool = False
    acceptable_documents: list[str] = []


class IntegrityAlertResponse(BaseModel):
    """Integrity check result for a criterion."""
    alert: bool
    reason: str
    estimated_qualifying_vendors: int
    criterion_id: Optional[str] = None
    checks_triggered: int = 0


class TenderCreate(BaseModel):
    """Manual tender creation payload."""
    title: str = Field(..., min_length=3, max_length=500)
    description: Optional[str] = None
    department: str = "CRPF"
    category: str = "construction"
    estimated_value: Optional[float] = Field(None, ge=0)


class PdfInfo(BaseModel):
    """PDF extraction metadata."""
    pages: int
    method: str
    is_scanned: bool
    tables_found: int


class AuditRecord(BaseModel):
    """Audit record reference."""
    input_hash: str
    output_hash: str
    timestamp: str
    audit_id: int


class TenderUploadResponse(BaseModel):
    """Full response from tender PDF upload."""
    tender_id: str
    doc_hash: str
    criteria: list[dict[str, Any]]
    alerts: list[dict[str, Any]]
    total_criteria: int
    mandatory_count: int
    discretionary_count: int
    pdf_info: PdfInfo
    audit: AuditRecord


class IntegrityCheckRequest(BaseModel):
    """Request to check a single criterion text."""
    criterion_text: str = Field(..., min_length=10)
    category: str = "construction"


class TenderStatusResponse(BaseModel):
    """Tender evaluation status."""
    model_config = ConfigDict(from_attributes=True)

    tender_id: str
    title: str
    status: str
    total_criteria: int
    alerts_count: int
    doc_hash: Optional[str] = None
    created_at: str
