"""Tender-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class CriterionType(str, Enum):
    FINANCIAL = "financial"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"


class TenderCriterion(BaseModel):
    criterion_id: str
    type: CriterionType
    description: str
    threshold: Optional[float] = None
    threshold_unit: Optional[str] = None
    mandatory: bool = False
    blocker: bool = False
    language_signal: Optional[str] = None
    specificity_alert: bool = False
    acceptable_documents: List[str] = []


class IntegrityAlertResponse(BaseModel):
    alert: bool
    reason: str
    estimated_qualifying_vendors: int
    criterion_id: Optional[str] = None


class TenderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    department: Optional[str] = "CRPF"
    category: Optional[str] = "construction"
    estimated_value: Optional[float] = None


class TenderUploadResponse(BaseModel):
    tender_id: str
    doc_hash: str
    criteria: List[TenderCriterion]
    alerts: List[IntegrityAlertResponse]
    total_criteria: int
    mandatory_count: int
    discretionary_count: int


class IntegrityCheckRequest(BaseModel):
    criterion_text: str
    category: str = "construction"
