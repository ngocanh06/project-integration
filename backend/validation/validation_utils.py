# backend/validation/validation_utils.py
import re
from datetime import datetime

def is_valid_email(email):
    """Kiểm tra định dạng email (Cơ bản: có @ và có dấu chấm ở domain)"""
    if not email:
        return False
    # Regex đơn giản hơn: có chữ @ và có dấu chấm sau đó
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None

def is_valid_phone(phone):
    """Kiểm tra định dạng số điện thoại (chỉ chứa số và có độ dài từ 10-11 ký tự)"""
    if not phone:
        return True # Cho phép để trống nếu không bắt buộc
    pattern = r'^\d{10,11}$'
    return re.match(pattern, str(phone)) is not None

def is_valid_date(date_str):
    """Kiểm tra định dạng ngày (YYYY-MM-DD)"""
    if not date_str:
        return True # Cho phép để trống
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_required_fields(data, required_fields):
    """Kiểm tra các trường bắt buộc"""
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and data[field].strip() == ""):
            missing_fields.append(field)
    return missing_fields

def calculate_age(birth_date_str):
    """Tính tuổi từ chuỗi ngày sinh"""
    if not birth_date_str:
        return 0
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d')
        today = datetime.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except ValueError:
        return 0

def is_valid_name(name):
    """Kiểm tra tên hợp lệ (không chứa ký tự đặc biệt, ít nhất 2 ký tự)"""
    if not name or len(name.strip()) < 2:
        return False
    return True

def is_non_negative_number(value):
    """Kiểm tra có phải số không âm không"""
    try:
        val = float(value)
        return val >= 0
    except (ValueError, TypeError):
        return False
