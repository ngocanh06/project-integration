from database.db_hr_connector import get_sql_connection
from datetime import datetime

def get_all_dividends():
    conn = get_sql_connection()
    if not conn:
        return []
    
    cursor = conn.cursor()
    # Join with Employees to get Name
    query = """
        SELECT div.*, emp.FullName 
        FROM Dividends div
        JOIN Employees emp ON div.EmployeeID = emp.EmployeeID
    """
    cursor.execute(query)
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

def get_dividend_by_id(div_id):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Dividends WHERE DividendID = ?", (div_id,))
    row = cursor.fetchone()
    if row:
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, row))
        conn.close()
        return result
    conn.close()
    return None

def create_dividend(data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute(
        "INSERT INTO Dividends (EmployeeID, DividendAmount, DividendDate, CreatedAt) OUTPUT INSERTED.DividendID VALUES (?, ?, ?, ?)",
        (data['EmployeeID'], data['DividendAmount'], data['DividendDate'], now)
    )
    new_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return get_dividend_by_id(new_id)

def update_dividend(div_id, data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Dividends SET EmployeeID = ?, DividendAmount = ?, DividendDate = ? WHERE DividendID = ?",
        (data['EmployeeID'], data['DividendAmount'], data['DividendDate'], div_id)
    )
    conn.commit()
    conn.close()
    return get_dividend_by_id(div_id)

def delete_dividend(div_id):
    conn = get_sql_connection()
    if not conn: return False
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Dividends WHERE DividendID = ?", (div_id,))
    conn.commit()
    conn.close()
    return True
