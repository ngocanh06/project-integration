from database.db_hr_connector import get_hr_connection
from database.db_payroll_connector import get_payroll_connection


def money(value):
    return float(value or 0)


def get_dashboard_data():
    hr_conn = get_hr_connection()
    hr_cursor = hr_conn.cursor()

    hr_cursor.execute("""
        SELECT EmployeeID, FullName, DepartmentID, PositionID, Status
        FROM Employees
    """)
    employees = hr_cursor.fetchall()

    hr_cursor.execute("""
        SELECT DepartmentID, DepartmentName
        FROM Departments
    """)
    departments = hr_cursor.fetchall()

    hr_cursor.execute("""
        SELECT PositionID, PositionName
        FROM Positions
    """)
    positions = hr_cursor.fetchall()

    hr_cursor.execute("""
        SELECT EmployeeID, DividendAmount, DividendDate
        FROM Dividends
    """)
    dividends = hr_cursor.fetchall()

    payroll_conn = get_payroll_connection()
    payroll_cursor = payroll_conn.cursor(dictionary=True)

    payroll_cursor.execute("""
        SELECT EmployeeID, BaseSalary, Bonus, Deductions, NetSalary, SalaryMonth
        FROM salaries
    """)
    salaries = payroll_cursor.fetchall()

    payroll_cursor.execute("""
        SELECT EmployeeID, WorkDays, AbsentDays, LeaveDays
        FROM attendance
    """)
    attendance = payroll_cursor.fetchall()

    total_employees = len(employees)

    active_employees = len([
        e for e in employees
        if str(e.Status).strip() == "Đang làm việc"
    ])

    leave_employees = len([
        e for e in employees
        if str(e.Status).strip() == "Nghỉ phép"
    ])

    total_dividend = sum([money(d.DividendAmount) for d in dividends])
    total_payroll = sum([money(s["NetSalary"]) for s in salaries])
    total_bonus = sum([money(s["Bonus"]) for s in salaries])
    total_deductions = sum([money(s["Deductions"]) for s in salaries])
    total_work_days = sum([int(a["WorkDays"] or 0) for a in attendance])
    total_leave_days = sum([int(a["LeaveDays"] or 0) for a in attendance])
    total_absent_days = sum([int(a["AbsentDays"] or 0) for a in attendance])

    department_overview = []

    for department in departments:
        dept_employees = [
            e for e in employees
            if e.DepartmentID == department.DepartmentID
        ]

        dept_employee_ids = [e.EmployeeID for e in dept_employees]

        dept_salary = sum([
            money(s["NetSalary"])
            for s in salaries
            if s["EmployeeID"] in dept_employee_ids
        ])

        dept_bonus = sum([
            money(s["Bonus"])
            for s in salaries
            if s["EmployeeID"] in dept_employee_ids
        ])

        dept_dividend = sum([
            money(d.DividendAmount)
            for d in dividends
            if d.EmployeeID in dept_employee_ids
        ])

        dept_work_days = sum([
            int(a["WorkDays"] or 0)
            for a in attendance
            if a["EmployeeID"] in dept_employee_ids
        ])

        dept_leave_days = sum([
            int(a["LeaveDays"] or 0)
            for a in attendance
            if a["EmployeeID"] in dept_employee_ids
        ])

        position_names = []

        for emp in dept_employees:
            matched_position = next(
                (p for p in positions if p.PositionID == emp.PositionID),
                None
            )

            if matched_position:
                position_names.append(matched_position.PositionName)

        department_overview.append({
            "DepartmentID": department.DepartmentID,
            "DepartmentName": department.DepartmentName,
            "EmployeeCount": len(dept_employees),
            "Positions": list(set(position_names)),
            "TotalSalary": dept_salary,
            "TotalBonus": dept_bonus,
            "TotalDividend": dept_dividend,
            "WorkDays": dept_work_days,
            "LeaveDays": dept_leave_days
        })

    employee_list = []

    for employee in employees:
        department = next(
            (d for d in departments if d.DepartmentID == employee.DepartmentID),
            None
        )

        position = next(
            (p for p in positions if p.PositionID == employee.PositionID),
            None
        )

        salary = next(
            (s for s in salaries if s["EmployeeID"] == employee.EmployeeID),
            None
        )

        dividend = next(
            (d for d in dividends if d.EmployeeID == employee.EmployeeID),
            None
        )

        employee_list.append({
            "EmployeeID": employee.EmployeeID,
            "FullName": employee.FullName,
            "DepartmentID": employee.DepartmentID,
            "DepartmentName": department.DepartmentName if department else "N/A",
            "PositionID": employee.PositionID,
            "PositionName": position.PositionName if position else "N/A",
            "Status": employee.Status,
            "NetSalary": money(salary["NetSalary"]) if salary else 0,
            "Bonus": money(salary["Bonus"]) if salary else 0,
            "DividendAmount": money(dividend.DividendAmount) if dividend else 0
        })

    position_list = [
        {
            "PositionID": p.PositionID,
            "PositionName": p.PositionName
        }
        for p in positions
    ]

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
            "totalRevenue": total_payroll,
            "totalBonus": total_bonus,
            "totalDeductions": total_deductions,
            "totalWorkDays": total_work_days,
            "totalLeaveDays": total_leave_days,
            "totalAbsentDays": total_absent_days
        },
        "departmentOverview": department_overview,
        "departmentChart": department_overview,
        "positions": position_list,
        "employees": employee_list,
        "recentActivities": [
            "Connected to HUMAN_2025 database",
            "Connected to payroll_2026 database",
            "Loaded departments, positions, and employees",
            "Loaded salaries, attendance, and dividends"
        ]
    }