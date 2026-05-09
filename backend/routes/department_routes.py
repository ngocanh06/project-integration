# backend/routes/department_routes.py
from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection

department_bp = Blueprint('departments', __name__)

@department_bp.route("/departments", methods=["GET"])
def get_departments():
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("""
        SELECT DepartmentID, DepartmentName, CreatedAt, UpdatedAt 
        FROM Departments 
        ORDER BY DepartmentName
    """)
    
    rows = []
    for r in cur.fetchall():
        rows.append({
            "DepartmentID": r[0],
            "DepartmentName": r[1],
            "CreatedAt": r[2].isoformat() if r[2] else None,
            "UpdatedAt": r[3].isoformat() if r[3] else None
        })
    
    cur.close()
    sql.close()
    return jsonify(rows)

@department_bp.route("/departments/<int:dept_id>", methods=["GET"])
def get_department_by_id(dept_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    cur.execute("""
        SELECT DepartmentID, DepartmentName, CreatedAt, UpdatedAt 
        FROM Departments 
        WHERE DepartmentID = ?
    """, (dept_id,))
    
    row = cur.fetchone()
    cur.close()
    sql.close()
    
    if not row:
        return jsonify({"error": "Department not found"}), 404
    
    return jsonify({
        "DepartmentID": row[0],
        "DepartmentName": row[1],
        "CreatedAt": row[2].isoformat() if row[2] else None,
        "UpdatedAt": row[3].isoformat() if row[3] else None
    })

@department_bp.route("/departments", methods=["POST"])
def add_department():
    data = request.get_json()
    department_name = data.get("DepartmentName")
    
    if not department_name:
        return jsonify({"error": "Department name required"}), 400
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra tên phòng ban đã tồn tại chưa
    cur.execute("SELECT COUNT(*) FROM Departments WHERE DepartmentName = ?", (department_name,))
    if cur.fetchone()[0] > 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Department already exists"}), 409
    
    # Thêm phòng ban mới
    cur.execute("""
        INSERT INTO Departments (DepartmentName, CreatedAt, UpdatedAt)
        VALUES (?, GETDATE(), GETDATE())
    """, (department_name,))
    
    # Lấy ID vừa tạo
    cur.execute("SELECT @@IDENTITY")
    new_id = cur.fetchone()[0]
    
    # Lấy thông tin vừa tạo
    cur.execute("""
        SELECT DepartmentID, DepartmentName, CreatedAt, UpdatedAt 
        FROM Departments 
        WHERE DepartmentID = ?
    """, (new_id,))
    
    row = cur.fetchone()
    
    sql.commit()
    cur.close()
    sql.close()
    
    return jsonify({
        "message": "Department added",
        "DepartmentID": row[0],
        "DepartmentName": row[1],
        "CreatedAt": row[2].isoformat() if row[2] else None,
        "UpdatedAt": row[3].isoformat() if row[3] else None
    }), 201

@department_bp.route("/departments/<int:dept_id>", methods=["PUT"])
def update_department(dept_id):
    data = request.get_json()
    department_name = data.get("DepartmentName")
    
    if not department_name:
        return jsonify({"error": "Department name required"}), 400
    
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra phòng ban tồn tại
    cur.execute("SELECT COUNT(*) FROM Departments WHERE DepartmentID = ?", (dept_id,))
    if cur.fetchone()[0] == 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Department not found"}), 404
    
    # Cập nhật
    cur.execute("""
        UPDATE Departments 
        SET DepartmentName = ?, UpdatedAt = GETDATE() 
        WHERE DepartmentID = ?
    """, (department_name, dept_id))
    
    # Lấy thông tin sau khi cập nhật
    cur.execute("""
        SELECT DepartmentID, DepartmentName, CreatedAt, UpdatedAt 
        FROM Departments 
        WHERE DepartmentID = ?
    """, (dept_id,))
    
    row = cur.fetchone()
    
    sql.commit()
    cur.close()
    sql.close()
    
    return jsonify({
        "message": "Department updated",
        "DepartmentID": row[0],
        "DepartmentName": row[1],
        "CreatedAt": row[2].isoformat() if row[2] else None,
        "UpdatedAt": row[3].isoformat() if row[3] else None
    }), 200

@department_bp.route("/departments/<int:dept_id>", methods=["DELETE"])
def delete_department(dept_id):
    sql = get_sqlserver_connection()
    cur = sql.cursor()
    
    # Kiểm tra phòng ban có nhân viên không
    cur.execute("SELECT COUNT(*) FROM Employees WHERE DepartmentID = ?", (dept_id,))
    employee_count = cur.fetchone()[0]
    
    if employee_count > 0:
        cur.close()
        sql.close()
        return jsonify({
            "error": f"Cannot delete department with {employee_count} employees"
        }), 409
    
    # Kiểm tra phòng ban tồn tại
    cur.execute("SELECT COUNT(*) FROM Departments WHERE DepartmentID = ?", (dept_id,))
    if cur.fetchone()[0] == 0:
        cur.close()
        sql.close()
        return jsonify({"error": "Department not found"}), 404
    
    # Xóa phòng ban
    cur.execute("DELETE FROM Departments WHERE DepartmentID = ?", (dept_id,))
    
    sql.commit()
    cur.close()
    sql.close()
    
    return jsonify({"message": "Department deleted successfully"}), 200