def validate_department_data(data):
    errors = {}
    if 'DepartmentName' not in data or not data['DepartmentName'].strip():
        errors['DepartmentName'] = "Tên phòng ban là bắt buộc."
    return errors
