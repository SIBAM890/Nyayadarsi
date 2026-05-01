"""
Nyayadarsi Database Layer
SQLite with WAL mode for concurrent reads.
INSERT-only audit_log for tamper-evidence.
"""
import sqlite3
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path(__file__).resolve().parent / "nyayadarsi.db"


def get_connection():
    """Get a new database connection with WAL mode."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create all tables on startup."""
    conn = get_connection()
    cursor = conn.cursor()

    # Tender table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tender (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            department TEXT,
            category TEXT,
            estimated_value REAL,
            criteria_json TEXT,
            alerts_json TEXT,
            doc_hash TEXT,
            status TEXT DEFAULT 'draft',
            created_at TEXT NOT NULL,
            published_at TEXT,
            created_by TEXT
        )
    """)

    # Builder upload table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS builder_upload (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contract_id TEXT NOT NULL,
            upload_lat REAL NOT NULL,
            upload_lon REAL NOT NULL,
            distance_meters REAL NOT NULL,
            accepted INTEGER NOT NULL,
            rejection_reason TEXT,
            photo_paths TEXT,
            video_path TEXT,
            timestamp TEXT NOT NULL,
            audit_hash TEXT,
            verified_by TEXT,
            progress_percent REAL
        )
    """)

    # Audit log — append-only
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            sha256_input TEXT NOT NULL,
            sha256_output TEXT NOT NULL,
            model_version TEXT,
            officer_id TEXT,
            confidence REAL,
            verdict TEXT,
            details_json TEXT
        )
    """)

    # Bidder evaluations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bidder_evaluation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id TEXT NOT NULL,
            bidder_id TEXT NOT NULL,
            company_name TEXT NOT NULL,
            overall_verdict TEXT NOT NULL,
            verdicts_json TEXT NOT NULL,
            evaluated_at TEXT NOT NULL,
            FOREIGN KEY (tender_id) REFERENCES tender(id)
        )
    """)

    # Milestones
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS milestone (
            id TEXT PRIMARY KEY,
            contract_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            target_percent REAL NOT NULL,
            current_percent REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            payment_amount REAL,
            payment_status TEXT DEFAULT 'locked',
            payment_released_at TEXT,
            ai_verified INTEGER DEFAULT 0,
            officer_confirmed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    # Collusion reports
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS collusion_report (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id TEXT NOT NULL,
            flags_json TEXT NOT NULL,
            generated_at TEXT NOT NULL,
            reviewed_by TEXT,
            reviewed_at TEXT,
            FOREIGN KEY (tender_id) REFERENCES tender(id)
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")


if __name__ == "__main__":
    init_db()
