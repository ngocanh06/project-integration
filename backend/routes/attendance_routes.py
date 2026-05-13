# backend/routes/attendance_routes.py
from flask import Blueprint, jsonify, request
from config import get_mysql_connection
from validation.attendance_validation import validate_attendance_data, validate_attendance_update_data
from auth.jwt_handler import permission_required, token_required
from routes.audit_routes import log_action

attendance_bp = Blueprint('attendance', __name__)

# ======================================================
# GET: Lấy danh sách chấm công
# ======================================================
@attendance_bp.route("/attendance", methods=["GET"])
def get_attendance():
    try:
        month = request.args.get('month')
        employee_id = request.args.get('employee_id')
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        query = """
            SELECT a.AttendanceID, a.EmployeeID, e.FullName, 
                   a.WorkDays, a.AbsentDays, a.LeaveDays, 
                   a.AttendanceMonth, a.CreatedAt
            FROM attendance a
            JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
            WHERE 1=1
        """
        params = []
        
        if month:
            query += " AND DATE_FORMAT(a.AttendanceMonth, '%%Y-%%m') = %s"
            params.append(month)
        
        if employee_id:
            query += " AND a.EmployeeID = %s"
            params.append(employee_id)
        
        query += " ORDER BY a.AttendanceMonth DESC, a.EmployeeID"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        for row in rows:
            if row['AttendanceMonth']:
                row['AttendanceMonth'] = str(row['AttendanceMonth'])
            if row['CreatedAt']:
                row['CreatedAt'] = str(row['CreatedAt'])
        
        cursor.close()
        payroll_db.close()
        
        return jsonify(rows), 200
        
    except Exception as e:
        print("Lỗi GET attendance:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Analytics - Thống kê chấm công (QUAN TRỌNG)
# ======================================================
@attendance_bp.route("/attendance/analytics", methods=["GET"])
def get_attendance_analytics():
    try:
        year = request.args.get('year')
        month = request.args.get('month')
        
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        # Câu lệnh SQL để lấy dữ liệu
        query = """
            SELECT 
                a.EmployeeID,
                e.FullName,
                a.AttendanceMonth,
                a.WorkDays,
                a.AbsentDays,
                a.LeaveDays,
                d.DepartmentName
            FROM attendance a
            JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
            JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
            WHERE 1=1
        """
        params = []
        
        if year:
            query += " AND YEAR(a.AttendanceMonth) = %s"
            params.append(year)
        
        if month:
            query += " AND MONTH(a.AttendanceMonth) = %s"
            params.append(month)
        
        query += " ORDER BY a.AttendanceMonth DESC, a.AbsentDays DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Xử lý dữ liệu
        for row in rows:
            if row['AttendanceMonth']:
                row['AttendanceMonth'] = str(row['AttendanceMonth'])
        
        # ========== TÍNH TOÁN SUMMARY ==========
        total_records = len(rows)
        total_absent = sum(row['AbsentDays'] or 0 for row in rows)
        total_leave = sum(row['LeaveDays'] or 0 for row in rows)
        total_work_days = sum(row['WorkDays'] or 0 for row in rows)
        
        # Tính tỷ lệ phần trăm
        absence_rate = round((total_absent / (total_work_days + total_absent) * 100), 2) if (total_work_days + total_absent) > 0 else 0
        leave_rate = round((total_leave / (total_work_days + total_leave) * 100), 2) if (total_work_days + total_leave) > 0 else 0
        
        # ========== TOP 5 NHÂN VIÊN NGHỈ NHIỀU NHẤT ==========
        # Tính tổng absent theo nhân viên
        emp_absent = {}
        for row in rows:
            emp_id = row['EmployeeID']
            if emp_id not in emp_absent:
                emp_absent[emp_id] = {
                    'FullName': row['FullName'],
                    'total_absent': 0,
                    'total_leave': 0,
                    'months': []
                }
            emp_absent[emp_id]['total_absent'] += row['AbsentDays'] or 0
            emp_absent[emp_id]['total_leave'] += row['LeaveDays'] or 0
            emp_absent[emp_id]['months'].append({
                'month': row['AttendanceMonth'],
                'absent': row['AbsentDays'],
                'leave': row['LeaveDays']
            })
        
        # Sắp xếp và lấy top 5
        top_absent = sorted(emp_absent.values(), key=lambda x: x['total_absent'], reverse=True)[:5]
        
        top_absent_employees = [
            {
                'EmployeeID': emp_id,
                'FullName': emp['FullName'],
                'TotalAbsent': emp['total_absent'],
                'TotalLeave': emp['total_leave'],
                'Details': emp['months']
            }
            for emp_id, emp in list(emp_absent.items())[:5]
        ]
        
        # ========== THỐNG KÊ THEO PHÒNG BAN ==========
        dept_stats = {}
        for row in rows:
            dept = row['DepartmentName'] or 'Chưa xác định'
            if dept not in dept_stats:
                dept_stats[dept] = {
                    'employee_count': 0,
                    'total_absent': 0,
                    'total_leave': 0,
                    'employees': set()
                }
            dept_stats[dept]['employees'].add(row['EmployeeID'])
            dept_stats[dept]['total_absent'] += row['AbsentDays'] or 0
            dept_stats[dept]['total_leave'] += row['LeaveDays'] or 0
        
        for dept in dept_stats:
            dept_stats[dept]['employee_count'] = len(dept_stats[dept]['employees'])
            del dept_stats[dept]['employees']
        
        department_analytics = [
            {
                'department': dept,
                'employee_count': stats['employee_count'],
                'total_absent': stats['total_absent'],
                'total_leave': stats['total_leave'],
                'avg_absent': round(stats['total_absent'] / stats['employee_count'], 2) if stats['employee_count'] > 0 else 0,
                'avg_leave': round(stats['total_leave'] / stats['employee_count'], 2) if stats['employee_count'] > 0 else 0
            }
            for dept, stats in dept_stats.items()
        ]
        
        # ========== DỮ LIỆU CHI TIẾT ==========
        raw_data = [
            {
                'EmployeeID': row['EmployeeID'],
                'FullName': row['FullName'],
                'Department': row['DepartmentName'],
                'Month': row['AttendanceMonth'],
                'WorkDays': row['WorkDays'],
                'AbsentDays': row['AbsentDays'],
                'LeaveDays': row['LeaveDays']
            }
            for row in rows
        ]
        
        cursor.close()
        payroll_db.close()
        
        return jsonify({
            'summary': {
                'total_records': total_records,
                'total_work_days': total_work_days,
                'total_absent_days': total_absent,
                'total_leave_days': total_leave,
                'absence_rate': absence_rate,
                'leave_rate': leave_rate
            },
            'top_absent_employees': top_absent_employees,
            'department_analytics': department_analytics,
            'raw_data': raw_data
        }), 200
        
    except Exception as e:
        print("Lỗi GET attendance analytics:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# GET: Lấy chi tiết 1 bản ghi
# ======================================================
@attendance_bp.route("/attendance/<int:att_id>", methods=["GET"])
def get_attendance_by_id(att_id):
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT a.AttendanceID, a.EmployeeID, e.FullName, 
                   a.WorkDays, a.AbsentDays, a.LeaveDays, 
                   a.AttendanceMonth, a.CreatedAt
            FROM attendance a
            JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
            WHERE a.AttendanceID = %s
        """, (att_id,))
        
        row = cursor.fetchone()
        cursor.close()
        payroll_db.close()
        
        if not row:
            return jsonify({"error": "Attendance record not found"}), 404
        
        if row['AttendanceMonth']:
            row['AttendanceMonth'] = str(row['AttendanceMonth'])
        if row['CreatedAt']:
            row['CreatedAt'] = str(row['CreatedAt'])
        
        return jsonify(row), 200
        
    except Exception as e:
        print("Lỗi GET attendance by ID:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# POST: Thêm bản ghi chấm công
# ======================================================
@attendance_bp.route("/attendance", methods=["POST"])
def add_attendance():
    data = request.get_json()
    
    employee_id = data.get("EmployeeID")
    work_days = data.get("WorkDays")
    absent_days = data.get("AbsentDays", 0)
    leave_days = data.get("LeaveDays", 0)
    attendance_month = data.get("AttendanceMonth")
    
    # Validate dữ liệu
    is_valid, error_msg = validate_attendance_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        # Kiểm tra trùng
        cursor.execute("""
            SELECT COUNT(*) FROM attendance 
            WHERE EmployeeID = %s AND AttendanceMonth = %s
        """, (employee_id, attendance_month))
        
        if cursor.fetchone()[0] > 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Attendance record already exists for this month"}), 409
        
        # Thêm mới
        cursor.execute("""
            INSERT INTO attendance (EmployeeID, WorkDays, AbsentDays, LeaveDays, AttendanceMonth)
            VALUES (%s, %s, %s, %s, %s)
        """, (employee_id, work_days, absent_days, leave_days, attendance_month))
        
        payroll_db.commit()
        new_id = cursor.lastrowid
        
        cursor.close()
        payroll_db.close()

        log_action(
            user_id=current_user['user_id'],
            username=current_user['username'],
            action="CREATE",
            resource="ATTENDANCE",
            resource_id=new_id,
            new_value=data,
            status="success",
            ip_address=request.remote_addr
        )
        
        return jsonify({
            "message": "Attendance record added successfully",
            "AttendanceID": new_id
        }), 201
        
    except Exception as e:
        print("Lỗi POST attendance:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# PUT: Cập nhật bản ghi chấm công
# ======================================================
@attendance_bp.route("/attendance/<int:att_id>", methods=["PUT"])
def update_attendance(att_id):
    data = request.get_json()
    
    work_days = data.get("WorkDays")
    absent_days = data.get("AbsentDays")
    leave_days = data.get("LeaveDays")
    
    # Validate dữ liệu cho update
    is_valid, error_msg = validate_attendance_update_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM attendance WHERE AttendanceID = %s", (att_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Attendance record not found"}), 404
        
        cursor.execute("""
            UPDATE attendance 
            SET WorkDays = %s, AbsentDays = %s, LeaveDays = %s
            WHERE AttendanceID = %s
        """, (work_days, absent_days, leave_days, att_id))
        
        payroll_db.commit()
        cursor.close()
        payroll_db.close()

        log_action(
            user_id=current_user['user_id'],
            username=current_user['username'],
            action="UPDATE",
            resource="ATTENDANCE",
            resource_id=att_id,
            new_value=data,
            status="success",
            ip_address=request.remote_addr
        )
        
        return jsonify({"message": "Attendance record updated successfully"}), 200
        
    except Exception as e:
        print("Lỗi PUT attendance:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================================
# DELETE: Xóa bản ghi chấm công
# ======================================================
@attendance_bp.route("/attendance/<int:att_id>", methods=["DELETE"])
def delete_attendance(att_id):
    try:
        payroll_db = get_mysql_connection()
        cursor = payroll_db.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM attendance WHERE AttendanceID = %s", (att_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            payroll_db.close()
            return jsonify({"error": "Attendance record not found"}), 404
        
        cursor.execute("DELETE FROM attendance WHERE AttendanceID = %s", (att_id,))
        
        payroll_db.commit()
        cursor.close()
        payroll_db.close()

        log_action(
            user_id=current_user['user_id'],
            username=current_user['username'],
            action="DELETE",
            resource="ATTENDANCE",
            resource_id=att_id,
            status="success",
            ip_address=request.remote_addr
        )
        
        return jsonify({"message": "Attendance record deleted successfully"}), 200
        
    except Exception as e:
        print("Lỗi DELETE attendance:", str(e))
        return jsonify({"error": str(e)}), 500