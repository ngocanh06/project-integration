import pyodbc
from config import Config

def get_hr_connection():
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={Config.SQL_SERVER};"
        f"DATABASE={Config.SQL_DATABASE};"
        f"UID={Config.SQL_USER};"
        f"PWD={Config.SQL_PASSWORD};"
        "TrustServerCertificate=yes;"
    )

    return pyodbc.connect(conn_str)