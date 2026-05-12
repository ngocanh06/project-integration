# backend/auth/jwt_handler.py
import jwt
from flask import request, jsonify
from functools import wraps
from config import get_auth_connection, SECRET_KEY

def get_current_user():
    """Lấy thông tin user từ JWT token trong request header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print(f"Decoded token payload: {payload}")  # Debug
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None

def token_required(f):
    """Decorator: yêu cầu Bearer token hợp lệ."""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"status": "error", "msg": "Token không hợp lệ hoặc đã hết hạn"}), 401
        return f(user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator: chỉ cho phép role_id = 1 (Admin)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"status": "error", "msg": "Token không hợp lệ hoặc đã hết hạn"}), 401
        
        # Kiểm tra cả 'role' và 'role_id'
        role_id = user.get("role") or user.get("role_id")
        
        print(f"Admin check - User role: {role_id}")  # Debug
        
        if role_id != 1:
            return jsonify({"status": "error", "msg": "Bạn không có quyền truy cập chức năng này"}), 403
            
        return f(user, *args, **kwargs)
    return decorated

def permission_required(action, resource):
    """Decorator: Kiểm tra người dùng có quyền (action) trên (resource) hay không."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"status": "error", "msg": "Token không hợp lệ hoặc đã hết hạn"}), 401
            
            # Admin (role 1) tự động có mọi quyền
            role_id = user.get("role") or user.get("role_id")
            
            if role_id == 1:
                return f(user, *args, **kwargs)

            # Truy vấn auth_db xem role_id có permission (action, resource) không
            conn = None
            cursor = None
            try:
                conn = get_auth_connection()
                cursor = conn.cursor(dictionary=True)
                cursor.execute("""
                    SELECT 1
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.permission_id
                    WHERE rp.role_id = %s AND p.action = %s AND p.resource = %s
                """, (role_id, action, resource))
                has_perm = cursor.fetchone()

                if not has_perm:
                    return jsonify({"status": "error", "msg": f"Bạn không có quyền {action} trên {resource}"}), 403

            except Exception as e:
                print("Lỗi kiểm tra quyền:", str(e))
                return jsonify({"status": "error", "msg": "Lỗi hệ thống khi kiểm tra phân quyền"}), 500
            finally:
                if cursor:
                    cursor.close()
                if conn:
                    conn.close()

            return f(user, *args, **kwargs)
        return decorated
    return decorator