# backend/validation/employee_validation.py
from .validation_utils import is_valid_email, is_valid_phone, is_valid_date, validate_required_fields, calculate_age, is_valid_name
from datetime import datetime

def validate_employee_data(data, is_update=False):
    """Validate data cho nhân viên"""
    if is_update:
        # Khi update, chỉ validate các trường được gửi lên (không bắt buộc tất cả)
        required = []
        # Chỉ kiểm tra required nếu trường có trong data nhưng rỗng
        check_fields = ["FullName", "Email", "DepartmentID", "PositionID", "Gender", "Status", "HireDate"]
        for field in check_fields:
            if field in data and (data[field] is None or (isinstance(data[field], str) and data[field].strip() == "")):
                required.append(field)
        if required:
            return False, f"Các trường không được để trống: {', '.join(required)}"
    else:
        # Khi tạo mới, bắt buộc tất cả các trường quan trọng
        required = ["FullName", "Email", "DepartmentID", "PositionID", "Gender", "Status", "HireDate"]
        missing = validate_required_fields(data, required)
        if missing:
            return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    # Validate FullName
    full_name = data.get("FullName")
    if full_name and not is_valid_name(full_name):
        return False, "Họ tên phải có ít nhất 2 ký tự"
    
    # Validate Email
    email = data.get("Email")
    if email and not is_valid_email(email):
        return False, "Định dạng email không hợp lệ"
    
    # Validate PhoneNumber (không bắt buộc)
    phone = data.get("PhoneNumber")
    if phone and not is_valid_phone(phone):
        return False, "Số điện thoại không hợp lệ (phải là 10-11 chữ số)"
    
    # Validate DateOfBirth
    dob = data.get("DateOfBirth")
    if dob:
        if not is_valid_date(dob):
            return False, "Định dạng ngày sinh không hợp lệ (YYYY-MM-DD)"
        if calculate_age(dob) < 18:
            return False, "Nhân viên phải từ 18 tuổi trở lên"
    
    # Validate HireDate
    hire_date = data.get("HireDate")
    if hire_date:
        if not is_valid_date(hire_date):
            return False, "Định dạng ngày vào làm không hợp lệ (YYYY-MM-DD)"
        
        # Logic check: Ngày vào làm không được trước ngày sinh
        if dob and is_valid_date(dob) and is_valid_date(hire_date):
            if hire_date < dob:
                return False, "Ngày vào làm không thể trước ngày sinh"

    # Kiểm tra Gender
    gender = data.get("Gender")
    if gender:
        valid_genders = ["Nam", "Nữ", "Khác", "Male", "Female", "Other"]
        if gender not in valid_genders:
            return False, "Giới tính không hợp lệ"
        
    # Kiểm tra Status
    status = data.get("Status")
    if status:
        valid_status = ["Đang làm việc", "Đã nghỉ việc", "Nghỉ việc", "Thử việc", "Nghỉ phép", "Active", "Inactive", "On Leave"]
        if status not in valid_status:
            return False, "Trạng thái không hợp lệ"

    # Kiểm tra ID phải là số
    dept_id = data.get("DepartmentID")
    pos_id = data.get("PositionID")
    if dept_id:
        try:
            int(dept_id)
        except (ValueError, TypeError):
            return False, "Phòng ban không hợp lệ"
    if pos_id:
        try:
            int(pos_id)
        except (ValueError, TypeError):
            return False, "Chức vụ không hợp lệ"
        
    return True, None
