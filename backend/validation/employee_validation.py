import re

def validate_employee_data(data):
    errors = {}
    
    required_fields = ['FullName', 'DateOfBirth', 'Gender', 'PhoneNumber', 'Email', 'HireDate', 'Status']
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} là bắt buộc."
            
    if 'Email' in data and data['Email']:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['Email']):
            errors['Email'] = "Email không hợp lệ."
            
    if 'PhoneNumber' in data and data['PhoneNumber']:
        if not re.match(r"^\d{10,11}$", data['PhoneNumber']):
            errors['PhoneNumber'] = "Số điện thoại phải có 10 hoặc 11 chữ số."
            
    return errors
