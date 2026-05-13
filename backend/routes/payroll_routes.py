# backend/routes/payroll_routes.py
from flask import Blueprint, jsonify, request
from config import get_mysql_connection
from validation.payroll_validation import validate_salary_data, validate_salary_update_data

payroll_bp = Blueprint('payroll', __name__)

# ======================================================
# 1. View salary list (có filter theo month, employee)
# ======================================================
@payroll_bp.route("/payroll", methods=["GET"])
def get_payroll():
    try:
        month = request.args.get('month')
        employee_id = request.args.get('employee_id')
        department_id = request.args.get('department_id')
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT s.SalaryID, s.EmployeeID, e.FullName, 
                   s.SalaryMonth, s.BaseSalary, s.Bonus, 
                   s.Deductions, s.NetSalary, s.CreatedAt,
                   d.DepartmentID, d.DepartmentName
            FROM salaries s
            JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
            LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
            WHERE 1=1
        """
        params = []
        
        if month:
            query += " AND DATE_FORMAT(s.SalaryMonth, '%%Y-%%m') = %s"
            params.append(month)
        
        if employee_id:
            query += " AND s.EmployeeID = %s"
            params.append(employee_id)
        
        if department_id:
            query += " AND e.DepartmentID = %s"
            params.append(department_id)
        
        query += " ORDER BY s.SalaryMonth DESC, s.EmployeeID"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        for row in rows:
            if row['SalaryMonth']:
                row['SalaryMonth'] = str(row['SalaryMonth'])
            if row['CreatedAt']:
                row['CreatedAt'] = str(row['CreatedAt'])
            row['BaseSalary'] = float(row['BaseSalary']) if row['BaseSalary'] else 0
            row['Bonus'] = float(row['Bonus']) if row['Bonus'] else 0
            row['Deductions'] = float(row['Deductions']) if row['Deductions'] else 0
            row['NetSalary'] = float(row['NetSalary']) if row['NetSalary'] else 0
        
        cursor.close()
        payroll_db.close()
        
        return jsonify(rows), 200
        
    except Exception as e:
        print("Lỗi GET payroll:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# 2. View salary history of an employee
# ======================================================
@payroll_bp.route("/payroll/history/<int:emp_id>", methods=["GET"])
def get_salary_history(emp_id):
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT s.SalaryID, s.EmployeeID, e.FullName, 
                   s.SalaryMonth, s.BaseSalary, s.Bonus, 
                   s.Deductions, s.NetSalary, s.CreatedAt
            FROM salaries s
            JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
            WHERE s.EmployeeID = %s
            ORDER BY s.SalaryMonth DESC
        """, (emp_id,))
        
        rows = cursor.fetchall()
        
        for row in rows:
            if row['SalaryMonth']:
                row['SalaryMonth'] = str(row['SalaryMonth'])
            if row['CreatedAt']:
                row['CreatedAt'] = str(row['CreatedAt'])
            row['BaseSalary'] = float(row['BaseSalary']) if row['BaseSalary'] else 0
            row['Bonus'] = float(row['Bonus']) if row['Bonus'] else 0
            row['Deductions'] = float(row['Deductions']) if row['Deductions'] else 0
            row['NetSalary'] = float(row['NetSalary']) if row['NetSalary'] else 0
        
        cursor.close()
        payroll_db.close()
        
        return jsonify(rows), 200
        
    except Exception as e:
        print("Lỗi GET salary history:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# 3. Payroll summary for dashboard reports
# ======================================================
@payroll_bp.route("/payroll/summary", methods=["GET"])
def get_payroll_summary():
    try:
        month = request.args.get('month')
        year = request.args.get('year')
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT 
                COUNT(*) as total_employees,
                SUM(BaseSalary) as total_base_salary,
                SUM(Bonus) as total_bonus,
                SUM(Deductions) as total_deductions,
                SUM(NetSalary) as total_net_salary,
                AVG(NetSalary) as avg_salary,
                MIN(NetSalary) as min_salary,
                MAX(NetSalary) as max_salary
            FROM salaries
            WHERE 1=1
        """
        params = []
        
        if month:
            query += " AND DATE_FORMAT(SalaryMonth, '%%Y-%%m') = %s"
            params.append(month)
        
        if year:
            query += " AND YEAR(SalaryMonth) = %s"
            params.append(year)
        
        cursor.execute(query, params)
        summary = cursor.fetchone()
        
        # Thống kê theo phòng ban
        query_dept = """
            SELECT 
                d.DepartmentName,
                COUNT(*) as employee_count,
                SUM(s.BaseSalary) as total_base,
                SUM(s.Bonus) as total_bonus,
                SUM(s.Deductions) as total_deductions,
                SUM(s.NetSalary) as total_net,
                AVG(s.NetSalary) as avg_net
            FROM salaries s
            JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
            LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
            WHERE 1=1
        """
        
        if month:
            query_dept += " AND DATE_FORMAT(s.SalaryMonth, '%%Y-%%m') = %s"
            params_dept = [month]
        elif year:
            query_dept += " AND YEAR(s.SalaryMonth) = %s"
            params_dept = [year]
        else:
            params_dept = []
        
        query_dept += " GROUP BY d.DepartmentID ORDER BY total_net DESC"
        
        cursor.execute(query_dept, params_dept)
        dept_summary = cursor.fetchall()
        
        for row in dept_summary:
            row['total_base'] = float(row['total_base']) if row['total_base'] else 0
            row['total_bonus'] = float(row['total_bonus']) if row['total_bonus'] else 0
            row['total_deductions'] = float(row['total_deductions']) if row['total_deductions'] else 0
            row['total_net'] = float(row['total_net']) if row['total_net'] else 0
            row['avg_net'] = float(row['avg_net']) if row['avg_net'] else 0
        
        cursor.close()
        payroll_db.close()
        
        return jsonify({
            "summary": {
                "total_employees": summary['total_employees'] or 0,
                "total_base_salary": float(summary['total_base_salary']) if summary['total_base_salary'] else 0,
                "total_bonus": float(summary['total_bonus']) if summary['total_bonus'] else 0,
                "total_deductions": float(summary['total_deductions']) if summary['total_deductions'] else 0,
                "total_net_salary": float(summary['total_net_salary']) if summary['total_net_salary'] else 0,
                "avg_salary": float(summary['avg_salary']) if summary['avg_salary'] else 0,
                "min_salary": float(summary['min_salary']) if summary['min_salary'] else 0,
                "max_salary": float(summary['max_salary']) if summary['max_salary'] else 0
            },
            "department_summary": dept_summary
        }), 200
        
    except Exception as e:
        print("Lỗi GET payroll summary:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Lấy chi tiết 1 bản ghi lương
# ======================================================
@payroll_bp.route("/payroll/<int:salary_id>", methods=["GET"])
def get_salary_by_id(salary_id):
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT s.SalaryID, s.EmployeeID, e.FullName, 
                   s.SalaryMonth, s.BaseSalary, s.Bonus, 
                   s.Deductions, s.NetSalary, s.CreatedAt
            FROM salaries s
            JOIN employees_payroll e ON s.EmployeeID = e.EmployeeID
            WHERE s.SalaryID = %s
        """, (salary_id,))
        
        row = cursor.fetchone()
        cursor.close()
        payroll_db.close()
        
        if not row:
            return jsonify({"error": "Salary record not found"}), 404
        
        if row['SalaryMonth']:
            row['SalaryMonth'] = str(row['SalaryMonth'])
        if row['CreatedAt']:
            row['CreatedAt'] = str(row['CreatedAt'])
        row['BaseSalary'] = float(row['BaseSalary']) if row['BaseSalary'] else 0
        row['Bonus'] = float(row['Bonus']) if row['Bonus'] else 0
        row['Deductions'] = float(row['Deductions']) if row['Deductions'] else 0
        row['NetSalary'] = float(row['NetSalary']) if row['NetSalary'] else 0
        
        return jsonify(row), 200
        
    except Exception as e:
        print("Lỗi GET salary by ID:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# POST: Thêm bản ghi lương mới
# ======================================================
@payroll_bp.route("/payroll", methods=["POST"])
def add_salary():
    data = request.get_json()
    
    employee_id = data.get("EmployeeID")
    salary_month = data.get("SalaryMonth")
    base_salary = data.get("BaseSalary")
    bonus = data.get("Bonus", 0)
    deductions = data.get("Deductions", 0)
    net_salary = base_salary + bonus - deductions if base_salary else 0
    
    # Validate dữ liệu
    is_valid, error_msg = validate_salary_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) FROM salaries 
            WHERE EmployeeID = %s AND DATE_FORMAT(SalaryMonth, '%%Y-%%m') = DATE_FORMAT(%s, '%%Y-%%m')
        """, (employee_id, salary_month))
        
        if cursor.fetchone()[0] > 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Salary record already exists for this month"}), 409
        
        cursor.execute("""
            INSERT INTO salaries (EmployeeID, SalaryMonth, BaseSalary, Bonus, Deductions, NetSalary)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (employee_id, salary_month, base_salary, bonus, deductions, net_salary))
        
        payroll_db.commit()
        new_id = cursor.lastrowid
        
        cursor.close()
        payroll_db.close()
        
        return jsonify({
            "message": "Salary record added successfully",
            "SalaryID": new_id
        }), 201
        
    except Exception as e:
        print("Lỗi POST salary:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# PUT: Cập nhật bản ghi lương
# ======================================================
@payroll_bp.route("/payroll/<int:salary_id>", methods=["PUT"])
def update_salary(salary_id):
    data = request.get_json()
    
    base_salary = data.get("BaseSalary")
    bonus = data.get("Bonus", 0)
    deductions = data.get("Deductions", 0)
    net_salary = base_salary + bonus - deductions if base_salary else 0
    
    # Validate dữ liệu cho update
    is_valid, error_msg = validate_salary_update_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM salaries WHERE SalaryID = %s", (salary_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Salary record not found"}), 404
        
        cursor.execute("""
            UPDATE salaries 
            SET BaseSalary = %s, Bonus = %s, Deductions = %s, NetSalary = %s
            WHERE SalaryID = %s
        """, (base_salary, bonus, deductions, net_salary, salary_id))
        
        payroll_db.commit()
        cursor.close()
        payroll_db.close()
        
        return jsonify({"message": "Salary record updated successfully"}), 200
        
    except Exception as e:
        print("Lỗi PUT salary:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# DELETE: Xóa bản ghi lương
# ======================================================
@payroll_bp.route("/payroll/<int:salary_id>", methods=["DELETE"])
def delete_salary(salary_id):
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM salaries WHERE SalaryID = %s", (salary_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Salary record not found"}), 404
        
        cursor.execute("DELETE FROM salaries WHERE SalaryID = %s", (salary_id,))
        
        payroll_db.commit()
        cursor.close()
        payroll_db.close()
        
        return jsonify({"message": "Salary record deleted successfully"}), 200
        
    except Exception as e:
        print("Lỗi DELETE salary:", str(e))
        return jsonify({"error": str(e)}), 500