from database.db_hr_connector import get_sql_connection
from datetime import datetime

def get_all_employees(search_query=None, dept_id=None, pos_id=None, status=None):
    conn = get_sql_connection()
    if not conn:
        return []
    
    cursor = conn.cursor()
    query = """
        SELECT e.*, d.DepartmentName, p.PositionName 
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE 1=1
    """
    params = []
    
    if search_query:
        query += " AND (e.FullName LIKE ? OR e.Email LIKE ? OR e.PhoneNumber LIKE ?)"
        params.extend([f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"])
        
    if dept_id:
        query += " AND e.DepartmentID = ?"
        params.append(dept_id)

    if pos_id:
        query += " AND e.PositionID = ?"
        params.append(pos_id)

    if status:
        query += " AND e.Status = ?"
        params.append(status)
        
    cursor.execute(query, params)
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

def get_employee_by_id(emp_id):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Employees WHERE EmployeeID = ?", (emp_id,))
    row = cursor.fetchone()
    if row:
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, row))
        conn.close()
        return result
    conn.close()
    return None

def create_employee(data):
    conn = get_sql_connection()
    if not conn: return None, "Lỗi kết nối CSDL"
    cursor = conn.cursor()
    now = datetime.now()
    # Convert empty strings to None for foreign keys
    dept_id = data.get('DepartmentID')
    if dept_id == "": dept_id = None
    
    pos_id = data.get('PositionID')
    if pos_id == "": pos_id = None

    try:
        cursor.execute(
            """
            INSERT INTO Employees (FullName, DateOfBirth, Gender, PhoneNumber, Email, HireDate, DepartmentID, PositionID, Status, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.EmployeeID
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (data['FullName'], data['DateOfBirth'], data['Gender'], data['PhoneNumber'], data['Email'], 
             data['HireDate'], dept_id, pos_id, data['Status'], now, now)
        )
        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return get_employee_by_id(new_id), None
    except Exception as e:
        conn.rollback()
        conn.close()
        return None, str(e)

def update_employee(emp_id, data):
    conn = get_sql_connection()
    if not conn: return None, "Lỗi kết nối CSDL"
    cursor = conn.cursor()
    now = datetime.now()
    # Convert empty strings to None for foreign keys
    dept_id = data.get('DepartmentID')
    if dept_id == "": dept_id = None
    
    pos_id = data.get('PositionID')
    if pos_id == "": pos_id = None

    try:
        cursor.execute(
            """
            UPDATE Employees 
            SET FullName = ?, DateOfBirth = ?, Gender = ?, PhoneNumber = ?, Email = ?, HireDate = ?, DepartmentID = ?, PositionID = ?, Status = ?, UpdatedAt = ?
            WHERE EmployeeID = ?
            """,
            (data['FullName'], data['DateOfBirth'], data['Gender'], data['PhoneNumber'], data['Email'], 
             data['HireDate'], dept_id, pos_id, data['Status'], now, emp_id)
        )
        conn.commit()
        conn.close()
        return get_employee_by_id(emp_id), None
    except Exception as e:
        conn.rollback()
        conn.close()
        return None, str(e)

def delete_employee(emp_id):
    conn = get_sql_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Employees WHERE EmployeeID = ?", (emp_id,))
    conn.commit()
    conn.close()
    return True
