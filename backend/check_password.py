# backend/check_password.py
import bcrypt
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="ngocanh136",
    database="auth_db"
)

cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT username, password_hash FROM users WHERE username = 'admin'")
user = cursor.fetchone()

if user:
    print(f"Username: {user['username']}")
    print(f"Password hash: {user['password_hash']}")
    
    # Kiểm tra mật khẩu 'Admin@123' có đúng không
    test_password = "Admin@123"
    is_correct = bcrypt.checkpw(test_password.encode('utf-8'), user['password_hash'].encode('utf-8'))
    print(f"Mật khẩu 'Admin@123' đúng không? {is_correct}")
else:
    print("Không tìm thấy user 'admin'")

cursor.close()
conn.close()