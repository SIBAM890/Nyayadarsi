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

from backend.core.database import init_db, SessionLocal
from sqlalchemy import text

MOCK_DIR = Path(__file__).resolve().parent.parent / "demo" / "mock_data"

def seed():
    print("🌱 Seeding demo data...")

    # Initialize database
    init_db()

    # 1. Create demo tender
    with SessionLocal() as db:
        db.execute(text("""
            INSERT OR REPLACE INTO tender (id, title, description, department, category, estimated_value, status, created_at)
            VALUES (:p1, :p2, :p3, :p4, :p5, :p6, :p7, :p8)
        """), {
            "p1": "CRPF-2025-CONST-001",
            "p2": "Construction of Barracks — CRPF Camp Bhubaneswar",
            "p3": "Type-II Residential Barracks (G+3) at CRPF Group Centre, Bhubaneswar",
            "p4": "CRPF",
            "p5": "construction",
            "p6": 62000000,
            "p7": "published",
            "p8": datetime.now(timezone.utc).isoformat(),
        })
        db.commit()
    print("  ✅ Tender created")

    # 2. Seed evaluation results
    eval_path = MOCK_DIR / "evaluation_results.json"
    if eval_path.exists():
        with open(eval_path, "r", encoding="utf-8") as f:
            eval_data = json.load(f)

        with SessionLocal() as db:
            for bidder in eval_data.get("bidders", []):
                db.execute(text("""
                    INSERT OR REPLACE INTO bidder_evaluation 
                    (tender_id, bidder_id, company_name, overall_verdict, verdicts_json, evaluated_at)
                    VALUES (:p1, :p2, :p3, :p4, :p5, :p6)
                """), {
                    "p1": eval_data["tender_id"],
                    "p2": bidder["bidder_id"],
                    "p3": bidder["company_name"],
                    "p4": bidder["overall_verdict"],
                    "p5": json.dumps(bidder["verdicts"]),
                    "p6": datetime.now(timezone.utc).isoformat(),
                })
            db.commit()
        print(f"  ✅ {len(eval_data.get('bidders', []))} bidder evaluations seeded")

    # 3. Seed milestones
    ms_path = MOCK_DIR / "milestones.json"
    if ms_path.exists():
        with open(ms_path, "r", encoding="utf-8") as f:
            ms_data = json.load(f)

        with SessionLocal() as db:
            for ms in ms_data.get("milestones", []):
                db.execute(text("""
                    INSERT OR REPLACE INTO milestone 
                    (id, contract_id, title, description, target_percent, current_percent,
                     status, payment_amount, payment_status, ai_verified, officer_confirmed, created_at)
                    VALUES (:p1, :p2, :p3, :p4, :p5, :p6, :p7, :p8, :p9, :p10, :p11, :p12)
                """), {
                    "p1": ms["id"],
                    "p2": ms_data["contract_id"],
                    "p3": ms["title"],
                    "p4": ms["description"],
                    "p5": ms["target_percent"],
                    "p6": ms["current_percent"],
                    "p7": ms["status"],
                    "p8": ms["payment_amount"],
                    "p9": ms["payment_status"],
                    "p10": 1 if ms.get("ai_verified") else 0,
                    "p11": 1 if ms.get("officer_confirmed") else 0,
                    "p12": datetime.now(timezone.utc).isoformat(),
                })
            db.commit()
        print(f"  ✅ {len(ms_data.get('milestones', []))} milestones seeded")

    # 4. Seed audit trail
    audit_path = MOCK_DIR / "audit_trail.json"
    if audit_path.exists():
        with open(audit_path, "r", encoding="utf-8") as f:
            audit_data = json.load(f)

        with SessionLocal() as db:
            for entry in audit_data:
                db.execute(text("""
                    INSERT INTO audit_log 
                    (timestamp, entity_type, entity_id, action, sha256_input, sha256_output,
                     model_version, officer_id, confidence, verdict)
                    VALUES (:p1, :p2, :p3, :p4, :p5, :p6, :p7, :p8, :p9, :p10)
                """), {
                    "p1": entry["timestamp"],
                    "p2": entry["entity_type"],
                    "p3": entry["entity_id"],
                    "p4": entry["action"],
                    "p5": entry["sha256_input"],
                    "p6": entry["sha256_output"],
                    "p7": entry.get("model_version"),
                    "p8": entry.get("officer_id"),
                    "p9": entry.get("confidence"),
                    "p10": entry.get("verdict"),
                })
            db.commit()
        print(f"  ✅ {len(audit_data)} audit entries seeded")

    # 5. Seed collusion report
    coll_path = MOCK_DIR / "collusion_results.json"
    if coll_path.exists():
        with open(coll_path, "r", encoding="utf-8") as f:
            coll_data = json.load(f)

        with SessionLocal() as db:
            db.execute(text("""
                INSERT INTO collusion_report (tender_id, flags_json, generated_at)
                VALUES (:p1, :p2, :p3)
            """), {
                "p1": coll_data["tender_id"],
                "p2": json.dumps(coll_data["flags"]),
                "p3": datetime.now(timezone.utc).isoformat(),
            })
            db.commit()
        print("  ✅ Collusion report seeded")

    print("\n🎉 Demo data seeded successfully!")
    print("   Run: cd backend && python -m uvicorn main:app --reload")


if __name__ == "__main__":
    seed()
