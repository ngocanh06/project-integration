# backend/validation/attendance_validation.py
from .validation_utils import validate_required_fields, is_non_negative_number, is_valid_date

def validate_attendance_data(data):
    """Validate data cho bản ghi chấm công (tạo mới)"""
    required = ["EmployeeID", "AttendanceMonth", "WorkDays"]
    missing = validate_required_fields(data, required)
    
    if missing:
        return False, f"Thiếu thông tin bắt buộc: {', '.join(missing)}"
    
    return _validate_attendance_fields(data)

def validate_attendance_update_data(data):
    """Validate data cho cập nhật bản ghi chấm công (chỉ validate trường có trong data)"""
    return _validate_attendance_fields(data)

def _validate_attendance_fields(data):
    """Validate các trường dữ liệu chấm công"""
    work = data.get("WorkDays")
    absent = data.get("AbsentDays", 0)
    leave = data.get("LeaveDays", 0)
    
    if work is not None and not is_non_negative_number(work):
        return False, "Số ngày làm việc phải là số không âm"
    if absent is not None and not is_non_negative_number(absent):
        return False, "Số ngày nghỉ phải là số không âm"
    if leave is not None and not is_non_negative_number(leave):
        return False, "Số ngày nghỉ phép phải là số không âm"
    
    # Kiểm tra tổng ngày nếu đủ thông tin
    if work is not None:
        total_days = float(work) + float(absent or 0) + float(leave or 0)
        if total_days > 31:
            return False, "Tổng số ngày trong tháng không thể vượt quá 31"
    
    # AttendanceMonth format usually YYYY-MM or YYYY-MM-DD
    month = data.get("AttendanceMonth")
    if month:
        if len(str(month)) == 7:  # YYYY-MM
            month = str(month) + "-01"
        if not is_valid_date(month):
            return False, "Tháng chấm công không hợp lệ (định dạng YYYY-MM)"
        
    return True, None
