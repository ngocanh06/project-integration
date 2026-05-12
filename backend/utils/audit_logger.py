# backend/utils/audit_logger.py
from config import get_auth_connection
from datetime import datetime

def log_action(user_id, username, action, resource, resource_id=None, ip_address=None, status="success", error_message=None):
    try:
        auth_db = get_auth_connection()
        cursor = auth_db.cursor()
        
        cursor.execute("""
            INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, status, error_message, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, username, action, resource, resource_id, ip_address, status, error_message, datetime.now()))
        
        auth_db.commit()
        cursor.close()
        auth_db.close()
    except Exception as e:
        print(f"Failed to log action: {e}")