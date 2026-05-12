import mysql.connector
from config import get_mysql_connection

def get_payroll_connection():
    """Kết nối tới MySQL Payroll 2026"""
    return get_mysql_connection()