# backend/reset_password.py
import bcrypt
import mysql.connector

try:
    # Kết nối database
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="ngocanh136",
        database="auth_db"
    )
    cursor = conn.cursor()

    # Tạo hash mới cho mật khẩu 'Admin@123'
    new_password = "Admin@123"
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(12))
    hashed_str = hashed.decode('utf-8')

    print(f"Mật khẩu mới: {new_password}")
    print(f"Hash mới: {hashed_str}")
    print("-" * 50)

    # Cập nhật vào database
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s 
        WHERE username = 'admin'
    """, (hashed_str,))
    
    conn.commit()
    
    # Kiểm tra số dòng bị ảnh hưởng
    affected_rows = cursor.rowcount
    print(f"Số dòng đã cập nhật: {affected_rows}")

    if affected_rows > 0:
        print("Đã cập nhật mật khẩu cho user 'admin'")
    else:
        print("Không tìm thấy user 'admin' trong database")

    # Kiểm tra lại
    cursor.execute("SELECT username, password_hash FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    
    if user:
        print(f"Username: {user[0]}")
        print(f"Hash mới trong DB: {user[1]}")
        
        # Xác thực lại
        if bcrypt.checkpw(new_password.encode('utf-8'), user[1].encode('utf-8')):
            print("Xác thực thành công! Mật khẩu đã đúng.")
        else:
            print("Xác thực thất bại!")
    else:
        print("Không tìm thấy user 'admin'")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Lỗi: {e}")