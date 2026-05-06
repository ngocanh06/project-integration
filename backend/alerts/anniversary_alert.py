# anniversary_alert.py
from database.db_hr_connector import get_db_connection
from datetime import datetime

def get_work_anniversary_logic(month=None):
    """
    Logic lấy danh sách cảnh báo kỷ niệm ngày làm việc.
    Được thêm vào theo cấu trúc COMPANY_X_INTEGRATION.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Logic có thể phát triển thêm để query CSDL lấy nhân viên có ngày kỷ niệm
    current_month = month or datetime.now().strftime('%m')
    
    cursor.execute("""
        SELECT 
            e.EmployeeID,
            e.FullName,
            ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
            ISNULL(p.PositionName, N'Chưa có') as PositionName,
            e.HireDate
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE e.Status IN (N'Đang làm việc') 
        AND MONTH(e.HireDate) = ?
    """, (current_month,))
    
    records = []
    current_year = datetime.now().year
    
    for row in cursor.fetchall():
        hire_date = row[4]
        years_worked = 0
        if hire_date:
            if isinstance(hire_date, str):
                hire_date = datetime.strptime(hire_date[:10], '%Y-%m-%d')
            years_worked = current_year - hire_date.year
            
        if years_worked > 0:
            records.append({
                'EmployeeID': row[0],
                'EmployeeCode': f"EMP-{row[0]:05d}",
                'FullName': row[1],
                'DepartmentName': row[2],
                'PositionName': row[3],
                'HireDate': hire_date.strftime('%d/%m/%Y') if hire_date else None,
                'YearsWorked': years_worked
            })
    
    conn.close()
    
    return {
        'success': True,
        'month': current_month,
        'data': records
    }
