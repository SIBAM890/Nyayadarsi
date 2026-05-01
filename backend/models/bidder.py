"""Bidder-related Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List


class BidderProfile(BaseModel):
    bidder_id: str
    company_name: str
    registered_address: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class DocumentUpload(BaseModel):
    document_type: str
    file_name: str
    file_size: int
    page_count: Optional[int] = None
    ocr_confidence: Optional[float] = None


class BidderSubmission(BaseModel):
    bidder_id: str
    tender_id: str
    bid_amount: float
    documents: List[DocumentUpload] = []
    submitted_at: Optional[str] = None
