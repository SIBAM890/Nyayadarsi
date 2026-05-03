"""Builder-related Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class GPSData(BaseModel):
    """GPS coordinate data with strict validation."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in degrees (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in degrees (-180 to 180)")
    accuracy_meters: Optional[float] = Field(None, ge=0, description="GPS accuracy in metres")
    timestamp: Optional[str] = None


class SiteCoordinates(BaseModel):
    """Registered project site coordinates."""
    lat: float
    lon: float


class BuilderUploadSchema(BaseModel):
    """Builder upload metadata."""
    contract_id: str
    gps: GPSData
    photo_count: int = Field(0, ge=0)
    has_video: bool = False


class BuilderUploadResponse(BaseModel):
    """Response after a builder upload."""
    accepted: bool
    distance_meters: float
    photo_count: int
    timestamp: str
    audit_hash: str
    message: str
    flagged: bool = False
    reverse_geocoded_address: Optional[str] = None


class MilestoneUpdate(BaseModel):
    """Milestone progress update."""
    milestone_id: str
    current_percent: float = Field(..., ge=0, le=100)
    ai_verified: bool = False
    officer_confirmed: bool = False


class PaymentTrigger(BaseModel):
    """Request to trigger milestone payment."""
    milestone_id: str
    officer_id: str
    confirmation_note: Optional[str] = None


class PaymentResponse(BaseModel):
    """Response after triggering payment."""
    payment_status: str
    milestone_id: str
    release_at: str
    auto_release_hours: int
    audit_hash: str
    message: str


class GPSVerificationResponse(BaseModel):
    """Standalone GPS verification result."""
    accepted: bool
    distance_meters: float
    threshold_meters: float
    rejection_reason: Optional[str] = None


class LocationVerificationResponse(BaseModel):
    """Full location verification with reverse geocoding and flag status."""
    accepted: bool
    distance_meters: float
    hard_threshold_meters: float
    flag_threshold_meters: float
    flagged: bool
    rejection_reason: Optional[str] = None
    reverse_geocoded_address: Optional[str] = None
    site_coordinates: SiteCoordinates
