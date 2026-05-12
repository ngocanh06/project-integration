# backend/routes/employee_routes.py
from flask import Blueprint, jsonify, request
from auth.jwt_handler import permission_required
from config import get_sqlserver_connection, get_mysql_connection
from datetime import datetime

employee_bp = Blueprint('employees', __name__)

# ======================================================
# GET: Lấy danh sách nhân viên (kèm tên phòng ban, chức vụ)
# ======================================================
@employee_bp.route("/employees", methods=["GET"])
@permission_required('read', 'employees')
def get_employees(current_user):
    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()
        
        cur.execute("""
            SELECT 
                e.EmployeeID, 
                e.FullName, 
                e.Email, 
                e.PhoneNumber,
                e.HireDate,
                e.Status,
                d.DepartmentID,
                d.DepartmentName,
                p.PositionID,
                p.PositionName
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            ORDER BY e.EmployeeID
        """)
        
        employees = []
        for row in cur.fetchall():
            employees.append({
                "EmployeeID": row[0],
                "FullName": row[1],
                "Email": row[2],
                "PhoneNumber": row[3],
                "HireDate": row[4].isoformat() if row[4] else None,
                "Status": row[5],
                "DepartmentID": row[6],
                "DepartmentName": row[7],
                "PositionID": row[8],
                "PositionName": row[9]
            })
        
        cur.close()
        sql.close()
        return jsonify(employees), 200
        
    except Exception as e:
        print("Lỗi GET employees:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Lấy chi tiết 1 nhân viên theo ID
# ======================================================
@employee_bp.route("/employees/<int:emp_id>", methods=["GET"])
def get_employee_by_id(emp_id):
    try:
        sql = get_sqlserver_connection()
        cur = sql.cursor()
        
        cur.execute("""
            SELECT 
                e.EmployeeID, 
                e.FullName, 
                e.DateOfBirth,
                e.Gender,
                e.PhoneNumber, 
                e.Email, 
                e.HireDate,
                e.Status,
                e.DepartmentID,
                e.PositionID
            FROM Employees e
            WHERE e.EmployeeID = ?
        """, (emp_id,))
        
        row = cur.fetchone()
        cur.close()
        sql.close()
        
        if not row:
            return jsonify({"error": "Employee not found"}), 404
        
        employee = {
            "EmployeeID": row[0],
            "FullName": row[1],
            "DateOfBirth": row[2].isoformat() if row[2] else None,
            "Gender": row[3],
            "PhoneNumber": row[4],
            "Email": row[5],
            "HireDate": row[6].isoformat() if row[6] else None,
            "Status": row[7],
            "DepartmentID": row[8],
            "PositionID": row[9]
        }
        
        return jsonify(employee), 200
        
    except Exception as e:
        print("Lỗi GET employee by ID:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# POST: Thêm nhân viên mới (đồng bộ cả 2 DB)
# ======================================================
@employee_bp.route("/employees", methods=["POST"])
@permission_required('create', 'employees')
def add_employee(current_user):
    data = request.get_json()
    
    full_name = data.get("FullName")
    email = data.get("Email")
    phone = data.get("PhoneNumber")
    dob = data.get("DateOfBirth")
    gender = data.get("Gender")
    hire_date = data.get("HireDate")
    dept_id = data.get("DepartmentID")
    pos_id = data.get("PositionID")
    status = data.get("Status") or "Đang làm việc"
    
    if not full_name or not email:
        return jsonify({"error": "FullName and Email are required"}), 400
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra email trùng
    cur.execute("SELECT COUNT(*) FROM Employees WHERE Email = ?", (email,))
    if cur.fetchone()[0] > 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Email already exists"}), 409
    
    my = get_mysql_connection()
    sql.autocommit = False
    my.start_transaction()
    
    try:
        # Insert vào SQL Server
        cur.execute("""
            INSERT INTO Employees (FullName, Email, PhoneNumber, DateOfBirth, Gender, HireDate, DepartmentID, PositionID, Status)
            OUTPUT INSERTED.EmployeeID
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (full_name, email, phone, dob, gender, hire_date, dept_id, pos_id, status))
        
        row = cur.fetchone()
        new_id = int(row[0])
        
        # Insert vào MySQL (payroll)
        my_cur = my.cursor()
        my_cur.execute("""
            INSERT INTO employees_payroll (EmployeeID, FullName, DepartmentID, PositionID, Status)
            VALUES (%s, %s, %s, %s, %s)
        """, (new_id, full_name, dept_id, pos_id, status))
        
        sql.commit()
        my.commit()
        
        my_cur.close()
        
        cur.close()
        sql.close()
        my.close()
        
        return jsonify({
            "message": "Employee added successfully",
            "EmployeeID": new_id
        }), 201
        
    except Exception as e:
        sql.rollback()
        my.rollback()
        cur.close()
        sql.close()
        my.close()
        print("Lỗi POST employee:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# PUT: Cập nhật thông tin nhân viên
# ======================================================
@employee_bp.route("/employees/<int:emp_id>", methods=["PUT"])
def update_employee(emp_id):
    data = request.get_json()
    
    full_name = data.get("FullName")
    email = data.get("Email")
    phone = data.get("PhoneNumber")
    dob = data.get("DateOfBirth")
    gender = data.get("Gender")
    hire_date = data.get("HireDate")
    dept_id = data.get("DepartmentID")
    pos_id = data.get("PositionID")
    status = data.get("Status")
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra nhân viên tồn tại
    cur.execute("SELECT COUNT(*) FROM Employees WHERE EmployeeID = ?", (emp_id,))
    if cur.fetchone()[0] == 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Employee not found"}), 404
    
    my = get_mysql_connection()
    sql.autocommit = False
    my.start_transaction()
    
    try:
        # Update SQL Server
        cur.execute("""
            UPDATE Employees 
            SET FullName=?, Email=?, PhoneNumber=?, DateOfBirth=?, 
                Gender=?, HireDate=?, DepartmentID=?, PositionID=?, Status=?
            WHERE EmployeeID=?
        """, (full_name, email, phone, dob, gender, hire_date, dept_id, pos_id, status, emp_id))
        
        # Update MySQL
        my_cur = my.cursor()
        my_cur.execute("""
            UPDATE employees_payroll 
            SET FullName=%s, DepartmentID=%s, PositionID=%s, Status=%s
            WHERE EmployeeID=%s
        """, (full_name, dept_id, pos_id, status, emp_id))
        
        sql.commit()
        my.commit()
        
        my_cur.close()
        
        cur.close()
        sql.close()
        my.close()
        
        return jsonify({"message": "Employee updated successfully"}), 200
        
    except Exception as e:
        sql.rollback()
        my.rollback()
        cur.close()
        sql.close()
        my.close()
        print("Lỗi PUT employee:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# DELETE: Xóa nhân viên (kiểm tra ràng buộc)
# ======================================================
@employee_bp.route("/employees/<int:emp_id>", methods=["DELETE"])
def delete_employee(emp_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra nhân viên tồn tại
    cur.execute("SELECT COUNT(*) FROM Employees WHERE EmployeeID = ?", (emp_id,))
    if cur.fetchone()[0] == 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Employee not found"}), 404
    
    # Kiểm tra ràng buộc: có dividends không?
    cur.execute("SELECT COUNT(*) FROM Dividends WHERE EmployeeID = ?", (emp_id,))
    dividend_count = cur.fetchone()[0]
    
    if dividend_count > 0:
        cur.close()
        sql.close()
        return jsonify({"error": f"Cannot delete employee with {dividend_count} dividend records"}), 409
    
    # Kiểm tra ràng buộc: có salary records không?
    my = get_mysql_connection()
    my_cur = my.cursor()
    my_cur.execute("SELECT COUNT(*) FROM salaries WHERE EmployeeID = %s", (emp_id,))
    salary_count = my_cur.fetchone()[0]
    
    if salary_count > 0:
        my_cur.close()
        my.close()
        cur.close()
        sql.close()
        return jsonify({"error": f"Cannot delete employee with {salary_count} salary records"}), 409
    
    sql.autocommit = False
    my.start_transaction()
    
    try:
        # Xóa SQL Server
        cur.execute("DELETE FROM Employees WHERE EmployeeID = ?", (emp_id,))
        
        # Xóa MySQL (payroll)
        my_cur.execute("DELETE FROM employees_payroll WHERE EmployeeID = %s", (emp_id,))
        my_cur.execute("DELETE FROM attendance WHERE EmployeeID = %s", (emp_id,))
        
        sql.commit()
        my.commit()
        
        my_cur.close()
        cur.close()
        sql.close()
        my.close()
        
        return jsonify({"message": "Employee deleted successfully"}), 200
        
    except Exception as e:
        sql.rollback()
        my.rollback()
        cur.close()
        sql.close()
        my.close()
        print("Lỗi DELETE employee:", str(e))
        return jsonify({"error": str(e)}), 500