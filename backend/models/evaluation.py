"""Evaluation-related Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class Verdict(str, Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"


class CriterionResult(BaseModel):
    criterion_id: str
    criterion: Optional[str] = None
    verdict: Verdict
    confidence: float
    extracted_value: Optional[float] = None
    source_document: Optional[str] = None
    source_page: Optional[int] = None
    source_cell: Optional[str] = None
    citation: Optional[str] = None
    flag_reason: Optional[str] = None
    ambiguity: Optional[str] = None
    mandatory: Optional[bool] = None
    blocker: Optional[bool] = None
    officer_options: Optional[List[str]] = None


class BidderEvaluation(BaseModel):
    bidder_id: str
    company_name: str
    overall_verdict: Verdict
    verdicts: List[CriterionResult]


class OfficerDecision(BaseModel):
    tender_id: str
    bidder_id: str
    criterion_id: str
    decision: str  # "PASS" or "FAIL"
    reason: str
    officer_id: str
