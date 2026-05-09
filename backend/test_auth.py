import bcrypt
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="ngocanh136",
    database="auth_db"
)
cursor = conn.cursor(dictionary=True)

# Lấy user admin
cursor.execute("SELECT * FROM users WHERE username = 'admin'")
user = cursor.fetchone()

print("User found:", user['username'])
print("Hash in DB:", user['password_hash'])
print("Hash length:", len(user['password_hash']))

# Test password
password = "123456"
is_match = bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))
print("Password match:", is_match)

conn.close()