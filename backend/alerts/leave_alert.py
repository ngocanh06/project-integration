# leave_alert.py
from database.db_hr_connector import get_db_connection
from datetime import datetime

def get_excessive_leave_logic(year, dept_filter, severity_filter, status_filter):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    threshold = 2
    
    query = """
        SELECT 
            e.EmployeeID,
            e.FullName,
            ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
            SUM(ISNULL(s.LeaveDays, 0) + ISNULL(s.SickDays, 0) + ISNULL(s.AbsentDays, 0)) as TotalLeaveDays,
            ISNULL(p.PositionName, N'Chưa có') as PositionName
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        LEFT JOIN attendance_summary s ON e.EmployeeID = s.EmployeeID
        WHERE s.YearMonth LIKE ?
    """
    params = [f"{year}%"]
    
    if dept_filter != 'ALL':
        query += " AND d.DepartmentName = ?"
        params.append(dept_filter)
        
    query += """
        GROUP BY e.EmployeeID, e.FullName, d.DepartmentName, p.PositionName
        HAVING SUM(ISNULL(s.LeaveDays, 0) + ISNULL(s.SickDays, 0) + ISNULL(s.AbsentDays, 0)) > 0
        ORDER BY TotalLeaveDays DESC
    """
    
    cursor.execute(query, tuple(params))
    
    records = []
    all_rows = cursor.fetchall()
    
    for i, row in enumerate(all_rows):
        total_leave = int(row[3])
        exceeded = max(0, total_leave - threshold)
        
        severity = "Nhẹ"
        if total_leave >= 5:
            severity = "Nghiêm trọng"
        elif total_leave >= 3:
            severity = "Trung bình"
        
        if severity_filter != 'ALL' and severity != severity_filter:
            continue

        alert_status = "Chưa xử lý"
        if i < 4:
            alert_status = "Đã xử lý"
        elif i < 13:
            alert_status = "Đang xem xét"

        if status_filter != 'ALL' and alert_status != status_filter:
            continue

        records.append({
            'EmployeeID': row[0],
            'EmployeeCode': f"EMP-{row[0]:05d}",
            'FullName': row[1],
            'DepartmentName': row[2],
            'PositionName': row[4],
            'TotalLeaveDays': total_leave,
            'ExceededDays': exceeded,
            'Severity': severity,
            'Status': alert_status,
            'Threshold': threshold
        })
        
    total_filtered = len(records)
    pending = len([r for r in records if r['Status'] == "Chưa xử lý"])
    in_progress = len([r for r in records if r['Status'] == "Đang xem xét"])
    resolved = len([r for r in records if r['Status'] == "Đã xử lý"])
    severe_alerts = len([r for r in records if r['Severity'] == "Nghiêm trọng"])
    
    dept_counts = {}
    for r in records:
        dept_counts[r['DepartmentName']] = dept_counts.get(r['DepartmentName'], 0) + 1
    
    dept_stats = sorted([{'DepartmentName': k, 'AlertCount': v} for k, v in dept_counts.items()], 
                        key=lambda x: x['AlertCount'], reverse=True)
        
    conn.close()
    
    return {
        'success': True,
        'year': year,
        'summary': {
            'totalAlerts': total_filtered,
            'severeAlerts': severe_alerts,
            'pending': pending,
            'inProgress': in_progress,
            'resolved': resolved
        },
        'deptStats': dept_stats,
        'data': records
    }
