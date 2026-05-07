"""Alert Generator Service"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session


class AlertGenerator:
    """Generate various system alerts"""

    @staticmethod
    def create_alert(
        alert_type: str,
        title: str,
        message: str,
        severity: str = "info",
        related_user_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """Create a new alert (base method for all alert types)"""
        alert_data = {
            "alert_type": alert_type,
            "title": title,
            "message": message,
            "severity": severity,  # 'info', 'warning', 'critical'
            "related_user_id": related_user_id,
            "metadata": metadata,
            "created_at": datetime.utcnow().isoformat(),
            "is_read": False
        }
        return alert_data

    @staticmethod
    def generate_account_creation_alert(user_email: str, user_name: str) -> Dict[str, Any]:
        """Generate alert for new account creation"""
        return {
            "alert_type": "account_creation",
            "title": "New Account Created",
            "message": f"A new account has been created for {user_name} ({user_email}). Admin approval may be required.",
            "severity": "info",
            "metadata": {
                "user_email": user_email,
                "user_name": user_name
            }
        }

    @staticmethod
    def generate_failed_login_alert(email: str, attempt_count: int = 1) -> Dict[str, Any]:
        """Generate alert for failed login attempts"""
        severity = "warning" if attempt_count < 5 else "critical"
        return {
            "alert_type": "failed_login",
            "title": "Failed Login Attempt",
            "message": f"Failed login attempt for {email}. Attempt #{attempt_count}.",
            "severity": severity,
            "metadata": {
                "email": email,
                "attempt_count": attempt_count
            }
        }

    @staticmethod
    def generate_password_change_alert(user_email: str, user_name: str) -> Dict[str, Any]:
        """Generate alert for password changes"""
        return {
            "alert_type": "password_change",
            "title": "Password Changed",
            "message": f"The password for {user_name} ({user_email}) was successfully changed.",
            "severity": "info",
            "metadata": {
                "user_email": user_email,
                "user_name": user_name
            }
        }

    @staticmethod
    def generate_user_role_change_alert(user_email: str, old_role: str, new_role: str) -> Dict[str, Any]:
        """Generate alert for user role changes"""
        return {
            "alert_type": "user_role_change",
            "title": "User Role Changed",
            "message": f"User {user_email} role was changed from {old_role} to {new_role}.",
            "severity": "warning",
            "metadata": {
                "user_email": user_email,
                "old_role": old_role,
                "new_role": new_role
            }
        }

    @staticmethod
    def generate_permission_denied_alert(user_email: str, resource: str, action: str) -> Dict[str, Any]:
        """Generate alert for unauthorized access attempts"""
        return {
            "alert_type": "permission_denied",
            "title": "Unauthorized Access Attempt",
            "message": f"User {user_email} attempted unauthorized {action} on {resource}.",
            "severity": "warning",
            "metadata": {
                "user_email": user_email,
                "resource": resource,
                "action": action
            }
        }

    @staticmethod
    def generate_suspicious_activity_alert(user_email: str, activity: str) -> Dict[str, Any]:
        """Generate alert for suspicious user activity"""
        return {
            "alert_type": "suspicious_activity",
            "title": "Suspicious Activity Detected",
            "message": f"Suspicious activity detected for user {user_email}: {activity}",
            "severity": "critical",
            "metadata": {
                "user_email": user_email,
                "activity": activity
            }
        }
