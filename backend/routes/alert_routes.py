# backend/routes/alert_routes.py
from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection, get_mysql_connection
from datetime import datetime

alert_bp = Blueprint('alerts', __name__)

# ======================================================
# 1. Work Anniversary Alerts
# ======================================================
@alert_bp.route("/alerts/anniversary", methods=["GET"])
def get_anniversary_alerts():
    try:
        today = datetime.now().date()
        
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        # Lấy tất cả nhân viên để theo dõi kỷ niệm
        cursor.execute("""
            SELECT 
                e.EmployeeID, 
                e.FullName, 
                e.HireDate,
                d.DepartmentName,
                p.PositionName,
                e.Email
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            ORDER BY e.EmployeeID
        """)
        
        rows = cursor.fetchall()
        cursor.close()
        sql.close()
        
        alerts = []
        for row in rows:
            hire_date = row[2]
            if not hire_date:
                continue
                
            # Tính số năm đã làm
            years = today.year - hire_date.year
            
            # Tính ngày kỷ niệm tiếp theo
            next_anniversary = datetime(today.year, hire_date.month, hire_date.day).date()
            if next_anniversary < today:
                next_anniversary = datetime(today.year + 1, hire_date.month, hire_date.day).date()
                years_at_next = years + 1
            else:
                years_at_next = years
            
            days_remaining = (next_anniversary - today).days
            
            alerts.append({
                "id": row[0],
                "type": "anniversary",
                "title": f"Kỷ niệm làm việc",
                "message": f"{row[1]} đã làm việc được {years} năm",
                "employee_id": row[0],
                "employee_name": row[1],
                "department": row[3] or "N/A",
                "position": row[4] or "N/A",
                "email": row[5] or "N/A",
                "years": years,
                "years_next": years_at_next,
                "date": str(hire_date),
                "next_date": str(next_anniversary),
                "days_remaining": days_remaining,
                "created_at": str(today)
            })
        
        return jsonify(alerts), 200
        
        return jsonify(alerts), 200
        
    except Exception as e:
        print("Lỗi GET anniversary alerts:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# 2. Excessive Leave Alerts (nghỉ quá 20 ngày/tháng)
# ======================================================
@alert_bp.route("/alerts/excessive-leave", methods=["GET"])
def get_excessive_leave_alerts():
    try:
        month = request.args.get('month')
        threshold = request.args.get('threshold', 20)
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT a.EmployeeID, e.FullName, a.AttendanceMonth, a.LeaveDays, a.AbsentDays
            FROM attendance a
            JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
            WHERE (a.LeaveDays + a.AbsentDays) > %s
        """
        params = [threshold]
        
        if month:
            query += " AND DATE_FORMAT(a.AttendanceMonth, '%%Y-%%m') = %s"
            params.append(month)
        
        query += " ORDER BY (a.LeaveDays + a.AbsentDays) DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        payroll_db.close()
        
        alerts = []
        for row in rows:
            total_off = (row['LeaveDays'] or 0) + (row['AbsentDays'] or 0)
            alerts.append({
                "id": row['EmployeeID'],
                "type": "excessive_leave",
                "title": f"Cảnh báo nghỉ quá nhiều",
                "message": f"{row['FullName']} nghỉ {total_off} ngày trong tháng {row['AttendanceMonth']}",
                "employee_id": row['EmployeeID'],
                "employee_name": row['FullName'],
                "leave_days": row['LeaveDays'] or 0,
                "absent_days": row['AbsentDays'] or 0,
                "total_off": total_off,
                "month": str(row['AttendanceMonth']) if row['AttendanceMonth'] else None,
                "threshold": threshold
            })
        
        return jsonify(alerts), 200
        
    except Exception as e:
        print("Lỗi GET excessive leave alerts:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# 3. Salary Discrepancy Alerts (chênh lệch > 15%)
# ======================================================
@alert_bp.route("/alerts/salary-discrepancy", methods=["GET"])
def get_salary_discrepancy_alerts():
    try:
        month = request.args.get('month')
        threshold = request.args.get('threshold', 15)
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        # Lấy lương tháng hiện tại và tháng trước
        if month:
            target_month = month
        else:
            # Lấy tháng hiện tại
            target_month = datetime.now().strftime('%Y-%m')
        
        # Lấy tháng trước
        year, month_num = map(int, target_month.split('-'))
        if month_num == 1:
            prev_month = f"{year-1}-12"
        else:
            prev_month = f"{year}-{month_num-1:02d}"
        
        cursor.execute("""
            SELECT 
                s_current.EmployeeID,
                e.FullName,
                s_current.SalaryMonth as current_month,
                s_current.NetSalary as current_salary,
                s_prev.NetSalary as previous_salary,
                ABS((s_current.NetSalary - s_prev.NetSalary) / s_prev.NetSalary * 100) as change_percent
            FROM salaries s_current
            JOIN employees_payroll e ON s_current.EmployeeID = e.EmployeeID
            JOIN salaries s_prev ON s_current.EmployeeID = s_prev.EmployeeID 
                AND DATE_FORMAT(s_prev.SalaryMonth, '%%Y-%%m') = %s
            WHERE DATE_FORMAT(s_current.SalaryMonth, '%%Y-%%m') = %s
                AND ABS((s_current.NetSalary - s_prev.NetSalary) / s_prev.NetSalary * 100) > %s
            ORDER BY change_percent DESC
        """, (prev_month, target_month, threshold))
        
        rows = cursor.fetchall()
        cursor.close()
        payroll_db.close()
        
        alerts = []
        for row in rows:
            alerts.append({
                "id": row['EmployeeID'],
                "type": "salary_discrepancy",
                "title": f"Cảnh báo lương bất thường",
                "message": f"{row['FullName']} có lương thay đổi {row['change_percent']:.1f}% ({row['previous_salary']:,} → {row['current_salary']:,})",
                "employee_id": row['EmployeeID'],
                "employee_name": row['FullName'],
                "current_salary": float(row['current_salary']) if row['current_salary'] else 0,
                "previous_salary": float(row['previous_salary']) if row['previous_salary'] else 0,
                "change_percent": round(row['change_percent'], 1),
                "current_month": row['current_month'],
                "previous_month": prev_month,
                "threshold": threshold
            })
        
        return jsonify(alerts), 200
        
    except Exception as e:
        print("Lỗi GET salary discrepancy alerts:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# 4. Get all alerts (tổng hợp)
# ======================================================
@alert_bp.route("/alerts/all", methods=["GET"])
def get_all_alerts():
    try:
        from concurrent.futures import ThreadPoolExecutor
        import requests
        
        def get_anniversary():
            return get_anniversary_alerts().json
        
        def get_excessive_leave():
            return get_excessive_leave_alerts().json
        
        def get_salary_discrepancy():
            return get_salary_discrepancy_alerts().json
        
        # Gọi 3 API và tổng hợp
        anniversary_alerts = get_anniversary_alerts().json
        excessive_alerts = get_excessive_leave_alerts().json
        salary_alerts = get_salary_discrepancy_alerts().json
        
        all_alerts = []
        if isinstance(anniversary_alerts, list):
            all_alerts.extend(anniversary_alerts)
        if isinstance(excessive_alerts, list):
            all_alerts.extend(excessive_alerts)
        if isinstance(salary_alerts, list):
            all_alerts.extend(salary_alerts)
        
        return jsonify(all_alerts), 200
        
    except Exception as e:
        print("Lỗi GET all alerts:", str(e))
        return jsonify({"error": str(e)}), 500