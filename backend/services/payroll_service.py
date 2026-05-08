from database.db_payroll_connector import get_mysql_connection
from database.db_hr_connector import get_sql_connection

def get_all_salaries():
    conn = get_mysql_connection()
    if not conn:
        return [{"SalaryID": 0, "BaseSalary": 0, "Note": "Lỗi kết nối MySQL"}]
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM salaries")
    results = cursor.fetchall()
    conn.close()
    return results

def sync_hr_to_payroll():
    # 1. Get employees from HR (SQL Server)
    hr_conn = get_sql_connection()
    if not hr_conn: return False
    hr_cursor = hr_conn.cursor()
    hr_cursor.execute("SELECT EmployeeID, FullName FROM Employees")
    employees = hr_cursor.fetchall()
    hr_conn.close()
    
    # 2. Update/Insert into Payroll (MySQL)
    py_conn = get_mysql_connection()
    if not py_conn: return False
    py_cursor = py_conn.cursor()
    
    for emp in employees:
        emp_id, name = emp
        # Check if exists
        py_cursor.execute("SELECT id FROM salaries WHERE id = %s", (emp_id,))
        if not py_cursor.fetchone():
            # Insert new record with default salary 10,000,000
            py_cursor.execute(
                "INSERT INTO salaries (id, base_salary, bonuses, deductions, net_salary, payment_date) VALUES (%s, %s, %s, %s, %s, NOW())",
                (emp_id, 10000000, 0, 0, 10000000)
            )
    
    py_conn.commit()
    py_conn.close()
    return True

