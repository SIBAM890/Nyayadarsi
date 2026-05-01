"""
Evaluation Routes for Nyayadarsi
Handles bidder evaluation results, yellow queue, and officer decisions.
All mock data loaded from demo/mock_data/ — not hardcoded inline.
"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

from backend.audit.sha256_logger import log as audit_log
from backend.config import DEMO_DATA_DIR
from backend.models.evaluation import OfficerDecision

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])


def _load_mock(filename: str) -> dict:
    """Load mock data from demo/mock_data directory."""
    filepath = DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/{tender_id}/results")
async def get_evaluation_results(tender_id: str):
    """
    Get evaluation results for all bidders on a tender.
    Loaded from mock_data/evaluation_results.json.
    """
    data = _load_mock("evaluation_results.json")
    if not data:
        raise HTTPException(status_code=404, detail={
            "error": True,
            "message": "Evaluation results not found. Run evaluation first.",
            "code": "NO_RESULTS"
        })
    return data


@router.get("/{tender_id}/yellow-queue")
async def get_yellow_queue(tender_id: str):
    """
    Get all YELLOW items sorted by consequence.
    Mandatory blockers appear first, then sorted by confidence ascending.
    """
    data = _load_mock("evaluation_results.json")
    if not data:
        return {"items": []}

    yellow_items = []
    for bidder in data.get("bidders", []):
        for verdict in bidder.get("verdicts", []):
            if verdict.get("verdict") == "YELLOW":
                yellow_items.append({
                    "bidder_id": bidder["bidder_id"],
                    "company_name": bidder["company_name"],
                    **verdict,
                })

    # Sort: mandatory blockers first, then by confidence ascending
    yellow_items.sort(
        key=lambda x: (
            not x.get("blocker", False),   # blockers first (False sorts before True)
            not x.get("mandatory", False),  # mandatory next
            x.get("confidence", 1.0),       # lowest confidence most urgent
        )
    )

    return {
        "tender_id": tender_id,
        "total_yellow": len(yellow_items),
        "items": yellow_items,
    }


@router.post("/officer-decision")
async def post_officer_decision(decision: OfficerDecision):
    """
    Record an officer's decision on a YELLOW flag.
    Creates an immutable audit record with SHA-256 hash.
    """
    if decision.decision not in ("PASS", "FAIL"):
        raise HTTPException(status_code=400, detail={
            "error": True,
            "message": "Decision must be 'PASS' or 'FAIL'",
            "code": "INVALID_DECISION"
        })

    if not decision.reason or len(decision.reason.strip()) < 10:
        raise HTTPException(status_code=400, detail={
            "error": True,
            "message": "Reason must be at least 10 characters. All officer decisions require documented justification.",
            "code": "REASON_REQUIRED"
        })

    # Create audit record
    audit_result = audit_log(
        action="OFFICER_DECISION",
        entity_id=f"{decision.tender_id}:{decision.bidder_id}:{decision.criterion_id}",
        entity_type="evaluation",
        input_data={
            "tender_id": decision.tender_id,
            "bidder_id": decision.bidder_id,
            "criterion_id": decision.criterion_id,
        },
        output_data={
            "decision": decision.decision,
            "reason": decision.reason,
        },
        officer_id=decision.officer_id,
        verdict=decision.decision,
    )

    return {
        "logged": True,
        "audit_hash": audit_result["output_hash"],
        "timestamp": audit_result["timestamp"],
        "decision": decision.decision,
        "message": f"Decision recorded. Audit hash: {audit_result['output_hash'][:16]}...",
    }
