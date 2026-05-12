# backend/routes/role_routes.py
from flask import Blueprint, jsonify
from config import get_auth_connection
from auth.jwt_handler import admin_required

role_bp = Blueprint('roles', __name__)

# Vai trò hiển thị (loại bỏ Guest, Manager nếu có)
DISPLAY_ROLES = {1, 2, 3, 4}

ROLE_META = {
    1: {"display_name": "Admin",           "description": "Toàn quyền quản trị hệ thống",          "color": "danger"},
    2: {"display_name": "Quản lý Nhân sự", "description": "Quản lý nhân sự, phòng ban, chấm công",  "color": "primary"},
    3: {"display_name": "Kế toán",         "description": "Quản lý lương, cổ tức, tài chính",       "color": "success"},
    4: {"display_name": "Nhân viên",       "description": "Xem thông tin cá nhân và lịch sử lương",  "color": "info"},
}

# ======================================================
# GET: Danh sách vai trò + quyền từ DB (Admin only)
# ======================================================
@role_bp.route("/roles", methods=["GET"])
@admin_required
def get_roles(current_user):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        # Lấy roles
        cursor.execute("SELECT role_id, role_name, description FROM roles ORDER BY role_id")
        db_roles = cursor.fetchall()

        result = []
        for row in db_roles:
            rid = row["role_id"]
            if rid not in DISPLAY_ROLES:
                continue

            # Đếm permissions của role này
            cursor.execute("""
                SELECT COUNT(*) as cnt FROM role_permissions WHERE role_id = %s
            """, (rid,))
            perm_count = cursor.fetchone()["cnt"]

            # Lấy permissions chi tiết
            cursor.execute("""
                SELECT p.permission_id, p.resource, p.action, p.description
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.permission_id
                WHERE rp.role_id = %s
                ORDER BY p.resource, p.action
            """, (rid,))
            perms = cursor.fetchall()

            meta = ROLE_META.get(rid, {})
            result.append({
                "role_id":      rid,
                "role_name":    row["role_name"],
                "display_name": meta.get("display_name", row["role_name"]),
                "description":  meta.get("description", row.get("description", "")),
                "color":        meta.get("color", "secondary"),
                "permissions":  perms,
                "perm_count":   perm_count,
            })

        cursor.close()
        conn.close()
        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        print("Lỗi GET roles:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# GET: Tất cả quyền hạn phân theo nhóm resource (Admin only)
# ======================================================
@role_bp.route("/admin/permissions", methods=["GET"])
@admin_required
def get_permissions(current_user):
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT permission_id, resource, action, description
            FROM permissions
            ORDER BY resource, action
        """)
        all_perms = cursor.fetchall()

        # Phân nhóm theo resource
        groups = {}
        for p in all_perms:
            res = p["resource"]
            if res not in groups:
                groups[res] = []
            groups[res].append(p)

        # Map tên resource sang tiếng Việt
        resource_labels = {
            "employees":   "Nhân sự",
            "departments": "Phòng ban",
            "positions":   "Chức vụ",
            "payroll":     "Lương",
            "attendance":  "Chấm công",
            "dividends":   "Cổ tức",
            "reports":     "Báo cáo",
            "users":       "Tài khoản",
            "roles":       "Vai trò",
            "audit":       "Nhật ký",
            "alerts":      "Cảnh báo",
        }

        result = []
        for resource, perms in sorted(groups.items()):
            result.append({
                "resource":       resource,
                "resource_label": resource_labels.get(resource, resource.capitalize()),
                "permissions":    perms,
                "count":          len(perms),
            })

        cursor.close()
        conn.close()
        return jsonify({"status": "success", "data": result}), 200

    except Exception as e:
        print("Lỗi GET permissions:", str(e))
        return jsonify({"status": "error", "msg": str(e)}), 500

# ======================================================
# GET: Quyền hạn của 1 role cụ thể
# ======================================================
@role_bp.route("/admin/roles/<int:role_id>/permissions", methods=["GET"])
@admin_required
def get_role_permissions(current_user, role_id):
    if role_id not in DISPLAY_ROLES:
        return jsonify({"status": "error", "msg": "Vai trò không hợp lệ"}), 404
    try:
        conn = get_auth_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.permission_id, p.resource, p.action, p.description
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = %s
            ORDER BY p.resource, p.action
        """, (role_id,))
        perms = cursor.fetchall()
        meta = ROLE_META.get(role_id, {})
        cursor.close()
        conn.close()
        return jsonify({
            "status": "success",
            "role_id": role_id,
            "display_name": meta.get("display_name", ""),
            "permissions": perms,
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500
