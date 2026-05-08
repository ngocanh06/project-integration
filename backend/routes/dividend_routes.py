from flask import Blueprint, jsonify, request
from services.dividend_service import get_all_dividends, create_dividend, update_dividend, delete_dividend, get_dividend_by_id

dividend_bp = Blueprint('dividends', __name__)

@dividend_bp.route('/', methods=['GET'])
def list_dividends():
    dividends = get_all_dividends()
    return jsonify(dividends)

@dividend_bp.route('/<int:id>', methods=['GET'])
def get_dividend(id):
    div = get_dividend_by_id(id)
    if div:
        return jsonify(div)
    return jsonify({"error": "Không tìm thấy thông tin cổ tức"}), 404

@dividend_bp.route('/', methods=['POST'])
def add_dividend():
    data = request.json
    # Basic validation
    if not data.get('EmployeeID') or not data.get('DividendAmount'):
        return jsonify({"error": "Thiếu thông tin bắt buộc"}), 400
    new_div = create_dividend(data)
    return jsonify(new_div), 201

@dividend_bp.route('/<int:id>', methods=['PUT'])
def edit_dividend(id):
    data = request.json
    updated_div = update_dividend(id, data)
    if updated_div:
        return jsonify(updated_div)
    return jsonify({"error": "Không tìm thấy thông tin cổ tức"}), 404

@dividend_bp.route('/<int:id>', methods=['DELETE'])
def remove_dividend(id):
    success = delete_dividend(id)
    if success:
        return jsonify({"message": "Đã xóa thông tin cổ tức"}), 200
    return jsonify({"error": "Lỗi khi xóa cổ tức"}), 400
