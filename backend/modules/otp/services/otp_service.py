import random
import string
from sqlalchemy.orm import Session
from modules.otp.repository.otp_repository import OtpRepository
from utils.email_sender import send_otp_email


class OtpService:

    @staticmethod
    def _generate_otp(length: int = 6) -> str:
        """Tạo mã OTP ngẫu nhiên gồm các chữ số"""
        return "".join(random.choices(string.digits, k=length))

    @staticmethod
    def send_otp(db: Session, email: str, purpose: str) -> tuple[bool, str]:
        """
        Tạo OTP, lưu vào DB và gửi email.
        Trả về (success: bool, message: str)
        """
        otp_code = OtpService._generate_otp()

        # Lưu vào DB
        OtpRepository.create_otp(db, email, otp_code, purpose)

        # Gửi email
        sent = send_otp_email(email, otp_code, purpose)
        if not sent:
            return False, "Không thể gửi email. Kiểm tra cấu hình SMTP trong .env"

        return True, f"Mã OTP đã được gửi đến {email}"

    @staticmethod
    def verify_otp(db: Session, email: str, otp_code: str, purpose: str) -> tuple[bool, str]:
        """
        Xác minh OTP.
        Trả về (success: bool, message: str)
        """
        if len(otp_code) != 6 or not otp_code.isdigit():
            return False, "Mã OTP không hợp lệ (phải là 6 chữ số)"

        is_valid = OtpRepository.verify_otp(db, email, otp_code, purpose)
        if not is_valid:
            return False, "Mã OTP không đúng hoặc đã hết hạn"

        return True, "Xác thực OTP thành công"