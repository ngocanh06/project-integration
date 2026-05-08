from database.db_hr_connector import get_sql_connection
from datetime import datetime

def get_all_departments():
    conn = get_sql_connection()
    if not conn:
        return []
    
    cursor = conn.cursor()
    query = """
        SELECT d.DepartmentID, d.DepartmentName, d.CreatedAt, d.UpdatedAt,
               COUNT(e.EmployeeID) as EmployeeCount
        FROM Departments d
        LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
        GROUP BY d.DepartmentID, d.DepartmentName, d.CreatedAt, d.UpdatedAt
    """
    cursor.execute(query)
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    for dept in results:
        dept['ManagerName'] = "Chưa bổ nhiệm"
        dept['ManagerAvatar'] = None
        
    conn.close()
    return results

def get_department_by_id(dept_id):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Departments WHERE DepartmentID = ?", (dept_id,))
    row = cursor.fetchone()
    if row:
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, row))
        conn.close()
        return result
    conn.close()
    return None

def get_department_stats():
    conn = get_sql_connection()
    if not conn:
        return {"total_employees": 0, "total_departments": 0}
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM Departments")
    total_depts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Employees")
    total_emp = cursor.fetchone()[0]

    conn.close()
    return {
        "total_employees": total_emp,
        "total_departments": total_depts,
        "budget_utilization": 88.4
    }

def create_department(data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute(
        "INSERT INTO Departments (DepartmentName, CreatedAt, UpdatedAt) OUTPUT INSERTED.DepartmentID VALUES (?, ?, ?)",
        (data['DepartmentName'], now, now)
    )
    new_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return get_department_by_id(new_id)

def update_department(dept_id, data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute(
        "UPDATE Departments SET DepartmentName = ?, UpdatedAt = ? WHERE DepartmentID = ?",
        (data['DepartmentName'], now, dept_id)
    )
    conn.commit()
    conn.close()
    return get_department_by_id(dept_id)

def delete_department(dept_id):
    conn = get_sql_connection()
    if not conn: return False, "Lỗi kết nối database"
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Departments WHERE DepartmentID = ?", (dept_id,))
        conn.commit()
        conn.close()
        return True, None
    except Exception as e:
        conn.rollback()
        conn.close()
        err = str(e)
        if 'FOREIGN KEY' in err or 'REFERENCE' in err or '547' in err:
            return False, "Không thể xóa vì phòng ban này đang có nhân viên. Hãy chuyển nhân viên sang phòng ban khác trước."
        return False, f"Lỗi khi xóa: {err}"
