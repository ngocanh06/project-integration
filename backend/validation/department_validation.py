# backend/validation/department_validation.py
from .validation_utils import validate_required_fields, is_valid_name

def validate_department_data(data):
    """Validate data cho phòng ban"""
    required = ["DepartmentName"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
        
    name = data.get("DepartmentName")
    if not is_valid_name(name) or len(name.strip()) < 3:
        return False, "Tên phòng ban phải có ít nhất 3 ký tự"
        
    return True, None
