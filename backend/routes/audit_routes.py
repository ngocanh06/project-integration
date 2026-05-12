# backend/routes/audit_routes.py
from flask import Blueprint, jsonify, request
from config import get_auth_connection
from auth.jwt_handler import admin_required
import datetime

audit_bp = Blueprint('audit', __name__)

# ======================================================
# Hàm tiện ích: ghi log vào bảng audit_logs
# ======================================================
def log_action(user_id, username, action, resource=None, resource_id=None,
               old_value=None, new_value=None, status="success",
               error_message=None, ip_address=None, user_agent=None):
    """Ghi một hành động vào bảng audit_logs."""
    import json
    try:
        conn = get_auth_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs
                (user_id, username, action, resource, resource_id,
                 old_value, new_value, ip_address, user_agent, status, error_message, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, username, action, resource, resource_id,
            json.dumps(old_value, ensure_ascii=False) if old_value else None,
            json.dumps(new_value, ensure_ascii=False) if new_value else None,
            ip_address, user_agent, status, error_message,
            datetime.datetime.now()
        ))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("Lỗi ghi audit log:", str(e))

# ======================================================
# GET: Lấy danh sách audit logs (Admin only)
# ======================================================
@audit_bp.route("/admin/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs(current_user):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        # Filters từ query params
        page      = max(1, int(request.args.get("page", 1)))
        per_page  = min(100, int(request.args.get("per_page", 20)))
        search    = request.args.get("search", "").strip()
        action_f  = request.args.get("action", "").strip()
        status_f  = request.args.get("status", "").strip()
        date_from = request.args.get("date_from", "").strip()
        date_to   = request.args.get("date_to", "").strip()
        resource_f = request.args.get("resource", "").strip()

        conditions = []
        params = []

        if search:
            conditions.append("(username LIKE %s OR action LIKE %s OR resource LIKE %s)")
            like = f"%{search}%"
            params.extend([like, like, like])
        if action_f:
            conditions.append("action = %s")
            params.append(action_f)
        if status_f:
            conditions.append("status = %s")
            params.append(status_f)
        if resource_f:
            conditions.append("resource = %s")
            params.append(resource_f)
        if date_from:
            conditions.append("DATE(created_at) >= %s")
            params.append(date_from)
        if date_to:
            conditions.append("DATE(created_at) <= %s")
            params.append(date_to)

        where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

        # Count tổng
        cursor.execute(f"SELECT COUNT(*) as total FROM audit_logs {where_clause}", params)
        total = cursor.fetchone()["total"]

        # Phân trang
        offset = (page - 1) * per_page
        cursor.execute(
            f"""SELECT log_id, user_id, username, action, resource, resource_id,
                       ip_address, status, error_message, created_at
                FROM audit_logs {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s""",
            params + [per_page, offset]
        )
        logs = cursor.fetchall()

        for log in logs:
            if log.get("created_at"):
                log["created_at"] = log["created_at"].isoformat()

        # Distinct actions & resources cho bộ lọc
        cursor.execute("SELECT DISTINCT action FROM audit_logs WHERE action IS NOT NULL ORDER BY action")
        actions = [r["action"] for r in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT resource FROM audit_logs WHERE resource IS NOT NULL ORDER BY resource")
        resources = [r["resource"] for r in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify({
            "status": "success",
            "data": logs,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
            "actions": actions,
            "resources": resources,
        }), 200

    except Exception as e:
        print("Lỗi GET audit logs:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# GET: Thống kê nhanh audit logs
# ======================================================
@audit_bp.route("/admin/audit-logs/stats", methods=["GET"])
@admin_required
def get_audit_stats(current_user):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) as total FROM audit_logs")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs WHERE status='success'")
        success = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs WHERE status='error' OR status='failed'")
        errors = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs WHERE DATE(created_at) = CURDATE()")
        today = cursor.fetchone()["cnt"]

        cursor.execute("""
            SELECT action, COUNT(*) as cnt
            FROM audit_logs
            WHERE action IS NOT NULL
            GROUP BY action
            ORDER BY cnt DESC
            LIMIT 5
        """)
        top_actions = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "status": "success",
            "data": {
                "total": total,
                "success": success,
                "errors": errors,
                "today": today,
                "top_actions": top_actions,
            }
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500
