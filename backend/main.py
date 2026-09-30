import os
import json
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import UPLOAD_DIR
from db import init_db, save_report, get_all_reports, get_report_by_id
from aws_service import upload_file_to_s3, extract_text_with_textract
from ai_service import analyze_medical_report
from dynamodb_service import save_critical_alert, get_critical_alerts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medicare-backend")

app = FastAPI(title="MediCare AI API", version="1.0.0")

# CORS middleware for React frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows localhost:3000 and EC2 public IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve local uploads for image/PDF preview fallback
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def startup_event():
    logger.info("Initializing MediCare AI backend database...")
    init_db()

@app.get("/")
def read_root():
    return {"message": "MediCare AI Backend is running", "status": "online"}

@app.post("/upload-report")
async def upload_report(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    report_type: str = Form(...)
):
    """
    POST /upload-report
    1. Receive file + patient_name + report_type
    2. Upload file to S3 bucket (medicare-reports-2026)
    3. Call AWS Textract detect_document_text
    4. Call OpenAI API gpt-4o-mini for simplification, Tanglish translation, abnormal values, and food advice
    5. Save to RDS PostgreSQL table reports
    6. If is_critical, save to DynamoDB table CriticalAlerts
    7. Return AI summary payload
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    filename = file.filename or "report.pdf"
    
    # 1. Upload to S3 (or local fallback)
    s3_key, s3_url = upload_file_to_s3(file_bytes, filename)
    
    # 2. Extract Text via AWS Textract
    extracted_text = extract_text_with_textract(file_bytes, s3_key=s3_key)
    
    # 3. Analyze with OpenAI GPT-4o-mini
    ai_result = analyze_medical_report(extracted_text, report_type=report_type)
    
    en_summary = ai_result.get("en_summary", [])
    ta_summary = ai_result.get("ta_summary", [])
    abnormal_values = ai_result.get("abnormal", [])
    is_critical = ai_result.get("is_critical", False)
    food_advice = ai_result.get("advice", "")
    
    # Convert summary lists to string for storage in PostgreSQL
    en_summary_str = "\n".join(en_summary) if isinstance(en_summary, list) else str(en_summary)
    ta_summary_str = "\n".join(ta_summary) if isinstance(ta_summary, list) else str(ta_summary)

    # 4. Save report in PostgreSQL (RDS)
    saved_report = save_report(
        patient_name=patient_name,
        report_type=report_type,
        s3_image_url=s3_url,
        extracted_text=extracted_text,
        ai_summary_en=en_summary_str,
        ai_summary_ta=ta_summary_str,
        is_critical=is_critical,
        abnormal_values=abnormal_values,
        food_advice=food_advice
    )
    
    report_id = saved_report.get("id")

    # 5. If critical, save to DynamoDB table CriticalAlerts
    if is_critical:
        alert_msg = f"Critical medical parameters identified for patient {patient_name} in {report_type}."
        save_critical_alert(
            report_id=str(report_id),
            patient_name=patient_name,
            alert_message=alert_msg,
            abnormal_params=abnormal_values
        )

    # 6. Return response matching frontend contract
    return {
        "success": True,
        "message": "Report processed successfully",
        "data": {
            "id": report_id,
            "patient_name": patient_name,
            "report_type": report_type,
            "s3_image_url": s3_url,
            "extracted_text": extracted_text,
            "ai_summary_en": en_summary,
            "ai_summary_ta": ta_summary,
            "abnormal_values": abnormal_values,
            "is_critical": is_critical,
            "food_advice": food_advice,
            "uploaded_at": saved_report.get("uploaded_at")
        }
    }

@app.get("/reports")
def get_reports():
    """GET /reports: Return all reports from RDS PostgreSQL."""
    reports = get_all_reports()
    return {"success": True, "count": len(reports), "data": reports}

@app.get("/critical-alerts")
def get_alerts():
    """GET /critical-alerts: Return all critical alerts from DynamoDB."""
    alerts = get_critical_alerts()
    return {"success": True, "count": len(alerts), "data": alerts}

@app.get("/report/{id}")
def get_report(id: int):
    """GET /report/{id}: Return single report details."""
    report = get_report_by_id(id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report with ID {id} not found")
    return {"success": True, "data": report}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
