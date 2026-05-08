import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DB')
        )
        return conn
    except Exception as e:
        print(f"Lỗi kết nối MySQL: {e}")
        return None
