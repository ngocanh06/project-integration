# backend/routes/auth_routes.py
from flask import Blueprint, jsonify, request
from config import get_auth_connection, SECRET_KEY
import bcrypt
import jwt
import datetime
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        print(f"Login data: {data}")
        
        login_input = data.get("email") or data.get("username")
        password = data.get("password")
        
        print(f"Login input: {login_input}")
        print(f"Password: {password}")
        
        if not login_input or not password:
            return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ thông tin"}), 400
        
        auth = get_auth_connection()
        cursor = auth.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT user_id, username, email, password_hash, role_id, is_active, full_name
            FROM users 
            WHERE email = %s OR username = %s
        """, (login_input, login_input))
        user = cursor.fetchone()
        
        cursor.close()
        auth.close()
        
        if not user:
            print("User not found")
            return jsonify({"status": "error", "msg": "Sai tên đăng nhập hoặc mật khẩu"}), 401
        
        print(f"Found user: {user['username']}")
        print(f"Stored hash: {user['password_hash'][:30]}...")
        
        # Kiểm tra mật khẩu
        is_valid = False
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))
            print(f"Password valid (bcrypt): {is_valid}")
        except Exception as e:
            print(f"Error checking password: {e}")
            is_valid = False
            
        if not is_valid:
            return jsonify({"status": "error", "msg": "Sai tên đăng nhập hoặc mật khẩu"}), 401
        
        if not user.get('is_active', 1):
            return jsonify({"status": "error", "msg": "Tài khoản đã bị khóa"}), 401
        
        # Tạo token
        token = jwt.encode({
            'user_id': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role_id'],
            'exp': datetime.datetime.utcnow() + timedelta(hours=8)
        }, SECRET_KEY, algorithm='HS256')
        
        print(f"Login successful for user: {user['username']}")
        
        return jsonify({
            "status": "success",
            "token": token,
            "user": {
                "user_id": user['user_id'],
                "username": user['username'],
                "email": user['email'],
                "role_id": user['role_id'],
                "full_name": user.get('full_name', '')
            }
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "msg": str(e)}), 500

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name")
        
        if not username or not email or not password:
            return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ thông tin"}), 400
        
        auth = get_auth_connection()
        cursor = auth.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            cursor.close()
            auth.close()
            return jsonify({"status": "error", "msg": "Tên đăng nhập đã tồn tại"}), 400
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            auth.close()
            return jsonify({"status": "error", "msg": "Email đã được sử dụng"}), 400
        
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
        
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, full_name, role_id, is_active)
            VALUES (%s, %s, %s, %s, 4, 1)
        """, (username, email, hashed.decode('utf-8'), full_name))
        
        auth.commit()
        cursor.close()
        auth.close()
        
        return jsonify({"status": "success", "msg": "Đăng ký thành công"}), 201
        
    except Exception as e:
        print(f"Register error: {str(e)}")
        return jsonify({"status": "error", "msg": str(e)}), 500