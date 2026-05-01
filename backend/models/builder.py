"""Builder-related Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional, List


class GPSData(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = None
    timestamp: Optional[str] = None


class BuilderUpload(BaseModel):
    contract_id: str
    gps: GPSData
    photo_count: int = 0
    has_video: bool = False


class MilestoneUpdate(BaseModel):
    milestone_id: str
    current_percent: float
    ai_verified: bool = False
    officer_confirmed: bool = False


class PaymentTrigger(BaseModel):
    milestone_id: str
    officer_id: str
    confirmation_note: Optional[str] = None
