"""Evaluation-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Verdict(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class CriterionResult(BaseModel):
    """Evaluation result for a single criterion."""
    criterion_id: str
    criterion: Optional[str] = None
    verdict: Verdict
    confidence: float = Field(..., ge=0.0, le=1.0)
    extracted_value: Optional[float] = None
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    source_cell: Optional[str] = None
    citation: Optional[str] = None
    flag_reason: Optional[str] = None
    ambiguity: Optional[str] = None
    mandatory: Optional[bool] = None
    blocker: Optional[bool] = None
    officer_options: Optional[list[str]] = None


class BidderEvaluationSchema(BaseModel):
    """Evaluation result for a single bidder."""
    bidder_id: str
    company_name: str
    overall_verdict: Verdict
    verdicts: list[CriterionResult]


class OfficerDecision(BaseModel):
    """Officer decision on a YELLOW flag."""
    tender_id: str
    bidder_id: str
    criterion_id: str
    decision: str = Field(..., pattern=r"^(PASS|FAIL)$", description="Must be PASS or FAIL")
    reason: str = Field(..., min_length=10, description="Justification (min 10 chars)")
    officer_id: str


class OfficerDecisionResponse(BaseModel):
    """Response after recording an officer decision."""
    logged: bool
    audit_hash: str
    timestamp: str
    decision: str
    message: str


class YellowQueueItem(BaseModel):
    """Single item in the yellow queue."""
    bidder_id: str
    company_name: str
    criterion_id: str
    criterion: Optional[str] = None
    verdict: str = "YELLOW"
    confidence: float
    ambiguity: Optional[str] = None
    mandatory: Optional[bool] = None
    blocker: Optional[bool] = None


class YellowQueueResponse(BaseModel):
    """Yellow queue response."""
    tender_id: str
    total_yellow: int
    items: list[dict]
