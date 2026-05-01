"""
Evaluation Routes for Nyayadarsi
Handles bidder evaluation results, yellow queue, and officer decisions.
Thin route layer — delegates to evaluation_service.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.evaluation import OfficerDecision, OfficerDecisionResponse, YellowQueueResponse
from backend.services import evaluation_service

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])


@router.get(
    "/{tender_id}/results",
    summary="Get evaluation results",
)
async def get_evaluation_results(
    tender_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get evaluation results for all bidders on a tender.
    Loaded from mock_data/evaluation_results.json.
    """
    return evaluation_service.get_evaluation_results(tender_id)


@router.get(
    "/{tender_id}/yellow-queue",
    response_model=YellowQueueResponse,
    summary="Get yellow queue",
)
async def get_yellow_queue(
    tender_id: str,
    current_user: User = Depends(get_current_user),
) -> YellowQueueResponse:
    """
    Get all YELLOW items sorted by consequence.
    Mandatory blockers appear first, then sorted by confidence ascending.
    """
    return evaluation_service.get_yellow_queue(tender_id)


@router.post(
    "/officer-decision",
    response_model=OfficerDecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record officer decision",
)
async def post_officer_decision(
    decision: OfficerDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OfficerDecisionResponse:
    """
    Record an officer's decision on a YELLOW flag.
    Creates an immutable audit record with SHA-256 hash.
    """
    return evaluation_service.record_officer_decision(db, decision)
