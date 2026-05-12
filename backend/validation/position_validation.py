# backend/validation/position_validation.py
from .validation_utils import validate_required_fields, is_valid_name

def validate_position_data(data):
    """Validate data cho chức vụ"""
    required = ["PositionName"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
        
    name = data.get("PositionName")
    if not is_valid_name(name) or len(name.strip()) < 2:
        return False, "Tên chức vụ phải có ít nhất 2 ký tự"
        
    return True, None
