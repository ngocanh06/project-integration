# attendance_analytics.py
from database.db_hr_connector import get_db_connection
from datetime import datetime

def get_attendance_summary_logic(year_month):
    conn = get_db_connection()
    cursor = conn.cursor()

    if not year_month:
        cursor.execute("""
            SELECT TOP 1 YearMonth 
            FROM attendance_summary 
            ORDER BY YearMonth DESC
        """)
        row = cursor.fetchone()
        year_month = row[0] if row else datetime.now().strftime('%Y-%m')
    
    cursor.execute("""
        SELECT 
            s.SummaryID,
            s.EmployeeID,
            s.YearMonth,
            s.TotalWorkDays,
            s.PresentDays,
            s.AbsentDays,
            s.LateDays,
            s.EarlyLeaveDays,
            s.HolidayDays,
            s.SickDays,
            s.LeaveDays,
            s.TotalWorkHours,
            s.TotalOvertimeHours,
            s.TotalLateMinutes,
            s.TotalEarlyLeaveMinutes,
            s.LastUpdated,
            s.CreatedAt,
            s.UpdatedAt,
            e.FullName,
            ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
            ISNULL(p.PositionName, N'Chưa có') as PositionName
        FROM attendance_summary s
        JOIN Employees e ON s.EmployeeID = e.EmployeeID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE s.YearMonth = ?
        ORDER BY e.FullName
    """, (year_month,))
    
    summaries = []
    for row in cursor.fetchall():
        summaries.append({
            'SummaryID': row[0],
            'EmployeeID': row[1],
            'EmployeeCode': f"EMP-{row[1]:05d}",
            'YearMonth': row[2],
            'TotalWorkDays': row[3] or 0,
            'PresentDays': row[4] or 0,
            'AbsentDays': row[5] or 0,
            'LateDays': row[6] or 0,
            'EarlyLeaveDays': row[7] or 0,
            'HolidayDays': row[8] or 0,
            'SickDays': row[9] or 0,
            'LeaveDays': row[10] or 0,
            'TotalWorkHours': float(row[11]) if row[11] else 0,
            'TotalOvertimeHours': float(row[12]) if row[12] else 0,
            'TotalLateMinutes': row[13] or 0,
            'TotalEarlyLeaveMinutes': row[14] or 0,
            'SalaryBonus': 0,
            'SalaryDeduction': 0,
            'LastUpdated': str(row[15]) if row[15] else None,
            'CreatedAt': str(row[16]) if row[16] else None,
            'UpdatedAt': str(row[17]) if row[17] else None,
            'FullName': row[18],
            'DepartmentName': row[19],
            'PositionName': row[20]
        })
        
    if len(summaries) == 0:
        cursor.execute("""
            SELECT 
                a.EmployeeID,
                COUNT(DISTINCT a.AttendanceDate) as TotalWorkDays,
                SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) as PresentDays,
                SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) as AbsentDays,
                SUM(CASE WHEN a.Status = 'Late' THEN 1 ELSE 0 END) as LateDays,
                SUM(CASE WHEN a.Status = 'Early' THEN 1 ELSE 0 END) as EarlyLeaveDays,
                SUM(CASE WHEN a.Status = 'Holiday' THEN 1 ELSE 0 END) as HolidayDays,
                SUM(CASE WHEN a.Status = 'Sick' THEN 1 ELSE 0 END) as SickDays,
                SUM(CASE WHEN a.Status = 'Leave' THEN 1 ELSE 0 END) as LeaveDays,
                SUM(ISNULL(a.WorkHours, 0)) as TotalWorkHours,
                SUM(ISNULL(a.OvertimeHours, 0)) as TotalOvertimeHours,
                SUM(ISNULL(a.LateMinutes, 0)) as TotalLateMinutes,
                0 as TotalEarlyLeaveMinutes,
                e.FullName,
                ISNULL(d.DepartmentName, N'Chưa có') as DepartmentName,
                ISNULL(p.PositionName, N'Chưa có') as PositionName
            FROM attendance_today a
            JOIN Employees e ON a.EmployeeID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            WHERE a.AttendanceDate LIKE ?
            GROUP BY a.EmployeeID, e.FullName, d.DepartmentName, p.PositionName
            ORDER BY e.FullName
        """, (year_month + '%',))
        
        for row in cursor.fetchall():
            summaries.append({
                'SummaryID': 0,
                'EmployeeID': row[0],
                'EmployeeCode': f"EMP-{row[0]:05d}",
                'YearMonth': year_month,
                'TotalWorkDays': row[1] or 0,
                'PresentDays': row[2] or 0,
                'AbsentDays': row[3] or 0,
                'LateDays': row[4] or 0,
                'EarlyLeaveDays': row[5] or 0,
                'HolidayDays': row[6] or 0,
                'SickDays': row[7] or 0,
                'LeaveDays': row[8] or 0,
                'TotalWorkHours': float(row[9]) if row[9] else 0,
                'TotalOvertimeHours': float(row[10]) if row[10] else 0,
                'TotalLateMinutes': row[11] or 0,
                'TotalEarlyLeaveMinutes': row[12] or 0,
                'SalaryBonus': 0,
                'SalaryDeduction': 0,
                'LastUpdated': None,
                'CreatedAt': None,
                'UpdatedAt': None,
                'FullName': row[13],
                'DepartmentName': row[14],
                'PositionName': row[15]
            })
    
    weekday_sums = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
    weekday_days_count = {0: set(), 1: set(), 2: set(), 3: set(), 4: set(), 5: set(), 6: set()}
    
    cursor.execute("""
        SELECT AttendanceDate, Status 
        FROM attendance_today 
        WHERE AttendanceDate LIKE ? AND Status IN ('Present', 'Late')
    """, (year_month + '%',))
    
    for row in cursor.fetchall():
        try:
            dt = row[0]
            if isinstance(dt, str):
                dt = datetime.strptime(dt[:10], '%Y-%m-%d')
            
            w = dt.weekday()
            if w < 5:
                weekday_sums[w] += 1
                weekday_days_count[w].add(dt.strftime('%Y-%m-%d'))
        except:
            continue
    
    weekday_stats = []
    for i in range(7):
        num_days = len(weekday_days_count[i])
        if num_days > 0:
            weekday_stats.append(weekday_sums[i] / num_days)
        else:
            weekday_stats.append(0)
    
    conn.close()
    
    total_stats = {
        'total_employees': len(summaries),
        'total_work_days': sum(s['TotalWorkDays'] for s in summaries),
        'total_present_days': sum(s['PresentDays'] for s in summaries),
        'total_absent_days': sum(s['AbsentDays'] for s in summaries),
        'total_late_days': sum(s['LateDays'] for s in summaries),
        'total_early_leave_days': sum(s['EarlyLeaveDays'] for s in summaries),
        'total_holiday_days': sum(s['HolidayDays'] for s in summaries),
        'total_leave_days': sum(s['LeaveDays'] for s in summaries),
        'total_sick_days': sum(s['SickDays'] for s in summaries),
        'total_work_hours': sum(s['TotalWorkHours'] for s in summaries),
        'total_overtime_hours': sum(s['TotalOvertimeHours'] for s in summaries),
        'total_late_minutes': sum(s['TotalLateMinutes'] for s in summaries),
        'total_early_leave_minutes': sum(s['TotalEarlyLeaveMinutes'] for s in summaries),
        'total_salary_bonus': sum(s['SalaryBonus'] for s in summaries),
        'total_salary_deduction': sum(s['SalaryDeduction'] for s in summaries),
    }
    
    return {
        'success': True,
        'yearMonth': year_month,
        'total_stats': total_stats,
        'weekday_stats': weekday_stats,
        'data': summaries
    }
