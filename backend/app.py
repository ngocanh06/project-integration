from flask import Flask, Blueprint, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Payroll Route directly for demo
payroll_bp = Blueprint('payroll', __name__)

try:
    from services.payroll_service import get_all_salaries, sync_hr_to_payroll

    @payroll_bp.route('/', methods=['GET'])
    def list_salaries():
        salaries = get_all_salaries()
        return jsonify(salaries)

    @payroll_bp.route('/sync', methods=['POST'])
    def sync_payroll():
        success = sync_hr_to_payroll()
        if success:
            return jsonify({"message": "Đồng bộ Payroll thành công"}), 200
        return jsonify({"error": "Lỗi khi đồng bộ"}), 400

except Exception as e:
    print(f"[WARNING] Payroll service không khả dụng: {e}")

    @payroll_bp.route('/', methods=['GET'])
    def list_salaries():
        return jsonify([])

    @payroll_bp.route('/sync', methods=['POST'])
    def sync_payroll():
        return jsonify({"error": "Payroll service chưa được cấu hình"}), 503

# Import và đăng ký các blueprints
from routes.department_routes import department_bp
from routes.position_routes import position_bp
from routes.employee_routes import employee_bp
from routes.dividend_routes import dividend_bp

app.register_blueprint(department_bp, url_prefix='/api/departments')
app.register_blueprint(position_bp, url_prefix='/api/positions')
app.register_blueprint(employee_bp, url_prefix='/api/employees')
app.register_blueprint(payroll_bp, url_prefix='/api/payroll')
app.register_blueprint(dividend_bp, url_prefix='/api/dividends')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
