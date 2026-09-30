import os
import json
import logging
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlite3
from config import RDS_ENDPOINT, RDS_DB, RDS_USER, RDS_PASS, RDS_PORT

logger = logging.getLogger(__name__)

# Check if RDS is configured (not empty, not default placeholder)
USE_RDS = bool(RDS_ENDPOINT and "your-rds-endpoint" not in RDS_ENDPOINT)
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "medicare.db")

def get_postgres_connection():
    try:
        conn = psycopg2.connect(
            host=RDS_ENDPOINT,
            database=RDS_DB,
            user=RDS_USER,
            password=RDS_PASS,
            port=RDS_PORT,
            connect_timeout=5
        )
        return conn
    except Exception as e:
        logger.warning(f"Failed to connect to PostgreSQL RDS ({e}). Falling back to SQLite.")
        return None

def get_sqlite_connection():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables (RDS PostgreSQL or local SQLite)."""
    if USE_RDS:
        conn = get_postgres_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS reports (
                            id SERIAL PRIMARY KEY,
                            patient_name VARCHAR(100),
                            report_type VARCHAR(50),
                            s3_image_url VARCHAR(255),
                            extracted_text TEXT,
                            ai_summary_en TEXT,
                            ai_summary_ta TEXT,
                            is_critical BOOLEAN,
                            abnormal_values TEXT,
                            food_advice TEXT,
                            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                    conn.commit()
                conn.close()
                logger.info("PostgreSQL database initialized successfully.")
                return
            except Exception as e:
                logger.error(f"Error initializing PostgreSQL DB: {e}")
                if conn:
                    conn.close()

    # Fallback to SQLite
    conn = get_sqlite_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_name TEXT,
                report_type TEXT,
                s3_image_url TEXT,
                extracted_text TEXT,
                ai_summary_en TEXT,
                ai_summary_ta TEXT,
                is_critical BOOLEAN,
                abnormal_values TEXT,
                food_advice TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
    conn.close()
    logger.info("SQLite fallback database initialized successfully.")

def save_report(patient_name: str, report_type: str, s3_image_url: str, extracted_text: str, 
                ai_summary_en: str, ai_summary_ta: str, is_critical: bool, abnormal_values: list, food_advice: str) -> dict:
    """Save a report to the database and return the saved report object with ID."""
    abnormal_str = json.dumps(abnormal_values) if isinstance(abnormal_values, list) else str(abnormal_values)
    
    if USE_RDS:
        conn = get_postgres_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        INSERT INTO reports (patient_name, report_type, s3_image_url, extracted_text, 
                                             ai_summary_en, ai_summary_ta, is_critical, abnormal_values, food_advice)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, patient_name, report_type, s3_image_url, extracted_text, 
                                  ai_summary_en, ai_summary_ta, is_critical, abnormal_values, food_advice, uploaded_at;
                    """, (patient_name, report_type, s3_image_url, extracted_text, 
                          ai_summary_en, ai_summary_ta, is_critical, abnormal_str, food_advice))
                    saved = dict(cur.fetchone())
                    conn.commit()
                conn.close()
                if isinstance(saved.get('uploaded_at'), datetime):
                    saved['uploaded_at'] = saved['uploaded_at'].isoformat()
                try:
                    saved['abnormal_values'] = json.loads(saved.get('abnormal_values') or '[]')
                except Exception:
                    saved['abnormal_values'] = []
                return saved
            except Exception as e:
                logger.error(f"PostgreSQL insert failed: {e}. Falling back to SQLite.")
                if conn:
                    conn.close()

    # SQLite fallback
    conn = get_sqlite_connection()
    now_str = datetime.utcnow().isoformat()
    with conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO reports (patient_name, report_type, s3_image_url, extracted_text, 
                                 ai_summary_en, ai_summary_ta, is_critical, abnormal_values, food_advice, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (patient_name, report_type, s3_image_url, extracted_text, 
              ai_summary_en, ai_summary_ta, 1 if is_critical else 0, abnormal_str, food_advice, now_str))
        report_id = cur.lastrowid
    conn.close()

    return {
        "id": report_id,
        "patient_name": patient_name,
        "report_type": report_type,
        "s3_image_url": s3_image_url,
        "extracted_text": extracted_text,
        "ai_summary_en": ai_summary_en,
        "ai_summary_ta": ai_summary_ta,
        "is_critical": is_critical,
        "abnormal_values": abnormal_values,
        "food_advice": food_advice,
        "uploaded_at": now_str
    }

def get_all_reports() -> list:
    """Retrieve all reports from database."""
    if USE_RDS:
        conn = get_postgres_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM reports ORDER BY id DESC;")
                    rows = [dict(r) for r in cur.fetchall()]
                conn.close()
                for r in rows:
                    if isinstance(r.get('uploaded_at'), datetime):
                        r['uploaded_at'] = r['uploaded_at'].isoformat()
                    try:
                        r['abnormal_values'] = json.loads(r.get('abnormal_values') or '[]')
                    except Exception:
                        r['abnormal_values'] = []
                return rows
            except Exception as e:
                logger.error(f"PostgreSQL fetch failed: {e}. Falling back to SQLite.")
                if conn:
                    conn.close()

    # SQLite fallback
    conn = get_sqlite_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM reports ORDER BY id DESC;")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    for r in rows:
        r['is_critical'] = bool(r['is_critical'])
        try:
            r['abnormal_values'] = json.loads(r.get('abnormal_values') or '[]')
        except Exception:
            r['abnormal_values'] = []
    return rows

def get_report_by_id(report_id: int) -> dict:
    """Retrieve a single report by ID."""
    if USE_RDS:
        conn = get_postgres_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM reports WHERE id = %s;", (report_id,))
                    row = cur.fetchone()
                conn.close()
                if row:
                    row = dict(row)
                    if isinstance(row.get('uploaded_at'), datetime):
                        row['uploaded_at'] = row['uploaded_at'].isoformat()
                    try:
                        row['abnormal_values'] = json.loads(row.get('abnormal_values') or '[]')
                    except Exception:
                        row['abnormal_values'] = []
                    return row
            except Exception as e:
                logger.error(f"PostgreSQL fetch by ID failed: {e}")
                if conn:
                    conn.close()

    # SQLite fallback
    conn = get_sqlite_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM reports WHERE id = ?;", (report_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        r = dict(row)
        r['is_critical'] = bool(r['is_critical'])
        try:
            r['abnormal_values'] = json.loads(r.get('abnormal_values') or '[]')
        except Exception:
            r['abnormal_values'] = []
        return r
    return None
