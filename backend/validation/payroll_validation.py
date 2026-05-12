# backend/validation/payroll_validation.py
from .validation_utils import validate_required_fields, is_non_negative_number, is_valid_date

def validate_salary_data(data):
    """Validate data cho bản ghi lương"""
    required = ["EmployeeID", "SalaryMonth", "BaseSalary"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
        
    if not is_non_negative_number(data.get("BaseSalary")):
        return False, "Lương cơ bản phải là số không âm"
        
    if data.get("Bonus") and not is_non_negative_number(data.get("Bonus")):
        return False, "Tiền thưởng phải là số không âm"
        
    if data.get("Deductions") and not is_non_negative_number(data.get("Deductions")):
        return False, "Khoản khấu trừ phải là số không âm"
        
    # SalaryMonth format usually YYYY-MM or YYYY-MM-DD
    month = data.get("SalaryMonth")
    if len(month) == 7: # YYYY-MM
        month += "-01"
    if not is_valid_date(month):
        return False, "Tháng lương không hợp lệ (định dạng YYYY-MM)"
        
    return True, None
