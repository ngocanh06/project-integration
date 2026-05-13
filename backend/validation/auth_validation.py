# backend/validation/auth_validation.py
from .validation_utils import is_valid_email, validate_required_fields

def validate_login_data(data):
    """Validate data cho login"""
    required = ["password"]
    missing = validate_required_fields(data, required)
    
    # Login input có thể là email hoặc username
    if not data.get("email") and not data.get("username"):
        missing.append("email/username")
        
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    return True, None

def validate_register_data(data):
    """Validate data cho register - hỗ trợ cả full_name và fullName"""
    required = ["username", "email", "password"]
    missing = validate_required_fields(data, required)
    
    # Hỗ trợ cả 2 key: full_name (snake_case) và fullName (camelCase)
    full_name = data.get("full_name") or data.get("fullName")
    if not full_name or (isinstance(full_name, str) and full_name.strip() == ""):
        missing.append("full_name")
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    if not is_valid_email(data.get("email")):
        return False, "Định dạng email không hợp lệ"
    
    password = data.get("password")
    if len(password) < 6:
        return False, "Mật khẩu phải có ít nhất 6 ký tự"
    
    username = data.get("username")
    if len(username) < 3:
        return False, "Tên đăng nhập phải có ít nhất 3 ký tự"
    
    # Kiểm tra tên hợp lệ
    if len(full_name.strip()) < 2:
        return False, "Họ tên phải có ít nhất 2 ký tự"
        
    return True, None
