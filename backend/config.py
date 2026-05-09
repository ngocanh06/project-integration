# backend/config.py
import pyodbc # Thư viện dùng để kết nối tới SQL Server database
import mysql.connector

def get_sqlserver_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=localhost;"
            "DATABASE=HUMAN_2025;"
            "Trusted_Connection=yes;",
            timeout=5
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
# THÊM HÀM NÀY VÀO (KẾT NỐI AUTH DB)
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
