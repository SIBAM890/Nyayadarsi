"""
Builder Routes for Nyayadarsi
Handles daily progress uploads, GPS verification, and milestone tracking.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional

from backend.utils.gps_verifier import verify_upload
from backend.audit.sha256_logger import log as audit_log
from backend.config import REGISTERED_SITE_LAT, REGISTERED_SITE_LON, GPS_THRESHOLD_METERS, DEMO_DATA_DIR
from backend.database import get_db

router = APIRouter(prefix="/api/builder", tags=["builder"])


def _load_mock(filename: str):
    filepath = DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/upload")
async def upload_progress(
    contract_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    photos: Optional[List[UploadFile]] = File(None),
):
    """
    Upload daily progress with GPS verification.
    Rejects uploads from locations beyond the threshold.
    """
    # Verify GPS
    gps_result = verify_upload(
        upload_lat=latitude,
        upload_lon=longitude,
        registered_lat=REGISTERED_SITE_LAT,
        registered_lon=REGISTERED_SITE_LON,
        threshold_m=GPS_THRESHOLD_METERS,
    )

    timestamp = datetime.now(timezone.utc).isoformat()

    if not gps_result["accepted"]:
        # Log the rejection
        audit_log(
            action="UPLOAD_REJECTED_GPS",
            entity_id=contract_id,
            entity_type="builder_upload",
            input_data={"lat": latitude, "lon": longitude, "contract_id": contract_id},
            output_data=gps_result,
        )

        raise HTTPException(status_code=400, detail={
            "error": True,
            "message": gps_result["rejection_reason"],
            "code": "GPS_REJECTED",
            "distance_meters": gps_result["distance_meters"],
            "threshold_meters": gps_result["threshold_meters"],
        })

    # Accept the upload
    photo_count = len(photos) if photos else 0

    # Store in database
    with get_db() as db:
        db.execute(
            """INSERT INTO builder_upload 
               (contract_id, upload_lat, upload_lon, distance_meters, accepted, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (contract_id, latitude, longitude, gps_result["distance_meters"], 1, timestamp),
        )

    # Audit log
    audit_result = audit_log(
        action="UPLOAD_ACCEPTED",
        entity_id=contract_id,
        entity_type="builder_upload",
        input_data={"lat": latitude, "lon": longitude, "photos": photo_count},
        output_data=gps_result,
    )

    return {
        "accepted": True,
        "distance_meters": gps_result["distance_meters"],
        "photo_count": photo_count,
        "timestamp": timestamp,
        "audit_hash": audit_result["output_hash"],
        "message": f"Upload accepted. Location verified: {gps_result['distance_meters']}m from site.",
    }


@router.get("/{contract_id}/milestones")
async def get_milestones(contract_id: str):
    """Get milestone progress for a contract."""
    data = _load_mock("milestones.json")
    if data:
        return data

    return {
        "contract_id": contract_id,
        "milestones": [],
        "message": "No milestones configured for this contract.",
    }


@router.post("/verify-gps")
async def standalone_gps_check(latitude: float, longitude: float):
    """Standalone GPS verification endpoint."""
    result = verify_upload(
        upload_lat=latitude,
        upload_lon=longitude,
        registered_lat=REGISTERED_SITE_LAT,
        registered_lon=REGISTERED_SITE_LON,
        threshold_m=GPS_THRESHOLD_METERS,
    )
    return result
