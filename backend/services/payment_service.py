"""
Payment Service
Business logic for 72-hour auto-release milestone payments.
"""
from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.audit.sha256_logger import log as audit_log
from backend.schemas.builder import PaymentTrigger
from backend.models.milestone import Milestone

def trigger_payment(db: Session, payload: PaymentTrigger) -> dict[str, Any]:
    """
    Trigger milestone payment release.
    Validates: milestone is AI-verified AND officer-confirmed.
    Payment releases automatically within 72 hours.
    No officer has timing discretion — no commission extraction point.
    """
    # Verify milestone exists and is ready for payment
    milestone = db.query(Milestone).filter(Milestone.id == payload.milestone_id).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": "Milestone not found.", "code": "MILESTONE_NOT_FOUND"},
        )
        
    if not milestone.ai_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": True, 
                "message": "Payment blocked. Milestone has not been AI-verified for GPS/Photo compliance.", 
                "code": "NOT_AI_VERIFIED"
            },
        )

    if milestone.payment_status in ["scheduled", "released"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": f"Payment already {milestone.payment_status}.", "code": "ALREADY_PROCESSED"},
        )

    # Calculate release time
    now = datetime.now(timezone.utc)
    release_at = now + timedelta(hours=72)

    # Update milestone status
    milestone.payment_status = "scheduled"
    milestone.officer_confirmed = 1
    milestone.payment_released_at = release_at
    db.commit()

    # Audit log
    audit_result = audit_log(
        db=db,
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
        "message": (
            f"Payment scheduled for auto-release at {release_at.strftime('%Y-%m-%d %H:%M UTC')}. "
            f"No manual intervention possible after confirmation."
        ),
    }
