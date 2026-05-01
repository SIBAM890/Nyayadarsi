"""
Collusion Routes for Nyayadarsi
Runs cross-bidder analysis: bid clustering (real scipy), CA fingerprint, address, ownership, doc quality.
Thin route layer — delegates to collusion_service.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.collusion import CollusionRequest, CollusionReportResponse
from backend.services import collusion_service

router = APIRouter(prefix="/api/collusion", tags=["collusion"])


@router.post(
    "/run",
    response_model=CollusionReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run collusion scan",
)
async def run_collusion_scan(
    request: CollusionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CollusionReportResponse:
    """
    Run full collusion risk analysis.
    Bid clustering is REAL scipy calculation.
    Other flags loaded from mock_data for demo.
    """
    bids = [{"bidder": b.bidder, "amount": b.amount} for b in request.bids]
    return collusion_service.run_collusion_scan(db, request.tender_id, bids)


@router.get(
    "/{tender_id}/report",
    response_model=CollusionReportResponse,
    summary="Get collusion report",
)
async def get_collusion_report(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CollusionReportResponse:
    """Get stored collusion report for a tender."""
    return collusion_service.get_collusion_report(db, tender_id)
