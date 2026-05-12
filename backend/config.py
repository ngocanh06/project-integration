# backend/config.py
import pyodbc
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# ======================================================
# SECRET KEY
# ======================================================
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

# ======================================================
# CONFIG CLASS
# ======================================================
class Config:
    BCRYPT_ROUNDS = 12
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    JWT_EXPIRATION_HOURS = 8
    
    # Database Connections
    HR_DB_CONNECTION = os.getenv('HR_DB_CONNECTION', 
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"
        "DATABASE=HUMAN_2025;"
        "Trusted_Connection=yes;"
    )
    
    PAYROLL_DB_CONNECTION = os.getenv('PAYROLL_DB_CONNECTION',
        "mysql+pymysql://root:ngocanh136@localhost:3306/payroll_2026"
    )
    
    AUTH_DB_CONNECTION = os.getenv('AUTH_DB_CONNECTION',
        "mysql+pymysql://root:ngocanh136@localhost:3306/auth_db"
    )
    
    # API
    API_HOST = '0.0.0.0'
    API_PORT = 5000
    API_DEBUG = True
    
    # CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']

# ======================================================
# KẾT NỐI SQL SERVER (HUMAN_2025)
# ======================================================
def get_sqlserver_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost;"
            "DATABASE=HUMAN_2025;"
            "Trusted_Connection=yes;",
            timeout=10
        )
        return conn
    except Exception as e:
        print("Lỗi kết nối SQL Server:", str(e))
        raise

# ======================================================
# KẾT NỐI MYSQL (PAYROLL)
# ======================================================
def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="ngocanh136",
            database="payroll_2026",
            autocommit=False
        )
        return conn
    except Exception as e:
        print("Lỗi kết nối MySQL (Payroll):", str(e))
        raise

# ======================================================
# KẾT NỐI MYSQL (AUTH DB)
# ======================================================
def get_auth_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="ngocanh136",
            database="auth_db",
            autocommit=False
        )
        return conn
    except Exception as e:
        print("Lỗi kết nối Auth DB:", str(e))
        raise

# ======================================================
# KIỂM TRA
# ======================================================
if __name__ == "__main__":
    print("Config loaded successfully")
    print(f"BCRYPT_ROUNDS: {Config.BCRYPT_ROUNDS}")