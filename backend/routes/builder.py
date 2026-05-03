"""
Builder Routes for Nyayadarsi
Handles daily progress uploads, GPS verification, and milestone tracking.
Thin route layer — delegates to builder_service.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.builder import (
    BuilderUploadResponse,
    GPSVerificationResponse,
    LocationVerificationResponse,
)
from backend.services import builder_service

router = APIRouter(prefix="/api/builder", tags=["builder"])


@router.post(
    "/upload",
    response_model=BuilderUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload builder progress",
)
async def upload_progress(
    contract_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    photos: Optional[list[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BuilderUploadResponse:
    """
    Upload daily progress with GPS verification.
    Rejects uploads from locations beyond the threshold.
    """
    photo_count = len(photos) if photos else 0
    return builder_service.process_builder_upload(db, contract_id, latitude, longitude, photo_count)


@router.get(
    "/{contract_id}/milestones",
    summary="Get milestones",
)
async def get_milestones(
    contract_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get milestone progress for a contract."""
    return builder_service.get_milestones(contract_id)


@router.post(
    "/verify-gps",
    response_model=GPSVerificationResponse,
    summary="Verify GPS coordinates",
)
async def standalone_gps_check(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user),
) -> GPSVerificationResponse:
    """Standalone GPS verification endpoint."""
    return builder_service.verify_gps_standalone(latitude, longitude)


@router.post(
    "/verify-location",
    response_model=LocationVerificationResponse,
    summary="Full location verification with reverse geocoding",
)
async def verify_location(
    latitude: float = Query(..., ge=-90, le=90, description="Builder latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Builder longitude"),
    current_user: User = Depends(get_current_user),
) -> LocationVerificationResponse:
    """
    Full location verification endpoint for the Live Tracker.
    Returns distance, reverse-geocoded address, flag status,
    and registered site coordinates for map rendering.
    """
    result = builder_service.get_location_verification(latitude, longitude)
    return LocationVerificationResponse(**result)
