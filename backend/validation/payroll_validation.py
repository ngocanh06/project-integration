# backend/validation/payroll_validation.py
from .validation_utils import validate_required_fields, is_non_negative_number, is_valid_date

def validate_salary_data(data):
    """Validate data cho bản ghi lương (tạo mới)"""
    required = ["EmployeeID", "SalaryMonth", "BaseSalary"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    return _validate_salary_fields(data)

def validate_salary_update_data(data):
    """Validate data cho cập nhật bản ghi lương (chỉ validate trường có trong data)"""
    return _validate_salary_fields(data)

def _validate_salary_fields(data):
    """Validate các trường dữ liệu lương"""
    base_salary = data.get("BaseSalary")
    if base_salary is not None and not is_non_negative_number(base_salary):
        return False, "Lương cơ bản phải là số không âm"
    
    bonus = data.get("Bonus")
    if bonus is not None and not is_non_negative_number(bonus):
        return False, "Tiền thưởng phải là số không âm"
    
    deductions = data.get("Deductions")
    if deductions is not None and not is_non_negative_number(deductions):
        return False, "Khoản khấu trừ phải là số không âm"
    
    # SalaryMonth format usually YYYY-MM or YYYY-MM-DD
    month = data.get("SalaryMonth")
    if month:
        if len(str(month)) == 7:  # YYYY-MM
            month = str(month) + "-01"
        if not is_valid_date(month):
            return False, "Tháng lương không hợp lệ (định dạng YYYY-MM)"
        
    return True, None
