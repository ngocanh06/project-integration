from flask import Blueprint, jsonify, request
from services.position_service import get_all_positions, create_position, update_position, delete_position, get_position_by_id, get_position_stats
from validation.position_validation import validate_position_data

position_bp = Blueprint('positions', __name__)

@position_bp.route('/stats', methods=['GET'])
def position_stats():
    stats = get_position_stats()
    return jsonify(stats)

@position_bp.route('/', methods=['GET'])
def list_positions():
    positions = get_all_positions()
    return jsonify(positions)

@position_bp.route('/<int:id>', methods=['GET'])
def get_position(id):
    pos = get_position_by_id(id)
    if pos:
        return jsonify(pos)
    return jsonify({"error": "Không tìm thấy chức vụ"}), 404

@position_bp.route('/', methods=['POST'])
def add_position():
    data = request.json
    errors = validate_position_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    new_pos = create_position(data)
    return jsonify(new_pos), 201

@position_bp.route('/<int:id>', methods=['PUT'])
def edit_position(id):
    data = request.json
    errors = validate_position_data(data)
    if errors:
        return jsonify({"errors": errors}), 400
    updated_pos = update_position(id, data)
    if updated_pos:
        return jsonify(updated_pos)
    return jsonify({"error": "Không tìm thấy chức vụ"}), 404

@position_bp.route('/<int:id>', methods=['DELETE'])
def remove_position(id):
    success, error_msg = delete_position(id)
    if success:
        return jsonify({"message": "Đã xóa chức vụ thành công"}), 200
    return jsonify({"error": error_msg or "Lỗi khi xóa chức vụ"}), 400
