# attendance_service.py
from database.db_hr_connector import get_db_connection
from datetime import datetime

def fmt_dt(v):
    """Chuyen datetime Python sang ISO string cho frontend"""
    if v is None:
        return None
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    return str(v)

def get_status_text(status):
    """Chuyển đổi status sang text hiển thị"""
    status_map = {
        'Present': 'Đi làm',
        'Late': 'Đi muộn',
        'Absent': 'Vắng mặt',
        'Leave': 'Nghỉ phép',
        'Sick': 'Nghỉ ốm',
        'Early': 'Về sớm',
        'Holiday': 'Nghỉ lễ'
    }
    return status_map.get(status, status)

def get_today_attendance_logic(date_str):
    dt_obj = datetime.strptime(date_str, '%Y-%m-%d')
    conn = get_db_connection()
    cursor = conn.cursor()

    if dt_obj.weekday() >= 5:
        cursor.execute("""
            SELECT 
                e.EmployeeID,
                e.FullName,
                ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
                ISNULL(p.PositionName, N'Chưa có') as PositionName
            FROM Employees e
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            ORDER BY e.FullName
        """)
        employees = cursor.fetchall()
        records = []
        for emp in employees:
            records.append({
                'AttendanceID': 0,
                'EmployeeID': emp[0],
                'EmployeeCode': f"EMP-{emp[0]:05d}",
                'AttendanceDate': date_str,
                'CheckInTime': None,
                'CheckOutTime': None,
                'Status': 'Holiday',
                'StatusText': get_status_text('Holiday'),
                'WorkHours': 0,
                'LateMinutes': 0,
                'OvertimeHours': 0,
                'FullName': emp[1],
                'DepartmentName': emp[2],
                'PositionName': emp[3]
            })
        
        conn.close()
        return {
            'success': True,
            'date': date_str,
            'stats': {
                'total': len(records),
                'present': 0,
                'late': 0,
                'absent': 0,
                'leave': 0,
                'sick': 0,
                'holiday': len(records)
            },
            'data': records
        }

    query = """
        SELECT 
            a.AttendanceID,
            a.EmployeeID,
            a.AttendanceDate,
            a.CheckInTime,
            a.CheckOutTime,
            a.Status,
            ISNULL(a.WorkHours, 0) as WorkHours,
            ISNULL(a.LateMinutes, 0) as LateMinutes,
            ISNULL(a.OvertimeHours, 0) as OvertimeHours,
            e.FullName,
            e.Email,
            e.PhoneNumber,
            ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
            ISNULL(p.PositionName, N'Chưa có') as PositionName
        FROM attendance_today a
        JOIN Employees e ON a.EmployeeID = e.EmployeeID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE a.AttendanceDate = ?
        ORDER BY e.FullName
    """
    cursor.execute(query, (date_str,))
    
    records = []
    for row in cursor.fetchall():
        records.append({
            'AttendanceID': row[0],
            'EmployeeID': row[1],
            'EmployeeCode': f"EMP-{row[1]:05d}",
            'AttendanceDate': str(row[2]),
            'CheckInTime': fmt_dt(row[3]),
            'CheckOutTime': fmt_dt(row[4]),
            'Status': row[5],
            'StatusText': get_status_text(row[5]),
            'WorkHours': float(row[6]) if row[6] else 0,
            'LateMinutes': int(row[7]) if row[7] else 0,
            'OvertimeHours': float(row[8]) if row[8] else 0,
            'FullName': row[9],
            'Email': row[10],
            'PhoneNumber': row[11],
            'DepartmentName': row[12],
            'PositionName': row[13]
        })
    
    conn.close()
    
    stats = {
        'total': len(records),
        'present': sum(1 for r in records if r['Status'] == 'Present'),
        'late': sum(1 for r in records if r['Status'] == 'Late'),
        'absent': sum(1 for r in records if r['Status'] == 'Absent'),
        'leave': sum(1 for r in records if r['Status'] == 'Leave'),
        'sick': sum(1 for r in records if r['Status'] == 'Sick'),
        'holiday': sum(1 for r in records if r['Status'] == 'Holiday')
    }
    
    return {
        'success': True,
        'date': date_str,
        'stats': stats,
        'data': records
    }

def get_all_employees_logic():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            e.EmployeeID,
            e.FullName,
            e.DateOfBirth,
            e.Gender,
            e.PhoneNumber,
            e.Email,
            FORMAT(e.HireDate, 'dd/MM/yyyy') as HireDate,
            e.Status,
            ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
            ISNULL(p.PositionName, N'Chưa có') as PositionName
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE e.Status IN (N'Đang làm việc', N'Nghỉ phép', N'Thử việc', N'Thực tập')
        ORDER BY e.EmployeeID
    """)
    
    employees = []
    for row in cursor.fetchall():
        employees.append({
            'EmployeeID': row[0],
            'EmployeeCode': f"EMP-{row[0]:05d}",
            'FullName': row[1],
            'DateOfBirth': str(row[2]) if row[2] else None,
            'Gender': row[3],
            'PhoneNumber': row[4],
            'Email': row[5],
            'HireDate': row[6],
            'Status': row[7],
            'DepartmentName': row[8],
            'PositionName': row[9]
        })
    
    conn.close()
    return {'success': True, 'data': employees}

def get_dashboard_stats_logic():
    conn = get_db_connection()
    cursor = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    current_month = datetime.now().strftime('%Y-%m')
    
    cursor.execute("""
        SELECT 
            COUNT(*) as Total,
            SUM(CASE WHEN Status = 'Present' THEN 1 ELSE 0 END) as Present,
            SUM(CASE WHEN Status = 'Late' THEN 1 ELSE 0 END) as Late,
            SUM(CASE WHEN Status = 'Absent' THEN 1 ELSE 0 END) as Absent,
            SUM(CASE WHEN Status = 'Leave' THEN 1 ELSE 0 END) as LeaveDays,
            SUM(CASE WHEN Status = 'Sick' THEN 1 ELSE 0 END) as SickDays
        FROM attendance_today
        WHERE AttendanceDate = ?
    """, (today,))
    row = cursor.fetchone()
    
    today_stats = {
        'total': row[0] or 0,
        'present': row[1] or 0,
        'late': row[2] or 0,
        'absent': row[3] or 0,
        'leave': row[4] or 0,
        'sick': row[5] or 0
    }
    
    cursor.execute("SELECT COUNT(*) FROM Employees WHERE Status = N'\u0110ang l\u00e0m vi\u1ec7c'")
    total_employees = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'success': True,
        'total_employees': total_employees,
        'today': today_stats,
        'current_date': today,
        'current_month': current_month
    }

def get_departments_logic():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DepartmentID, DepartmentName 
        FROM Departments 
        ORDER BY DepartmentName
    """)
    
    departments = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    
    conn.close()
    return {'success': True, 'data': departments}

def get_positions_logic():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT PositionID, PositionName 
        FROM Positions 
        ORDER BY PositionName
    """)
    
    positions = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    
    conn.close()
    return {'success': True, 'data': positions}
