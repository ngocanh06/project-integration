# backend/validation/attendance_validation.py
from .validation_utils import validate_required_fields, is_non_negative_number, is_valid_date

def validate_attendance_data(data):
    """Validate data cho bản ghi chấm công"""
    required = ["EmployeeID", "AttendanceMonth", "WorkDays"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
        
    work = data.get("WorkDays", 0)
    absent = data.get("AbsentDays", 0)
    leave = data.get("LeaveDays", 0)
    
    if not is_non_negative_number(work):
        return False, "Số ngày làm việc phải là số không âm"
    if not is_non_negative_number(absent):
        return False, "Số ngày nghỉ phải là số không âm"
    if not is_non_negative_number(leave):
        return False, "Số ngày nghỉ phép phải là số không âm"
        
    total_days = float(work) + float(absent) + float(leave)
    if total_days > 31:
        return False, "Tổng số ngày trong tháng không thể vượt quá 31"
        
    # AttendanceMonth format usually YYYY-MM or YYYY-MM-DD
    month = data.get("AttendanceMonth")
    if len(month) == 7: # YYYY-MM
        month += "-01"
    if not is_valid_date(month):
        return False, "Tháng chấm công không hợp lệ (định dạng YYYY-MM)"
        
    return True, None
