def validate_position_data(data):
    errors = {}
    if 'PositionName' not in data or not data['PositionName'].strip():
        errors['PositionName'] = "Tên chức vụ là bắt buộc."
    return errors
