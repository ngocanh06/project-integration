# backend/middleware/auth_middleware.py
from functools import wraps
from flask import jsonify, request
import jwt

SECRET_KEY = "your-secret-key"

def token_required(f):
    """Decorator kiểm tra token hợp lệ"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({"status": "error", "msg": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"status": "error", "msg": "Token is missing"}), 401
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = payload.get('user_id')
            request.role = payload.get('role')
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "msg": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "msg": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated