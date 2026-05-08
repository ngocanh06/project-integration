from flask import Blueprint, jsonify, request
from services.department_service import get_all_departments, create_department, update_department, delete_department, get_department_by_id, get_department_stats
from validation.department_validation import validate_department_data

department_bp = Blueprint('departments', __name__)

@department_bp.route('/stats', methods=['GET'])
def department_stats():
    stats = get_department_stats()
    return jsonify(stats)

@department_bp.route('/', methods=['GET'])
def list_departments():
    departments = get_all_departments()
    return jsonify(departments)

@department_bp.route('/<int:id>', methods=['GET'])
def get_department(id):
    dept = get_department_by_id(id)
    if dept:
        return jsonify(dept)
    return jsonify({"error": "Không tìm thấy phòng ban"}), 404

@department_bp.route('/', methods=['POST'])
def add_department():
    data = request.json
    errors = validate_department_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    new_dept = create_department(data)
    return jsonify(new_dept), 201

@department_bp.route('/<int:id>', methods=['PUT'])
def edit_department(id):
    data = request.json
    errors = validate_department_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    updated_dept = update_department(id, data)
    if updated_dept:
        return jsonify(updated_dept)
    return jsonify({"error": "Không tìm thấy phòng ban"}), 404

@department_bp.route('/<int:id>', methods=['DELETE'])
def remove_department(id):
    success, error_msg = delete_department(id)
    if success:
        return jsonify({"message": "Đã xóa phòng ban thành công"}), 200
    return jsonify({"error": error_msg or "Lỗi khi xóa phòng ban"}), 400
