"""
Collusion Service
Business logic for collusion risk analysis — bid clustering + 4 additional flags.
"""
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.collusion.bid_clustering import analyse_bids
from backend.core.config import settings
from backend.models.collusion_report import CollusionReport


def _load_mock(filename: str) -> dict[str, Any]:
    """Load mock data from demo/mock_data directory."""
    filepath = settings.DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def run_collusion_scan(db: Session, tender_id: str, bids: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Run full 5-flag collusion risk analysis.
    Bid clustering is REAL scipy calculation; other flags loaded from mock data.
    """
    # REAL: Bid clustering analysis with scipy
    clustering_result = analyse_bids(bids)

    # MOCK: Load other flags from demo data
    mock_data = _load_mock("collusion_results.json")
    mock_flags = {f["flag"]: f for f in mock_data.get("flags", [])}

    # Build 5-flag report
    flags = [
        clustering_result,
        mock_flags.get("CA_FINGERPRINT", {
            "flag": "CA_FINGERPRINT",
            "triggered": False,
            "similarity_score": 0.15,
            "evidence": {"interpretation": "No CA fingerprint match detected."},
        }),
        mock_flags.get("SHARED_ADDRESS", {
            "flag": "SHARED_ADDRESS",
            "triggered": False,
            "evidence": {"interpretation": "No shared addresses detected."},
        }),
        mock_flags.get("OWNERSHIP_NETWORK", {
            "flag": "OWNERSHIP_NETWORK",
            "triggered": False,
            "reason": "MCA API — Phase 2",
        }),
        mock_flags.get("DOC_QUALITY_ASYMMETRY", {
            "flag": "DOC_QUALITY_ASYMMETRY",
            "triggered": False,
            "evidence": {"interpretation": "No document quality anomalies."},
        }),
    ]

    generated_at = datetime.now(timezone.utc).isoformat()

    # Store report via ORM
    report = CollusionReport(
        tender_id=tender_id,
        flags_json=json.dumps(flags),
        generated_at=datetime.now(timezone.utc),
    )
    db.add(report)
    db.commit()

    return {
        "tender_id": tender_id,
        "flags": flags,
        "total_triggered": sum(1 for f in flags if f.get("triggered")),
        "generated_at": generated_at,
    }


def get_collusion_report(db: Session, tender_id: str) -> dict[str, Any]:
    """Get stored collusion report for a tender."""
    # Try database first
    row = (
        db.query(CollusionReport)
        .filter(CollusionReport.tender_id == tender_id)
        .order_by(CollusionReport.generated_at.desc())
        .first()
    )

    if row:
        return {
            "tender_id": tender_id,
            "flags": json.loads(row.flags_json),
            "generated_at": str(row.generated_at),
        }

    # Fallback to mock data
    data = _load_mock("collusion_results.json")
    if data:
        return data

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": True, "message": "No collusion report found. Run scan first.", "code": "NO_REPORT"},
    )
