# update_pass.py
import bcrypt
import mysql.connector

# Kết nối database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='ngocanh136',
    database='auth_db'
)
cursor = conn.cursor()

# Danh sách user và mật khẩu mới
users_data = [
    ("admin", "Admin@123"),
    ("hr_manager", "HRManager@123"),
    ("payroll_manager", "Payroll@123")
]

print("=" * 60)
print("CẬP NHẬT MẬT KHẨU CHO CÁC TÀI KHOẢN")
print("=" * 60)

for username, password in users_data:
    # Tạo hash mới
    new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
    new_hash_str = new_hash.decode('utf-8')
    
    print(f"\n{username.upper()}")
    print(f"   Mật khẩu: {password}")
    print(f"   Hash: {new_hash_str[:50]}...")
    
    # Cập nhật database
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s 
        WHERE username = %s
    """, (new_hash_str, username))
    
    if cursor.rowcount > 0:
        print(f"   Cập nhật thành công ({cursor.rowcount} user)")
    else:
        print(f"   Không tìm thấy user '{username}'")

conn.commit()

print("\n" + "=" * 60)
print("KIỂM TRA DỮ LIỆU TRONG DATABASE")
print("=" * 60)

for username, password in users_data:
    cursor.execute("SELECT user_id, username, password_hash FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if user:
        user_id, uname, stored_hash = user
        test = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"\nID: {user_id} | Username: {uname}")
        print(f"   Stored Hash: {stored_hash[:50]}...")
        print(f"   ✓ Kiểm tra mật khẩu: {'ĐÚNG' if test else 'SAI'}")

cursor.close()
conn.close()

print("\n" + "=" * 60)
print("HOÀN THÀNH")
print("=" * 60)