"""
Payment Routes for Nyayadarsi
Handles milestone payment triggers with 72-hour auto-release.
Thin route layer — delegates to payment_service.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.builder import PaymentTrigger, PaymentResponse
from backend.services import payment_service

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post(
    "/trigger",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger payment release",
)
async def trigger_payment(
    payload: PaymentTrigger,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentResponse:
    """
    Trigger milestone payment release.
    Validates: milestone is AI-verified AND officer-confirmed.
    Payment releases automatically within 72 hours.
    No officer has timing discretion. No commission extraction point.
    """
    return payment_service.trigger_payment(db, payload)
