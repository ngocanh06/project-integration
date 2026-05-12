# backend/auth/password_hasher.py
import bcrypt
from config import Config

def hash_password(password):
    """Mã hóa mật khẩu"""
    salt = bcrypt.gensalt(rounds=Config.BCRYPT_ROUNDS)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, hashed):
    """Kiểm tra mật khẩu"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))