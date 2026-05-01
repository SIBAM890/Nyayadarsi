"""Bidder-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class BidderProfile(BaseModel):
    """Bidder company profile."""
    bidder_id: str
    company_name: str
    registered_address: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class DocumentUpload(BaseModel):
    """Uploaded document metadata."""
    document_type: str
    file_name: str
    file_size: int = Field(..., ge=0)
    page_count: Optional[int] = Field(None, ge=0)
    ocr_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)


class BidderSubmission(BaseModel):
    """Bidder's full submission."""
    bidder_id: str
    tender_id: str
    bid_amount: float = Field(..., gt=0)
    documents: list[DocumentUpload] = []
    submitted_at: Optional[str] = None
