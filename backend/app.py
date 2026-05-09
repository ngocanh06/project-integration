# backend/app.py
from flask import Flask, jsonify  # ← thay render_template bằng jsonify
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.department_routes import department_bp
from routes.employee_routes import employee_bp
from routes.position_routes import position_bp
from routes.payroll_routes import payroll_bp
from routes.attendance_routes import attendance_bp
from routes.report_routes import report_bp
from routes.alert_routes import alert_bp
from routes.dividend_routes import dividend_bp
# from routes.user_routes import user_bp
# from routes.role_routes import role_bp
# from routes.audit_routes import audit_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(department_bp, url_prefix='/api')
app.register_blueprint(employee_bp, url_prefix='/api')
app.register_blueprint(position_bp, url_prefix='/api')
app.register_blueprint(payroll_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(report_bp, url_prefix='/api')
app.register_blueprint(alert_bp, url_prefix='/api')
app.register_blueprint(dividend_bp, url_prefix='/api')
# app.register_blueprint(user_bp, url_prefix='/api')
# app.register_blueprint(role_bp, url_prefix='/api')
# app.register_blueprint(audit_bp, url_prefix='/api')

# print("=== ALL ROUTES ===")
# for rule in app.url_map.iter_rules():
#     print(rule)

@app.route("/")
def index():
    return jsonify({
        "message": "HR & Payroll API is running",
        "status": "ok",
        "api_endpoints": [
            "/api/Employees",
            "/api/Departments", 
            "/api/Positions",
            "/api/Payroll",
            "/api/Attendance",
            "/api/Reports/HR"
        ]
    })

if __name__ == "__main__":
    app.run(debug=True)