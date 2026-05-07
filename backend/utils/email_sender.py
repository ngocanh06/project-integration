import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL        = os.getenv("SMTP_EMAIL", "")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")
SMTP_FROM_NAME    = os.getenv("SMTP_FROM_NAME", "Auth System")


def send_otp_email(to_email: str, otp_code: str, purpose: str = "verify") -> bool:
    """
    Gửi email chứa mã OTP đến người dùng qua Gmail SMTP.
    Trả về True nếu gửi thành công, False nếu thất bại.
    """
    subject_map = {
        "verify":         "Mã xác thực tài khoản của bạn",
        "reset_password": "Mã đặt lại mật khẩu của bạn",
        "login":          "Mã đăng nhập của bạn",
    }
    subject = subject_map.get(purpose, "Mã OTP của bạn")

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;
                border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px;">
      <h2 style="color: #333; margin-bottom: 8px;">{subject}</h2>
      <p style="color: #555;">Xin chào,</p>
      <p style="color: #555;">Mã OTP của bạn là:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px;
                     color: #1a73e8; background: #f1f3f4; padding: 12px 24px;
                     border-radius: 8px;">{otp_code}</span>
      </div>
      <p style="color: #888; font-size: 13px;">
        Mã có hiệu lực trong <strong>5 phút</strong>.<br>
        Không chia sẻ mã này với bất kỳ ai.
      </p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
      <p style="color: #aaa; font-size: 12px;">
        Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.
      </p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{SMTP_FROM_NAME} <{SMTP_EMAIL}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

        print(f"[Email] Đã gửi OTP đến {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("[Email] Lỗi xác thực Gmail — kiểm tra SMTP_APP_PASSWORD trong .env")
        return False
    except Exception as e:
        print(f"[Email] Lỗi gửi email: {e}")
        return False