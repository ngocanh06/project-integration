# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from database.db_hr_connector import test_connection
from routes.attendance_routes import attendance_bp  # ← PHẢI CÓ DÒNG NÀY
from routes.mysql_routes import mysql_bp

app = Flask(__name__)
CORS(app)

# Đăng ký blueprint attendance
app.register_blueprint(attendance_bp)  # ← PHẢI CÓ DÒNG NÀY
app.register_blueprint(mysql_bp)

# ... phần còn lại giữ nguyên

# Route kiểm tra database
@app.route('/api/test', methods=['GET'])
def test_db():
    """Kiểm tra kết nối database"""
    try:
        from database.db_hr_connector import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM attendance_today")
        today_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Employees")
        emp_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Kết nối database thành công!',
            'data': {
                'employees': emp_count,
                'attendance_today': today_count
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Route chính
@app.route('/')
def home():
    """Trang chủ API"""
    return jsonify({
        'message': 'Attendance API đang chạy!',
        'version': '1.0.0',
        'endpoints': {
            'attendance': {
                'today': 'GET /api/attendance/today',
                'employees': 'GET /api/attendance/employees',
                'summary': 'GET /api/attendance/summary',
                'dashboard_stats': 'GET /api/attendance/dashboard-stats',
                'departments': 'GET /api/attendance/departments',
                'positions': 'GET /api/attendance/positions',
                'excessive_leave': 'GET /api/attendance/excessive-leave'
            },
            'mysql': {
                'test': 'GET /api/mysql/test',
                'attendance': 'GET /api/mysql/attendance?limit=50'
            },
            'test': 'GET /api/test'
        }
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 KHỞI ĐỘNG ATTENDANCE API SERVER")
    print("="*50 + "\n")
    
    if test_connection():
        print("\n✅ Database OK! Đang khởi động server...\n")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("\n❌ Không thể khởi động server do lỗi database!")