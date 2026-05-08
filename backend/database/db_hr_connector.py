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
