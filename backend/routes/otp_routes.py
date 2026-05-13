# backend/routes/otp_routes.py
from flask import Blueprint, jsonify, request
from config import get_auth_connection
import bcrypt
import random
import string
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Trỏ trực tiếp vào file .env ở thư mục backend
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path, override=True)

# Log để debug (xem trong terminal backend)
print(f"DEBUG: Loading .env from: {env_path}")
print(f"DEBUG: MAIL_USERNAME found: {os.getenv('MAIL_USERNAME')}")

otp_bp = Blueprint('otp', __name__)


def generate_otp(length=6):
    """Tao ma OTP ngau nhien 6 so"""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(to_email, otp_code):
    """Gui email OTP that qua Gmail SMTP"""
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.getenv("MAIL_PORT", "587"))
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    sender_name = os.getenv("MAIL_SENDER_NAME", "HR System")

    if not mail_username or not mail_password:
        raise Exception("Email configuration missing in .env")

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Mã OTP Đặt Lại Mật Khẩu - HR System"
    msg['From'] = f"{sender_name} <{mail_username}>"
    msg['To'] = to_email

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }}
            .container {{ max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #4a80f0 100%); padding: 36px 32px 28px; text-align: center; }}
            .header h1 {{ color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }}
            .header p {{ color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }}
            .body {{ padding: 36px 32px; }}
            .otp-box {{ background: linear-gradient(135deg, #f8f0ff 0%, #e8f0fe 100%); border: 2px dashed #4a80f0; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }}
            .otp-code {{ font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #4a80f0; font-family: 'Courier New', monospace; }}
            .otp-label {{ color: #6b7280; font-size: 13px; margin-top: 8px; }}
            .warning {{ background: #fff7ed; border-left: 4px solid #f97316; border-radius: 6px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #92400e; }}
            .footer {{ background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HR System</h1>
                <p>Xác thực đặt lại mật khẩu</p>
            </div>
            <div class="body">
                <p style="color:#374151;font-size:15px;">Xin chào,</p>
                <p style="color:#6b7280;font-size:14px;">Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP dưới đây để xác thực:</p>
                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                    <div class="otp-label">Mã xác thực (OTP)</div>
                </div>
                <div class="warning">
                    &#9888;&#65039; Mã này chỉ có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
                </div>
                <p style="color:#6b7280;font-size:13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
                &copy; 2024 HR Management System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    with smtplib.SMTP(mail_server, mail_port) as server:
        server.ehlo()
        server.starttls()
        server.login(mail_username, mail_password)
        server.sendmail(mail_username, to_email, msg.as_string())


# ======================================================
# POST /api/auth/send-otp - Gui OTP den email
# ======================================================
@otp_bp.route("/auth/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"status": "error", "msg": "Vui lòng nhập email"}), 400

    # Chỉ chấp nhận địa chỉ Gmail
    if not email.endswith("@gmail.com"):
        return jsonify({"status": "error", "msg": "Chỉ cho phép địa chỉ Gmail"}), 400

    # Kiểm tra email có tồn tại trong hệ thống người dùng không
    conn = get_auth_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "msg": "Email không tồn tại trong hệ thống"}), 404

    user_id = user['user_id']

    # Xóa mã OTP cũ (hoặc token cũ) của user này trong refresh_tokens
    # Chỉ xóa các token có độ dài 6 (giả định là OTP) để tránh xóa nhầm refresh token thực tế
    cur.execute("DELETE FROM refresh_tokens WHERE user_id = %s AND LENGTH(token) = 6", (user_id,))

    # Tao OTP moi
    otp_code = generate_otp(6)
    expires_at = datetime.now() + timedelta(minutes=10)

    # Luu OTP vao database (bang refresh_tokens)
    cur.execute("""
        INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked)
        VALUES (%s, %s, %s, 0)
    """, (user_id, otp_code, expires_at))
    conn.commit()
    cur.close()
    conn.close()

    # Gui email
    try:
        send_otp_email(email, otp_code)
    except Exception as e:
        print("Email send error:", str(e))
        return jsonify({"status": "error", "msg": f"Không thể gửi email: {str(e)}"}), 500

    return jsonify({
        "status": "success",
        "msg": f"Mã OTP đã được gửi đến {email}. Kiểm tra hộp thư đến (và mục Spam)."
    }), 200


# ======================================================
# POST /api/auth/verify-otp - Xac thuc OTP
# ======================================================
@otp_bp.route("/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    otp_code = data.get("otp_code", "").strip()

    if not email or not otp_code:
        return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ thông tin"}), 400

    conn = get_auth_connection()
    cur = conn.cursor(dictionary=True)

    # Truy vấn kết hợp với bảng users để xác thực theo email
    cur.execute("""
        SELECT rt.* FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.user_id
        WHERE u.email = %s AND rt.token = %s AND rt.is_revoked = 0
        ORDER BY rt.created_at DESC LIMIT 1
    """, (email, otp_code))
    otp_record = cur.fetchone()

    if not otp_record:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "msg": "Mã OTP không hợp lệ"}), 400

    if datetime.now() > otp_record['expires_at']:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "msg": "Mã OTP đã hết hạn. Vui lòng gửi lại."}), 400

    cur.close()
    conn.close()

    return jsonify({
        "status": "success",
        "msg": "Xác thực OTP thành công"
    }), 200


# ======================================================
# POST /api/auth/reset-password-otp - Dat lai mat khau
# ======================================================
@otp_bp.route("/auth/reset-password-otp", methods=["POST"])
def reset_password_otp():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    otp_code = data.get("otp_code", "").strip()
    new_password = data.get("new_password", "")

    if not email or not otp_code or not new_password:
        return jsonify({"status": "error", "msg": "Vui lòng nhập đầy đủ thông tin"}), 400

    if len(new_password) < 8:
        return jsonify({"status": "error", "msg": "Mật khẩu phải có ít nhất 8 ký tự"}), 400

    conn = get_auth_connection()
    cur = conn.cursor(dictionary=True)

    # Kiem tra OTP lan cuoi trong refresh_tokens
    cur.execute("""
        SELECT rt.* FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.user_id
        WHERE u.email = %s AND rt.token = %s AND rt.is_revoked = 0
        ORDER BY rt.created_at DESC LIMIT 1
    """, (email, otp_code))
    otp_record = cur.fetchone()

    if not otp_record:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "msg": "Mã OTP không hợp lệ"}), 400

    if datetime.now() > otp_record['expires_at']:
        cur.close()
        conn.close()
        return jsonify({"status": "error", "msg": "Mã OTP đã hết hạn"}), 400

    # Kiểm tra xem mật khẩu mới có trùng với mật khẩu hiện tại không
    cur.execute("SELECT password_hash FROM users WHERE email = %s", (email,))
    user_record = cur.fetchone()
    if user_record:
        current_hash = user_record['password_hash'].strip()
        new_password_stripped = new_password.strip()
        try:
            if bcrypt.checkpw(new_password_stripped.encode('utf-8'), current_hash.encode('utf-8')):
                cur.close()
                conn.close()
                return jsonify({"status": "error", "msg": "Mật khẩu mới không được trùng với mật khẩu cũ"}), 400
        except:
            pass
    
    new_password = new_password.strip()
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(12))

    # Cap nhat mat khau
    cur.execute("UPDATE users SET password_hash = %s WHERE email = %s",
                (hashed.decode('utf-8'), email))

    # Danh dau token (OTP) da su dung trong refresh_tokens
    cur.execute("UPDATE refresh_tokens SET is_revoked = 1 WHERE token_id = %s", (otp_record['token_id'],))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "status": "success",
        "msg": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."
    }), 200
