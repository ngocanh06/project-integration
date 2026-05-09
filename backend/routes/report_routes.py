# backend/routes/report_routes.py
from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection, get_mysql_connection

report_bp = Blueprint('reports', __name__)

# ======================================================
# HR REPORTS
# ======================================================

@report_bp.route("/reports/hr/employee-count", methods=["GET"])
def get_employee_count():
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        cursor.execute("SELECT COUNT(*) FROM Employees")
        total = cursor.fetchone()[0]
        cursor.close()
        sql.close()
        return jsonify({"total_employees": total}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/hr/gender-distribution", methods=["GET"])
def get_gender_distribution():
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        cursor.execute("""
            SELECT CASE WHEN Gender IS NULL THEN 'Chưa cập nhật' ELSE Gender END as gender, COUNT(*) as count
            FROM Employees
            GROUP BY CASE WHEN Gender IS NULL THEN 'Chưa cập nhật' ELSE Gender END
        """)
        rows = [{"gender": r[0], "count": r[1]} for r in cursor.fetchall()]
        cursor.close()
        sql.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/hr/department-distribution", methods=["GET"])
def get_department_distribution():
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        cursor.execute("""
            SELECT d.DepartmentName, COUNT(e.EmployeeID) as count
            FROM Departments d
            LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
            GROUP BY d.DepartmentID, d.DepartmentName
            ORDER BY count DESC
        """)
        rows = [{"department": r[0], "count": r[1]} for r in cursor.fetchall()]
        cursor.close()
        sql.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# PAYROLL REPORTS
# ======================================================

@report_bp.route("/reports/payroll/total-cost", methods=["GET"])
def get_total_salary_cost():
    try:
        year = request.args.get('year')
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = "SELECT SUM(NetSalary) as total_cost, COUNT(*) as employee_count FROM salaries"
        if year:
            query += " WHERE YEAR(SalaryMonth) = %s"
            cursor.execute(query, (year,))
        else:
            cursor.execute(query)
        
        result = cursor.fetchone()
        cursor.close()
        payroll_db.close()
        
        return jsonify({
            "total_cost": float(result['total_cost']) if result['total_cost'] else 0,
            "employee_count": result['employee_count'] or 0
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/payroll/by-department", methods=["GET"])
def get_salary_by_department():
    try:
        year = request.args.get('year')
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT 
                d.DepartmentName,
                COUNT(DISTINCT s.EmployeeID) as employee_count,
                SUM(s.NetSalary) as total_net,
                AVG(s.NetSalary) as avg_net
            FROM salaries s
            JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
            LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        """
        if year:
            query += " WHERE YEAR(s.SalaryMonth) = %s"
            query += " GROUP BY d.DepartmentID"
            cursor.execute(query, (year,))
        else:
            query += " GROUP BY d.DepartmentID"
            cursor.execute(query)
        
        rows = cursor.fetchall()
        cursor.close()
        payroll_db.close()
        
        result = []
        for row in rows:
            result.append({
                "department": row['DepartmentName'] or "Chưa xác định",
                "employee_count": row['employee_count'],
                "total_net": float(row['total_net']) if row['total_net'] else 0,
                "avg_net": float(row['avg_net']) if row['avg_net'] else 0
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/payroll/trend", methods=["GET"])
def get_salary_trend():
    try:
        year = request.args.get('year')
        if not year:
            return jsonify({"error": "Year parameter is required"}), 400
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                DATE_FORMAT(SalaryMonth, '%%Y-%%m') as month,
                SUM(NetSalary) as total_net,
                COUNT(*) as employee_count
            FROM salaries
            WHERE YEAR(SalaryMonth) = %s
            GROUP BY DATE_FORMAT(SalaryMonth, '%%Y-%%m')
            ORDER BY month ASC
        """, (year,))
        
        rows = cursor.fetchall()
        cursor.close()
        payroll_db.close()
        
        result = []
        for row in rows:
            result.append({
                "month": row['month'],
                "total_net": float(row['total_net']) if row['total_net'] else 0,
                "employee_count": row['employee_count']
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# ATTENDANCE REPORTS
# ======================================================

@report_bp.route("/reports/attendance/leave-rate", methods=["GET"])
def get_leave_absence_rate():
    try:
        year = request.args.get('year')
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT 
                SUM(WorkDays) as total_work,
                SUM(AbsentDays) as total_absent,
                SUM(LeaveDays) as total_leave,
                COUNT(*) as total_records
            FROM attendance
        """
        if year:
            query += " WHERE YEAR(AttendanceMonth) = %s"
            cursor.execute(query, (year,))
        else:
            cursor.execute(query)
        
        result = cursor.fetchone()
        cursor.close()
        payroll_db.close()
        
        total_work = result['total_work'] or 0
        total_absent = result['total_absent'] or 0
        total_leave = result['total_leave'] or 0
        
        return jsonify({
            "total_work_days": total_work,
            "total_absent": total_absent,
            "total_leave": total_leave,
            "absence_rate": round((total_absent / (total_work + total_absent) * 100), 2) if (total_work + total_absent) > 0 else 0,
            "leave_rate": round((total_leave / (total_work + total_leave) * 100), 2) if (total_work + total_leave) > 0 else 0,
            "total_records": result['total_records'] or 0
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/attendance/monthly-summary", methods=["GET"])
def get_monthly_attendance_summary():
    try:
        year = request.args.get('year')
        if not year:
            return jsonify({"error": "Year parameter is required"}), 400
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                DATE_FORMAT(AttendanceMonth, '%%Y-%%m') as month,
                SUM(WorkDays) as total_work,
                SUM(AbsentDays) as total_absent,
                SUM(LeaveDays) as total_leave,
                COUNT(*) as records
            FROM attendance
            WHERE YEAR(AttendanceMonth) = %s
            GROUP BY DATE_FORMAT(AttendanceMonth, '%%Y-%%m')
            ORDER BY month ASC
        """, (year,))
        
        rows = cursor.fetchall()
        cursor.close()
        payroll_db.close()
        
        result = []
        for row in rows:
            result.append({
                "month": row['month'],
                "total_work": row['total_work'] or 0,
                "total_absent": row['total_absent'] or 0,
                "total_leave": row['total_leave'] or 0,
                "records": row['records'] or 0
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# DIVIDEND REPORTS
# ======================================================

@report_bp.route("/reports/dividends/total", methods=["GET"])
def get_total_dividends():
    try:
        year = request.args.get('year')
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        # Sửa câu lệnh SQL: không có %s nếu không dùng year
        if year:
            cursor.execute("""
                SELECT 
                    SUM(DividendAmount) as total_dividends,
                    COUNT(*) as total_records,
                    COUNT(DISTINCT EmployeeID) as employee_count
                FROM Dividends
                WHERE YEAR(DividendDate) = ?
            """, (year,))
        else:
            cursor.execute("""
                SELECT 
                    SUM(DividendAmount) as total_dividends,
                    COUNT(*) as total_records,
                    COUNT(DISTINCT EmployeeID) as employee_count
                FROM Dividends
            """)
        
        row = cursor.fetchone()
        cursor.close()
        sql.close()
        
        return jsonify({
            "total_dividends": float(row[0]) if row[0] else 0,
            "total_records": row[1] or 0,
            "employee_count": row[2] or 0,
            "year": year or "all"
        }), 200
        
    except Exception as e:
        print("Lỗi GET total dividends:", str(e))
        return jsonify({"error": str(e)}), 500

@report_bp.route("/reports/dividends/per-employee", methods=["GET"])
def get_dividends_per_employee():
    try:
        year = request.args.get('year')
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        if year:
            cursor.execute("""
                SELECT 
                    e.EmployeeID,
                    e.FullName,
                    d.DepartmentName,
                    SUM(dv.DividendAmount) as total_dividends,
                    COUNT(dv.DividendID) as dividend_count
                FROM Dividends dv
                JOIN Employees e ON dv.EmployeeID = e.EmployeeID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                WHERE YEAR(dv.DividendDate) = ?
                GROUP BY e.EmployeeID, e.FullName, d.DepartmentName
                ORDER BY total_dividends DESC
            """, (year,))
        else:
            cursor.execute("""
                SELECT 
                    e.EmployeeID,
                    e.FullName,
                    d.DepartmentName,
                    SUM(dv.DividendAmount) as total_dividends,
                    COUNT(dv.DividendID) as dividend_count
                FROM Dividends dv
                JOIN Employees e ON dv.EmployeeID = e.EmployeeID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                GROUP BY e.EmployeeID, e.FullName, d.DepartmentName
                ORDER BY total_dividends DESC
            """)
        
        rows = cursor.fetchall()
        cursor.close()
        sql.close()
        
        result = []
        for row in rows:
            result.append({
                "EmployeeID": row[0],
                "FullName": row[1],
                "DepartmentName": row[2] or "Chưa xác định",
                "total_dividends": float(row[3]) if row[3] else 0,
                "dividend_count": row[4] or 0
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print("Lỗi GET dividends per employee:", str(e))
        return jsonify({"error": str(e)}), 500
