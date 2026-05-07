from database.db_hr_connector import get_hr_connection
from database.db_payroll_connector import get_payroll_connection


def get_dashboard_data():
    hr_conn = get_hr_connection()
    hr_cursor = hr_conn.cursor()

    hr_cursor.execute("""
        SELECT EmployeeID, FullName, DepartmentID, Status
        FROM Employees
    """)
    employees = hr_cursor.fetchall()

    hr_cursor.execute("""
        SELECT DepartmentID, DepartmentName
        FROM Departments
    """)
    departments = hr_cursor.fetchall()

    hr_cursor.execute("""
        SELECT DividendAmount
        FROM Dividends
    """)
    dividends = hr_cursor.fetchall()

    payroll_conn = get_payroll_connection()
    payroll_cursor = payroll_conn.cursor(dictionary=True)

    payroll_cursor.execute("""
        SELECT 
            COALESCE(SUM(NetSalary), 0) AS totalRevenue,
            COALESCE(SUM(Bonus), 0) AS totalBonus
        FROM salaries
    """)
    payroll_summary = payroll_cursor.fetchone()

    total_employees = len(employees)

    active_employees = len([
        e for e in employees
        if str(e.Status).strip() == "Đang làm việc"
    ])

    leave_employees = len([
        e for e in employees
        if str(e.Status).strip() == "Nghỉ phép"
    ])

    total_dividend = sum([
        float(d.DividendAmount or 0)
        for d in dividends
    ])

    department_chart = []

    for department in departments:
        count = len([
            e for e in employees
            if e.DepartmentID == department.DepartmentID
        ])

        department_chart.append({
            "DepartmentID": department.DepartmentID,
            "DepartmentName": department.DepartmentName,
            "total": count
        })

    hr_cursor.close()
    hr_conn.close()

    payroll_cursor.close()
    payroll_conn.close()

    return {
        "summary": {
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "leaveEmployees": leave_employees,
            "totalDividend": total_dividend,
            "totalRevenue": float(payroll_summary["totalRevenue"] or 0),
            "totalBonus": float(payroll_summary["totalBonus"] or 0)
        },
        "departmentChart": department_chart,
        "recentActivities": [
            "Connected to HUMAN_2025 database",
            "Connected to payroll_2026 database",
            "Loaded employee statistics",
            "Loaded dashboard integration data"
        ]
    }