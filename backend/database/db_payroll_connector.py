import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()


MYSQL_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "payroll"),
}


def get_mysql_connection():
    """Create MySQL connection (Navicat-compatible settings)."""
    try:
        print(
            f"🔌 MySQL connecting to {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}/{MYSQL_CONFIG['database']}"
        )
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        if conn.is_connected():
            print("✅ MySQL connected")
        return conn
    except Error as exc:
        print(f"❌ MySQL connection error: {exc}")
        raise


def test_mysql_connection():
    """Test MySQL connection and return simple stats."""
    conn = None
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT DATABASE() AS db_name")
        db_name = cursor.fetchone()["db_name"]

        cursor.execute("SELECT COUNT(*) AS total FROM attendance")
        total_attendance = cursor.fetchone()["total"]

        return {
            "success": True,
            "database": db_name,
            "attendance_count": int(total_attendance),
        }
    except Exception as exc:
        return {"success": False, "message": str(exc)}
    finally:
        if conn and conn.is_connected():
            conn.close()
