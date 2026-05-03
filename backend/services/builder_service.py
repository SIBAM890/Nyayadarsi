"""
Builder Service
Business logic for GPS-verified uploads, milestone tracking.
"""
import json
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.services.location_service import verify_distance, haversine_distance
from backend.audit.sha256_logger import log as audit_log
from backend.core.config import settings
from backend.models.builder_upload import BuilderUpload


def _load_mock(filename: str) -> dict[str, Any]:
    """Load mock data from demo/mock_data directory."""
    filepath = settings.DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def process_builder_upload(
    db: Session,
    contract_id: str,
    latitude: float,
    longitude: float,
    photo_count: int = 0,
) -> dict[str, Any]:
    """
    Process a builder progress upload with GPS verification.
    Uses location_service for two-tier distance verification:
    - Hard reject at 100m (configurable via settings.GPS_THRESHOLD_METERS)
    - Soft flag at 500m
    """
    # Verify GPS using the new location service
    location_result = verify_distance(
        upload_lat=latitude,
        upload_lon=longitude,
        site_lat=settings.REGISTERED_SITE_LAT,
        site_lon=settings.REGISTERED_SITE_LON,
        hard_threshold_m=settings.GPS_THRESHOLD_METERS,
    )

    timestamp = datetime.now(timezone.utc).isoformat()

    if not location_result["accepted"]:
        # Log the rejection
        audit_log(
            db=db,
            action="UPLOAD_REJECTED_GPS",
            entity_id=contract_id,
            entity_type="builder_upload",
            input_data={"lat": latitude, "lon": longitude, "contract_id": contract_id},
            output_data=location_result,
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": True,
                "message": location_result["rejection_reason"],
                "code": "GPS_REJECTED",
                "distance_meters": location_result["distance_meters"],
                "threshold_meters": location_result["hard_threshold_meters"],
                "flagged": location_result["flagged"],
            },
        )

    # Store in database via ORM — now includes address and flag
    upload = BuilderUpload(
        contract_id=contract_id,
        upload_lat=latitude,
        upload_lon=longitude,
        distance_meters=location_result["distance_meters"],
        accepted=1,
        reverse_geocoded_address=location_result["reverse_geocoded_address"],
        flagged_offsite=1 if location_result["flagged"] else 0,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(upload)
    db.commit()

    # Audit log
    audit_result = audit_log(
        db=db,
        action="UPLOAD_ACCEPTED",
        entity_id=contract_id,
        entity_type="builder_upload",
        input_data={"lat": latitude, "lon": longitude, "photos": photo_count},
        output_data=location_result,
    )

    return {
        "accepted": True,
        "distance_meters": location_result["distance_meters"],
        "photo_count": photo_count,
        "timestamp": timestamp,
        "audit_hash": audit_result["output_hash"],
        "message": f"Upload accepted. Location verified: {location_result['distance_meters']}m from site.",
        "flagged": location_result["flagged"],
        "reverse_geocoded_address": location_result["reverse_geocoded_address"],
    }


def get_milestones(contract_id: str) -> dict[str, Any]:
    """Get milestone progress for a contract."""
    data = _load_mock("milestones.json")
    if data:
        return data

    return {
        "contract_id": contract_id,
        "milestones": [],
        "message": "No milestones configured for this contract.",
    }


def verify_gps_standalone(latitude: float, longitude: float) -> dict[str, Any]:
    """Standalone GPS verification endpoint (legacy, uses old threshold)."""
    from backend.utils.gps_verifier import verify_upload
    return verify_upload(
        upload_lat=latitude,
        upload_lon=longitude,
        registered_lat=settings.REGISTERED_SITE_LAT,
        registered_lon=settings.REGISTERED_SITE_LON,
        threshold_m=settings.GPS_THRESHOLD_METERS,
    )


def get_location_verification(latitude: float, longitude: float) -> dict[str, Any]:
    """
    Full location verification with reverse geocoding and two-tier flags.
    Used by the frontend Live Tracker for real-time position updates.
    """
    return verify_distance(
        upload_lat=latitude,
        upload_lon=longitude,
        site_lat=settings.REGISTERED_SITE_LAT,
        site_lon=settings.REGISTERED_SITE_LON,
        hard_threshold_m=settings.GPS_THRESHOLD_METERS,
    )
