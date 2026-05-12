# backend/auth/permission_checker.py
from functools import wraps
from flask import jsonify, request
import jwt
from config import get_auth_connection

SECRET_KEY = "your-secret-key"

def has_permission(resource, action):
    """Decorator kiểm tra quyền của user"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"status": "error", "msg": "Missing token"}), 401
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                role_id = payload.get('role')
            except Exception as e:
                return jsonify({"status": "error", "msg": "Invalid token"}), 401
            
            # Admin có toàn quyền
            if role_id == 1:
                return f(*args, **kwargs)
            
            # Kiểm tra quyền trong database
            auth_db = get_auth_connection()
            cursor = auth_db.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT COUNT(*) as count FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.permission_id
                WHERE rp.role_id = %s AND p.resource = %s AND p.action = %s
            """, (role_id, resource, action))
            
            result = cursor.fetchone()
            cursor.close()
            auth_db.close()
            
            if result['count'] == 0:
                return jsonify({"status": "error", "msg": "Permission denied"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def role_required(allowed_roles):
    """Decorator kiểm tra role của user (allowed_roles là list các role_id được phép)"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"status": "error", "msg": "Missing token"}), 401
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                role_id = payload.get('role')
            except Exception as e:
                return jsonify({"status": "error", "msg": "Invalid token"}), 401
            
            # Admin (role_id=1) luôn được phép
            if role_id == 1:
                return f(*args, **kwargs)
            
            if role_id not in allowed_roles:
                return jsonify({"status": "error", "msg": "Insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator