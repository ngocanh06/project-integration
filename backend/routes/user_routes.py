# backend/routes/user_routes.py
from flask import Blueprint, jsonify, request
from config import get_auth_connection
from auth.jwt_handler import admin_required
import bcrypt

user_bp = Blueprint('users', __name__)

# ======================================================
# GET: Lấy danh sách tất cả users (Admin only)
# ======================================================
@user_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_users(current_user):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.user_id, u.username, u.email, u.full_name, u.is_active,
                   u.created_at, u.role_id, r.role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id DESC
        """)
        users = cursor.fetchall()
        # Convert datetime to string
        for u in users:
            if u.get("created_at"):
                u["created_at"] = u["created_at"].isoformat()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "data": users}), 200
    except Exception as e:
        print("Lỗi GET users:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# GET: Lấy chi tiết 1 user theo ID (Admin only)
# ======================================================
@user_bp.route("/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_by_id(current_user, user_id):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.user_id, u.username, u.email, u.full_name, u.is_active,
                   u.created_at, u.role_id, r.role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = %s
        """, (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if not user:
            return jsonify({"status": "error", "msg": "Không tìm thấy tài khoản"}), 404
        if user.get("created_at"):
            user["created_at"] = user["created_at"].isoformat()
        return jsonify({"status": "success", "data": user}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# POST: Thêm user mới (Admin only)
# ======================================================
@user_bp.route("/admin/users", methods=["POST"])
@admin_required
def create_user(current_user):
    data = request.get_json()
    username  = data.get("username", "").strip()
    email     = data.get("email", "").strip()
    password  = data.get("password", "").strip()
    full_name = data.get("full_name", "").strip()
    role_id   = data.get("role_id", 4)
    is_active = data.get("is_active", 1)

    if not username or not email or not password:
        return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ username, email, mật khẩu"}), 400

    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            cursor.close(); conn.close()
            return jsonify({"status": "error", "msg": "Tên đăng nhập đã tồn tại"}), 409

        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close(); conn.close()
            return jsonify({"status": "error", "msg": "Email đã được sử dụng"}), 409

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, full_name, role_id, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (username, email, hashed, full_name, role_id, is_active))

        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "msg": "Tạo tài khoản thành công", "user_id": new_id}), 201
    except Exception as e:
        print("Lỗi POST user:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# PUT: Chỉnh sửa thông tin / vai trò user (Admin only)
# ======================================================
@user_bp.route("/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(current_user, user_id):
    data = request.get_json()
    full_name = data.get("full_name", "").strip()
    email     = data.get("email", "").strip()
    role_id   = data.get("role_id")
    is_active = data.get("is_active")

    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            cursor.close(); conn.close()
            return jsonify({"status": "error", "msg": "Không tìm thấy tài khoản"}), 404

        # Ngăn Admin tự sửa role chính mình
        if current_user.get("user_id") == user_id and role_id and role_id != 1:
            cursor.close(); conn.close()
            return jsonify({"status": "error", "msg": "Không thể tự thay đổi vai trò của chính mình"}), 400

        cursor.execute("""
            UPDATE users
            SET full_name=%s, email=%s, role_id=%s, is_active=%s
            WHERE user_id=%s
        """, (full_name, email, role_id, is_active, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "msg": "Cập nhật tài khoản thành công"}), 200
    except Exception as e:
        print("Lỗi PUT user:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# PATCH: Đặt lại mật khẩu (Admin only)
# ======================================================
@user_bp.route("/admin/users/<int:user_id>/reset-password", methods=["PATCH"])
@admin_required
def reset_user_password(current_user, user_id):
    data = request.get_json()
    new_password = data.get("new_password", "").strip()
    if len(new_password) < 6:
        return jsonify({"status": "error", "msg": "Mật khẩu phải có ít nhất 6 ký tự"}), 400
    try:
        conn = get_auth_connection()
        cursor = conn.cursor()
        hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
        cursor.execute("UPDATE users SET password_hash=%s WHERE user_id=%s", (hashed, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "msg": "Đặt lại mật khẩu thành công"}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# DELETE: Xóa user (Admin only) - không xóa chính mình
# ======================================================
@user_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(current_user, user_id):
    if current_user.get("user_id") == user_id:
        return jsonify({"status": "error", "msg": "Không thể xóa chính tài khoản đang đăng nhập"}), 400
    try:
        conn = get_auth_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE user_id=%s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "msg": "Xóa tài khoản thành công"}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500
