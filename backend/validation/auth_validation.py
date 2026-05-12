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
    """Validate data cho register"""
    required = ["username", "email", "password", "full_name"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    if not is_valid_email(data.get("email")):
        return False, "Định dạng email không hợp lệ"
    
    if len(data.get("password")) < 6:
        return False, "Mật khẩu phải có ít nhất 6 ký tự"
        
    if len(data.get("username")) < 3:
        return False, "Tên đăng nhập phải có ít nhất 3 ký tự"
        
    return True, None
