"""
Evaluation Service
Business logic for bidder evaluations, yellow queue, and officer decisions.
"""
import json
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.audit.sha256_logger import log as audit_log
from backend.core.config import settings


def _load_mock(filename: str) -> dict[str, Any]:
    """Load mock data from demo/mock_data directory."""
    filepath = settings.DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def get_evaluation_results(tender_id: str) -> dict[str, Any]:
    """
    Get evaluation results for all bidders on a tender.
    Currently loads from mock_data — Phase 2 will compute from real documents.
    """
    data = _load_mock("evaluation_results.json")
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": True, "message": "Evaluation results not found. Run evaluation first.", "code": "NO_RESULTS"},
        )
    return data


def get_yellow_queue(tender_id: str) -> dict[str, Any]:
    """
    Get all YELLOW items sorted by consequence.
    Mandatory blockers appear first, then sorted by confidence ascending.
    """
    data = _load_mock("evaluation_results.json")
    if not data:
        return {"tender_id": tender_id, "total_yellow": 0, "items": []}

    yellow_items: list[dict[str, Any]] = []
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
            not x.get("blocker", False),
            not x.get("mandatory", False),
            x.get("confidence", 1.0),
        )
    )

    return {
        "tender_id": tender_id,
        "total_yellow": len(yellow_items),
        "items": yellow_items,
    }


def record_officer_decision(db: Session, decision: Any) -> dict[str, Any]:
    """
    Record an officer's PASS/FAIL decision on a YELLOW flag.
    Creates an immutable audit record with SHA-256 hash.
    """
    # Create audit record
    audit_result = audit_log(
        db=db,
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
