# backend/database/db_hr_connector.py (kiểm tra database name)
def get_sqlserver_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost;"
            "DATABASE=HUMAN_2025;"  # ← Đúng tên database của bạn
            "UID=sa;"
            "PWD=123456;",
            timeout=5
        )
        return conn
    except Exception as e:
        print("Lỗi kết nối SQL Server:", str(e))
        raise