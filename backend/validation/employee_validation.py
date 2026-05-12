# backend/validation/employee_validation.py
from .validation_utils import is_valid_email, is_valid_phone, is_valid_date, validate_required_fields, calculate_age, is_valid_name
from datetime import datetime

def validate_employee_data(data, is_update=False):
    """Validate data cho nhân viên"""
    required = ["FullName", "Email", "DepartmentID", "PositionID", "Gender", "Status"]
    
    missing = validate_required_fields(data, required)
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    full_name = data.get("FullName")
    if not is_valid_name(full_name):
        return False, "Họ tên phải có ít nhất 2 ký tự"
    
    if not is_valid_email(data.get("Email")):
        return False, "Định dạng email không hợp lệ"
    
    phone = data.get("PhoneNumber")
    if phone and not is_valid_phone(phone):
        return False, "Số điện thoại không hợp lệ (phải là 10-11 chữ số)"
        
    dob = data.get("DateOfBirth")
    if dob:
        if not is_valid_date(dob):
            return False, "Định dạng ngày sinh không hợp lệ (YYYY-MM-DD)"
        if calculate_age(dob) < 18:
            return False, "Nhân viên phải từ 18 tuổi trở lên"
            
    hire_date = data.get("HireDate")
    if hire_date:
        if not is_valid_date(hire_date):
            return False, "Định dạng ngày vào làm không hợp lệ (YYYY-MM-DD)"
        
        # Logic check: Ngày vào làm không được trước ngày sinh
        if dob and is_valid_date(dob) and is_valid_date(hire_date):
            if hire_date < dob:
                return False, "Ngày vào làm không thể trước ngày sinh"

    # Kiểm tra Gender
    valid_genders = ["Nam", "Nữ", "Khác", "Male", "Female", "Other"]
    if data.get("Gender") not in valid_genders:
        return False, "Giới tính không hợp lệ"
        
    # Kiểm tra Status
    valid_status = ["Đang làm việc", "Đã nghỉ việc", "Nghỉ việc", "Thử việc", "Nghỉ phép", "Active", "Inactive", "On Leave"]
    if data.get("Status") not in valid_status:
        return False, "Trạng thái không hợp lệ"

    # Kiểm tra ID phải là số
    try:
        int(data.get("DepartmentID"))
        int(data.get("PositionID"))
    except (ValueError, TypeError):
        return False, "Phòng ban và Chức vụ không hợp lệ"
        
    return True, None
