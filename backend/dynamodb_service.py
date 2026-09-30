import logging
from datetime import datetime
import boto3
from config import DYNAMO_TABLE, AWS_REGION

logger = logging.getLogger(__name__)

# Local in-memory / cache store for offline testing
_LOCAL_CRITICAL_ALERTS = []

def save_critical_alert(report_id: str, patient_name: str, alert_message: str, abnormal_params: list):
    """Save critical alert to DynamoDB table CriticalAlerts."""
    timestamp = datetime.utcnow().isoformat()
    alert_item = {
        "report_id": str(report_id),
        "patient_name": patient_name,
        "alert_message": alert_message,
        "abnormal_params": abnormal_params,
        "timestamp": timestamp
    }
    
    try:
        dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        table = dynamodb.Table(DYNAMO_TABLE)
        table.put_item(Item=alert_item)
        logger.info(f"Critical alert saved to DynamoDB for report_id={report_id}")
    except Exception as e:
        logger.warning(f"DynamoDB save failed ({e}). Saving to local critical alert cache.")
        _LOCAL_CRITICAL_ALERTS.append(alert_item)

def get_critical_alerts() -> list:
    """Scan and fetch all critical alerts from DynamoDB (or local cache)."""
    try:
        dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        table = dynamodb.Table(DYNAMO_TABLE)
        response = table.scan()
        items = response.get('Items', [])
        # Combine with any local items
        all_items = items + [item for item in _LOCAL_CRITICAL_ALERTS if item.get('report_id') not in [i.get('report_id') for i in items]]
        all_items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return all_items
    except Exception as e:
        logger.warning(f"DynamoDB scan failed ({e}). Returning local critical alerts cache.")
        return sorted(_LOCAL_CRITICAL_ALERTS, key=lambda x: x.get('timestamp', ''), reverse=True)
