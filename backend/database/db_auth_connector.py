import mysql.connector
from config import get_auth_connection

def get_auth_db_connection():
    """Kết nối tới MySQL Auth DB"""
    return get_auth_connection()