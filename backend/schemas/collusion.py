"""Collusion-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Any, Optional


class BidItem(BaseModel):
    """A single bid in a collusion scan."""
    bidder: str
    amount: float = Field(..., gt=0)


class CollusionRequest(BaseModel):
    """Request to run collusion risk analysis."""
    tender_id: str
    bids: list[BidItem] = Field(..., min_length=2)


class CollusionReportResponse(BaseModel):
    """Collusion scan result."""
    tender_id: str
    flags: list[dict[str, Any]]
    total_triggered: int
    generated_at: str
