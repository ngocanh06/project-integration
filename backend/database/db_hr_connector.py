import pyodbc
from config import get_sqlserver_connection

def get_hr_connection():
    """Kết nối tới SQL Server HUMAN_2025"""
    return get_sqlserver_connection()