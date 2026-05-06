from flask import Blueprint, jsonify, request
from database.db_payroll_connector import get_mysql_connection, test_mysql_connection


mysql_bp = Blueprint("mysql", __name__, url_prefix="/api/mysql")


@mysql_bp.route("/test", methods=["GET"])
def mysql_test():
    """Quick connectivity check for MySQL."""
    result = test_mysql_connection()
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code


@mysql_bp.route("/attendance", methods=["GET"])
def mysql_attendance():
    """
    Return attendance rows from MySQL.
    Query params:
      - limit (default 50, max 500)
    """
    conn = None
    try:
        limit = int(request.args.get("limit", 50))
        limit = max(1, min(limit, 500))

        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT attendanceid, employeeid, workday, workedhrs, leavedays, attendanceDate, createDate
            FROM attendance
            ORDER BY attendanceid DESC
            LIMIT %s
            """,
            (limit,),
        )
        rows = cursor.fetchall()

        return jsonify({"success": True, "count": len(rows), "data": rows})
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()
