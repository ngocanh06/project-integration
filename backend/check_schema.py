import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_sql_connection():
    server = os.getenv('SQL_SERVER')
    database = os.getenv('SQL_DB')
    username = os.getenv('SQL_USER')
    password = os.getenv('SQL_PASSWORD')
    driver = '{ODBC Driver 17 for SQL Server}'

    if username and password:
        conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    else:
        conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};Trusted_Connection=yes'
    
    try:
        conn = pyodbc.connect(conn_str)
        return conn
    except Exception as e:
        print(f"Lỗi kết nối SQL Server: {e}")
        return None

def check_schema():
    conn = get_sql_connection()
    if not conn: return
    cursor = conn.cursor()
    
    tables = ['Departments', 'Employees', 'Positions']
    for table in tables:
        print(f"\n--- Schema for {table} ---")
        cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'")
        for row in cursor.fetchall():
            print(f"{row[0]}: {row[1]}")
            
    conn.close()

if __name__ == "__main__":
    check_schema()
