"""
Collusion Routes for Nyayadarsi
Runs cross-bidder analysis: bid clustering (real scipy), CA fingerprint, address, ownership, doc quality.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from backend.collusion.bid_clustering import analyse_bids
from backend.collusion.ca_fingerprint import analyse_fingerprints
from backend.collusion.address_flag import analyse_addresses
from backend.collusion.ownership_network import analyse_ownership
from backend.collusion.doc_quality import analyse_quality
from backend.config import DEMO_DATA_DIR
from backend.database import get_db

router = APIRouter(prefix="/api/collusion", tags=["collusion"])


class BidItem(BaseModel):
    bidder: str
    amount: float


class CollusionRequest(BaseModel):
    tender_id: str
    bids: List[BidItem]


def _load_mock(filename: str) -> dict:
    filepath = DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/run")
async def run_collusion_scan(request: CollusionRequest):
    """
    Run full collusion risk analysis.
    Bid clustering is REAL scipy calculation.
    Other flags loaded from mock_data for demo.
    """
    bids = [{"bidder": b.bidder, "amount": b.amount} for b in request.bids]

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

    # Store report
    report = {
        "tender_id": request.tender_id,
        "flags": flags,
        "total_triggered": sum(1 for f in flags if f.get("triggered")),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    with get_db() as db:
        db.execute(
            "INSERT INTO collusion_report (tender_id, flags_json, generated_at) VALUES (?, ?, ?)",
            (request.tender_id, json.dumps(flags), report["generated_at"]),
        )

    return report


@router.get("/{tender_id}/report")
async def get_collusion_report(tender_id: str):
    """Get stored collusion report for a tender."""
    # Try database first
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM collusion_report WHERE tender_id = ? ORDER BY generated_at DESC LIMIT 1",
            (tender_id,),
        ).fetchone()

    if row:
        return {
            "tender_id": tender_id,
            "flags": json.loads(row["flags_json"]),
            "generated_at": row["generated_at"],
        }

    # Fallback to mock data
    data = _load_mock("collusion_results.json")
    if data:
        return data

    raise HTTPException(status_code=404, detail={
        "error": True,
        "message": "No collusion report found. Run scan first.",
        "code": "NO_REPORT"
    })
