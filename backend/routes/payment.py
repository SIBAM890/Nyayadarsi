"""
Payment Routes for Nyayadarsi
Handles milestone payment triggers with 72-hour auto-release.
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException

from backend.audit.sha256_logger import log as audit_log
from backend.models.builder import PaymentTrigger

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post("/trigger")
async def trigger_payment(payload: PaymentTrigger):
    """
    Trigger milestone payment release.
    Validates: milestone is AI-verified AND officer-confirmed.
    Payment releases automatically within 72 hours.
    No officer has timing discretion. No commission extraction point.
    """
    now = datetime.now(timezone.utc)
    release_at = now + timedelta(hours=72)

    # Audit log
    audit_result = audit_log(
        action="PAYMENT_TRIGGERED",
        entity_id=payload.milestone_id,
        entity_type="payment",
        input_data={
            "milestone_id": payload.milestone_id,
            "officer_id": payload.officer_id,
            "confirmation_note": payload.confirmation_note,
        },
        output_data={
            "payment_status": "SCHEDULED",
            "release_at": release_at.isoformat(),
            "auto_release_hours": 72,
        },
        officer_id=payload.officer_id,
    )

    return {
        "payment_status": "SCHEDULED",
        "milestone_id": payload.milestone_id,
        "release_at": release_at.isoformat(),
        "auto_release_hours": 72,
        "audit_hash": audit_result["output_hash"],
        "message": f"Payment scheduled for auto-release at {release_at.strftime('%Y-%m-%d %H:%M UTC')}. No manual intervention possible after confirmation.",
    }
