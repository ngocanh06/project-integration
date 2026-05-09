# backend/routes/dividend_routes.py
from flask import Blueprint, jsonify, request
from config import get_sqlserver_connection
from datetime import datetime

dividend_bp = Blueprint('dividends', __name__)

# ======================================================
# GET: Lấy danh sách cổ tức
# ======================================================
@dividend_bp.route("/dividends", methods=["GET"])
def get_dividends():
    try:
        year = request.args.get('year')
        employee_id = request.args.get('employee_id')
        
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        query = """
            SELECT 
                d.DividendID,
                d.EmployeeID,
                e.FullName,
                dep.DepartmentName,
                d.DividendAmount,
                d.DividendDate,
                d.CreatedAt
            FROM Dividends d
            JOIN Employees e ON d.EmployeeID = e.EmployeeID
            LEFT JOIN Departments dep ON e.DepartmentID = dep.DepartmentID
            WHERE 1=1
        """
        params = []
        
        if year:
            query += " AND YEAR(d.DividendDate) = ?"
            params.append(year)
        
        if employee_id:
            query += " AND d.EmployeeID = ?"
            params.append(employee_id)
        
        query += " ORDER BY d.DividendDate DESC, d.DividendID"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        cursor.close()
        sql.close()
        
        dividends = []
        for row in rows:
            dividends.append({
                "DividendID": row[0],
                "EmployeeID": row[1],
                "FullName": row[2],
                "DepartmentName": row[3] or "Chưa xác định",
                "DividendAmount": float(row[4]) if row[4] else 0,
                "DividendDate": str(row[5]) if row[5] else None,
                "CreatedAt": str(row[6]) if row[6] else None
            })
        
        return jsonify(dividends), 200
        
    except Exception as e:
        print("Lỗi GET dividends:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Lấy chi tiết 1 cổ tức
# ======================================================
@dividend_bp.route("/dividends/<int:dividend_id>", methods=["GET"])
def get_dividend_by_id(dividend_id):
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        cursor.execute("""
            SELECT 
                d.DividendID,
                d.EmployeeID,
                e.FullName,
                dep.DepartmentName,
                d.DividendAmount,
                d.DividendDate,
                d.CreatedAt
            FROM Dividends d
            JOIN Employees e ON d.EmployeeID = e.EmployeeID
            LEFT JOIN Departments dep ON e.DepartmentID = dep.DepartmentID
            WHERE d.DividendID = ?
        """, (dividend_id,))
        
        row = cursor.fetchone()
        cursor.close()
        sql.close()
        
        if not row:
            return jsonify({"error": "Dividend not found"}), 404
        
        dividend = {
            "DividendID": row[0],
            "EmployeeID": row[1],
            "FullName": row[2],
            "DepartmentName": row[3] or "Chưa xác định",
            "DividendAmount": float(row[4]) if row[4] else 0,
            "DividendDate": str(row[5]) if row[5] else None,
            "CreatedAt": str(row[6]) if row[6] else None
        }
        
        return jsonify(dividend), 200
        
    except Exception as e:
        print("Lỗi GET dividend by ID:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# POST: Thêm cổ tức mới
# ======================================================
@dividend_bp.route("/dividends", methods=["POST"])
def add_dividend():
    data = request.get_json()
    
    employee_id = data.get("EmployeeID")
    dividend_amount = data.get("DividendAmount")
    dividend_date = data.get("DividendDate")
    
    if not employee_id or not dividend_amount or not dividend_date:
        return jsonify({"error": "EmployeeID, DividendAmount and DividendDate are required"}), 400
    
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        # Kiểm tra nhân viên tồn tại
        cursor.execute("SELECT COUNT(*) FROM Employees WHERE EmployeeID = ?", (employee_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            sql.close()
            return jsonify({"error": "Employee not found"}), 404
        
        cursor.execute("""
            INSERT INTO Dividends (EmployeeID, DividendAmount, DividendDate, CreatedAt)
            VALUES (?, ?, ?, GETDATE())
        """, (employee_id, dividend_amount, dividend_date))
        
        sql.commit()
        new_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        
        cursor.close()
        sql.close()
        
        return jsonify({
            "message": "Dividend added successfully",
            "DividendID": new_id
        }), 201
        
    except Exception as e:
        print("Lỗi POST dividend:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# PUT: Cập nhật cổ tức
# ======================================================
@dividend_bp.route("/dividends/<int:dividend_id>", methods=["PUT"])
def update_dividend(dividend_id):
    data = request.get_json()
    
    dividend_amount = data.get("DividendAmount")
    dividend_date = data.get("DividendDate")
    
    if not dividend_amount or not dividend_date:
        return jsonify({"error": "DividendAmount and DividendDate are required"}), 400
    
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM Dividends WHERE DividendID = ?", (dividend_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            sql.close()
            return jsonify({"error": "Dividend not found"}), 404
        
        cursor.execute("""
            UPDATE Dividends 
            SET DividendAmount = ?, DividendDate = ?
            WHERE DividendID = ?
        """, (dividend_amount, dividend_date, dividend_id))
        
        sql.commit()
        cursor.close()
        sql.close()
        
        return jsonify({"message": "Dividend updated successfully"}), 200
        
    except Exception as e:
        print("Lỗi PUT dividend:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# DELETE: Xóa cổ tức
# ======================================================
@dividend_bp.route("/dividends/<int:dividend_id>", methods=["DELETE"])
def delete_dividend(dividend_id):
    try:
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM Dividends WHERE DividendID = ?", (dividend_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            sql.close()
            return jsonify({"error": "Dividend not found"}), 404
        
        cursor.execute("DELETE FROM Dividends WHERE DividendID = ?", (dividend_id,))
        
        sql.commit()
        cursor.close()
        sql.close()
        
        return jsonify({"message": "Dividend deleted successfully"}), 200
        
    except Exception as e:
        print("Lỗi DELETE dividend:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Thống kê cổ tức theo năm
# ======================================================
@dividend_bp.route("/dividends/summary", methods=["GET"])
def get_dividend_summary():
    try:
        year = request.args.get('year')
        
        sql = get_sqlserver_connection()
        cursor = sql.cursor()
        
        if year:
            cursor.execute("""
                SELECT 
                    YEAR(DividendDate) as year,
                    SUM(DividendAmount) as total,
                    COUNT(*) as count,
                    COUNT(DISTINCT EmployeeID) as employees
                FROM Dividends
                WHERE YEAR(DividendDate) = ?
                GROUP BY YEAR(DividendDate)
            """, (year,))
        else:
            cursor.execute("""
                SELECT 
                    YEAR(DividendDate) as year,
                    SUM(DividendAmount) as total,
                    COUNT(*) as count,
                    COUNT(DISTINCT EmployeeID) as employees
                FROM Dividends
                GROUP BY YEAR(DividendDate)
                ORDER BY year DESC
            """)
        
        rows = cursor.fetchall()
        cursor.close()
        sql.close()
        
        summary = []
        for row in rows:
            summary.append({
                "year": row[0],
                "total": float(row[1]) if row[1] else 0,
                "count": row[2] or 0,
                "employees": row[3] or 0
            })
        
        return jsonify(summary), 200
        
    except Exception as e:
        print("Lỗi GET dividend summary:", str(e))
        return jsonify({"error": str(e)}), 500