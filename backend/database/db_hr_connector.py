# config.py
import pyodbc
from datetime import datetime

# Cấu hình kết nối SQL Server - ĐÚNG TÊN DATABASE CỦA BẠN
DB_CONFIG = {
    'driver': '{ODBC Driver 17 for SQL Server}',  # Hoặc '{SQL Server}'
    'server': 'localhost',  # Hoặc '127.0.0.1' hoặc tên máy tính
    'database': 'HUMAN_2025',  
    'trusted_connection': True,  # True: Windows Auth
}

def get_db_connection():
    """Tạo kết nối đến SQL Server"""
    try:
        if DB_CONFIG['trusted_connection']:
            conn_str = (
                f"DRIVER={DB_CONFIG['driver']};"
                f"SERVER={DB_CONFIG['server']};"
                f"DATABASE={DB_CONFIG['database']};"
                f"Trusted_Connection=yes;"
            )
        else:
            conn_str = (
                f"DRIVER={DB_CONFIG['driver']};"
                f"SERVER={DB_CONFIG['server']};"
                f"DATABASE={DB_CONFIG['database']};"
                f"UID={DB_CONFIG.get('username', 'sa')};"
                f"PWD={DB_CONFIG.get('password', '')}"
            )
        
        print(f"Connecting to: {DB_CONFIG['server']}/{DB_CONFIG['database']}")
        conn = pyodbc.connect(conn_str, timeout=30)
        print("Connected successfully!")
        return conn
    except Exception as e:
        print(f"Connection error: {e}")
        raise

def test_connection():
    """Kiểm tra kết nối database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Kiểm tra các bảng attendance
        cursor.execute("SELECT COUNT(*) FROM attendance_today")
        today_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Employees")
        emp_count = cursor.fetchone()[0]
        
        print(f"\n📊 THỐNG KÊ DATABASE {DB_CONFIG['database']}:")
        print(f"   - Employees: {emp_count} nhân viên")
        print(f"   - attendance_today: {today_count} bản ghi")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
