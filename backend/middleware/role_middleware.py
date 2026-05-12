# backend/middleware/role_middleware.py
from functools import wraps
from flask import jsonify, request
import jwt

SECRET_KEY = "your-secret-key"

def role_required(allowed_roles):
    """Decorator kiểm tra role của user"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"status": "error", "msg": "Missing token"}), 401
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                role = payload.get('role')
            except:
                return jsonify({"status": "error", "msg": "Invalid token"}), 401
            
            role_names = {1: 'Admin', 2: 'HR Manager', 3: 'Payroll Manager', 4: 'Employee'}
            role_name = role_names.get(role, 'Unknown')
            
            if role_name not in allowed_roles and 'Admin' not in allowed_roles:
                return jsonify({"status": "error", "msg": "Insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator