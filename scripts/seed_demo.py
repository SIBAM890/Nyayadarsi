"""
Seed Demo Data for Nyayadarsi
Loads all JSON files from demo/mock_data/ into SQLite.
Run once after setup to populate the database for demo.
"""
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import init_db, get_db

MOCK_DIR = Path(__file__).resolve().parent.parent / "demo" / "mock_data"


def seed():
    print("🌱 Seeding demo data...")

    # Initialize database
    init_db()

    # 1. Create demo tender
    with get_db() as db:
        db.execute("""
            INSERT OR REPLACE INTO tender (id, title, description, department, category, estimated_value, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "CRPF-2025-CONST-001",
            "Construction of Barracks — CRPF Camp Bhubaneswar",
            "Type-II Residential Barracks (G+3) at CRPF Group Centre, Bhubaneswar",
            "CRPF",
            "construction",
            62000000,
            "published",
            datetime.now(timezone.utc).isoformat(),
        ))
    print("  ✅ Tender created")

    # 2. Seed evaluation results
    eval_path = MOCK_DIR / "evaluation_results.json"
    if eval_path.exists():
        with open(eval_path, "r", encoding="utf-8") as f:
            eval_data = json.load(f)

        with get_db() as db:
            for bidder in eval_data.get("bidders", []):
                db.execute("""
                    INSERT OR REPLACE INTO bidder_evaluation 
                    (tender_id, bidder_id, company_name, overall_verdict, verdicts_json, evaluated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    eval_data["tender_id"],
                    bidder["bidder_id"],
                    bidder["company_name"],
                    bidder["overall_verdict"],
                    json.dumps(bidder["verdicts"]),
                    datetime.now(timezone.utc).isoformat(),
                ))
        print(f"  ✅ {len(eval_data.get('bidders', []))} bidder evaluations seeded")

    # 3. Seed milestones
    ms_path = MOCK_DIR / "milestones.json"
    if ms_path.exists():
        with open(ms_path, "r", encoding="utf-8") as f:
            ms_data = json.load(f)

        with get_db() as db:
            for ms in ms_data.get("milestones", []):
                db.execute("""
                    INSERT OR REPLACE INTO milestone 
                    (id, contract_id, title, description, target_percent, current_percent,
                     status, payment_amount, payment_status, ai_verified, officer_confirmed, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ms["id"],
                    ms_data["contract_id"],
                    ms["title"],
                    ms["description"],
                    ms["target_percent"],
                    ms["current_percent"],
                    ms["status"],
                    ms["payment_amount"],
                    ms["payment_status"],
                    1 if ms.get("ai_verified") else 0,
                    1 if ms.get("officer_confirmed") else 0,
                    datetime.now(timezone.utc).isoformat(),
                ))
        print(f"  ✅ {len(ms_data.get('milestones', []))} milestones seeded")

    # 4. Seed audit trail
    audit_path = MOCK_DIR / "audit_trail.json"
    if audit_path.exists():
        with open(audit_path, "r", encoding="utf-8") as f:
            audit_data = json.load(f)

        with get_db() as db:
            for entry in audit_data:
                db.execute("""
                    INSERT INTO audit_log 
                    (timestamp, entity_type, entity_id, action, sha256_input, sha256_output,
                     model_version, officer_id, confidence, verdict)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry["timestamp"],
                    entry["entity_type"],
                    entry["entity_id"],
                    entry["action"],
                    entry["sha256_input"],
                    entry["sha256_output"],
                    entry.get("model_version"),
                    entry.get("officer_id"),
                    entry.get("confidence"),
                    entry.get("verdict"),
                ))
        print(f"  ✅ {len(audit_data)} audit entries seeded")

    # 5. Seed collusion report
    coll_path = MOCK_DIR / "collusion_results.json"
    if coll_path.exists():
        with open(coll_path, "r", encoding="utf-8") as f:
            coll_data = json.load(f)

        with get_db() as db:
            db.execute("""
                INSERT INTO collusion_report (tender_id, flags_json, generated_at)
                VALUES (?, ?, ?)
            """, (
                coll_data["tender_id"],
                json.dumps(coll_data["flags"]),
                datetime.now(timezone.utc).isoformat(),
            ))
        print("  ✅ Collusion report seeded")

    print("\n🎉 Demo data seeded successfully!")
    print("   Run: cd backend && python -m uvicorn main:app --reload")


if __name__ == "__main__":
    seed()
