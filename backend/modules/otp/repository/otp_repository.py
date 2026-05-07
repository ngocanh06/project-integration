from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from models.otp_model import OtpCode
import os

OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))


class OtpRepository:

    @staticmethod
    def create_otp(db: Session, email: str, otp_code: str, purpose: str) -> OtpCode:
        """Tạo OTP mới, xóa OTP cũ chưa dùng của email đó"""
        # Xóa OTP cũ cùng email + purpose chưa dùng
        db.query(OtpCode).filter(
            and_(
                OtpCode.email == email,
                OtpCode.purpose == purpose,
                OtpCode.is_used == False  # noqa: E712
            )
        ).delete()

        otp = OtpCode(
            email=email,
            otp_code=otp_code,
            purpose=purpose,
            is_used=False,
            expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
        )
        db.add(otp)
        db.commit()
        db.refresh(otp)
        return otp

    @staticmethod
    def verify_otp(db: Session, email: str, otp_code: str, purpose: str) -> bool:
        """Xác minh OTP — trả về True nếu hợp lệ"""
        otp = db.query(OtpCode).filter(
            and_(
                OtpCode.email == email,
                OtpCode.otp_code == otp_code,
                OtpCode.purpose == purpose,
                OtpCode.is_used == False   # noqa: E712
            )
        ).order_by(OtpCode.created_at.desc()).first()

        if not otp:
            return False

        if datetime.utcnow() > otp.expires_at:
            db.delete(otp)
            db.commit()
            return False

        # Đánh dấu đã dùng
        otp.is_used = True
        db.commit()
        return True

    @staticmethod
    def delete_expired(db: Session) -> None:
        """Dọn dẹp OTP hết hạn"""
        db.query(OtpCode).filter(
            OtpCode.expires_at < datetime.utcnow()
        ).delete()
        db.commit()