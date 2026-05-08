from database.db_hr_connector import get_sql_connection
from datetime import datetime

def get_all_positions():
    conn = get_sql_connection()
    if not conn:
        return []
    
    cursor = conn.cursor()
    # Fetch positions with employee count
    query = """
        SELECT p.PositionID, p.PositionName, p.CreatedAt, p.UpdatedAt,
               COUNT(e.EmployeeID) as EmployeeCount
        FROM Positions p
        LEFT JOIN Employees e ON p.PositionID = e.PositionID
        GROUP BY p.PositionID, p.PositionName, p.CreatedAt, p.UpdatedAt
    """
    cursor.execute(query)
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results

def get_position_by_id(pos_id):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Positions WHERE PositionID = ?", (pos_id,))
    row = cursor.fetchone()
    if row:
        columns = [column[0] for column in cursor.description]
        result = dict(zip(columns, row))
        conn.close()
        return result
    conn.close()
    return None

def create_position(data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute(
        "INSERT INTO Positions (PositionName, CreatedAt, UpdatedAt) OUTPUT INSERTED.PositionID VALUES (?, ?, ?)",
        (data['PositionName'], now, now)
    )
    new_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return get_position_by_id(new_id)

def update_position(pos_id, data):
    conn = get_sql_connection()
    if not conn: return None
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute(
        "UPDATE Positions SET PositionName = ?, UpdatedAt = ? WHERE PositionID = ?",
        (data['PositionName'], now, pos_id)
    )
    conn.commit()
    conn.close()
    return get_position_by_id(pos_id)

def delete_position(pos_id):
    conn = get_sql_connection()
    if not conn: return False, "Lỗi kết nối database"
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Positions WHERE PositionID = ?", (pos_id,))
        conn.commit()
        conn.close()
        return True, None
    except Exception as e:
        conn.rollback()
        conn.close()
        err = str(e)
        if 'FOREIGN KEY' in err or 'REFERENCE' in err or '547' in err:
            return False, "Không thể xóa vì chức vụ này đang được gán cho nhân viên. Hãy cập nhật nhân viên trước."
        return False, f"Lỗi khi xóa: {err}"

def get_position_stats():
    conn = get_sql_connection()
    if not conn: return {"total_positions": 0, "total_employees": 0, "filled_percent": 0, "vacant": 0}
    cursor = conn.cursor()

    # Total Positions
    cursor.execute("SELECT COUNT(*) FROM Positions")
    total_pos = cursor.fetchone()[0]

    # Total Employees
    cursor.execute("SELECT COUNT(*) FROM Employees")
    total_emp = cursor.fetchone()[0]

    # Positions that have at least 1 employee assigned
    cursor.execute("""
        SELECT COUNT(DISTINCT PositionID) FROM Employees WHERE PositionID IS NOT NULL
    """)
    filled_pos = cursor.fetchone()[0]

    # Vacant = positions with no employee assigned
    vacant = max(0, total_pos - filled_pos)

    filled_percent = round((filled_pos / total_pos) * 100) if total_pos > 0 else 0

    conn.close()
    return {
        "total_positions": total_pos,
        "total_employees": total_emp,
        "filled_percent": filled_percent,
        "vacant": vacant
    }
