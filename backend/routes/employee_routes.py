from flask import Blueprint, jsonify, request
from services.employee_service import get_all_employees, get_employee_by_id, create_employee, update_employee, delete_employee
from validation.employee_validation import validate_employee_data

employee_bp = Blueprint('employees', __name__)

@employee_bp.route('/', methods=['GET'])
def list_employees():
    search = request.args.get('search')
    dept_id = request.args.get('department_id')
    pos_id = request.args.get('position_id')
    status = request.args.get('status')
    
    employees = get_all_employees(search, dept_id, pos_id, status)
    return jsonify(employees)

@employee_bp.route('/<int:id>', methods=['GET'])
def get_employee(id):
    emp = get_employee_by_id(id)
    if emp:
        return jsonify(emp)
    return jsonify({"error": "Không tìm thấy nhân viên"}), 404

@employee_bp.route('/', methods=['POST'])
def add_employee():
    data = request.json
    errors = validate_employee_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    new_emp, error_msg = create_employee(data)
    if error_msg:
        return jsonify({"error": error_msg}), 400
    return jsonify(new_emp), 201

@employee_bp.route('/<int:id>', methods=['PUT'])
def edit_employee(id):
    data = request.json
    errors = validate_employee_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    
    updated_emp, error_msg = update_employee(id, data)
    if error_msg:
        return jsonify({"error": error_msg}), 400
        
    if updated_emp:
        return jsonify(updated_emp)
    return jsonify({"error": "Không tìm thấy nhân viên"}), 404

@employee_bp.route('/<int:id>', methods=['DELETE'])
def remove_employee(id):
    success = delete_employee(id)
    if success:
        return jsonify({"message": "Đã xóa nhân viên"}), 200
    return jsonify({"error": "Lỗi khi xóa nhân viên"}), 400
