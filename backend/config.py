import os
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

S3_BUCKET = os.getenv("S3_BUCKET", "medicare-reports-2026")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

RDS_ENDPOINT = os.getenv("RDS_ENDPOINT", "")
RDS_DB = os.getenv("RDS_DB", "medicare_db")
RDS_USER = os.getenv("RDS_USER", "postgres")
RDS_PASS = os.getenv("RDS_PASS", "password")
RDS_PORT = int(os.getenv("RDS_PORT", "5432"))

DYNAMO_TABLE = os.getenv("DYNAMO_TABLE", "CriticalAlerts")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Local Uploads Directory for local preview / fallback
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
