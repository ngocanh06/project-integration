# backend/routes/auth_routes.py
from flask import Blueprint, jsonify, request
from config import get_auth_connection
import bcrypt
import jwt
import datetime
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = "your-secret-key"

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    login_input = data.get("email") or data.get("username")
    password = data.get("password")
    
    if not login_input or not password:
        return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ thông tin"}), 400
    
    auth = get_auth_connection()
    cursor = auth.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT * FROM users 
        WHERE email = %s OR username = %s
    """, (login_input, login_input))
    user = cursor.fetchone()
    
    cursor.close()
    auth.close()
    
    if not user:
        return jsonify({"status": "error", "msg": "Sai tên đăng nhập hoặc mật khẩu"}), 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({"status": "error", "msg": "Sai tên đăng nhập hoặc mật khẩu"}), 401
    
    token = jwt.encode({
        'user_id': user['user_id'],
        'username': user['username'],
        'email': user['email'],
        'role': user['role_id'],
        'exp': datetime.datetime.utcnow() + timedelta(hours=8)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "user_id": user['user_id'],
            "username": user['username'],
            "email": user['email'],
            "role": user['role_id']
        }
    })

@auth_bp.route("/register", methods=["POST"])
def register():
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