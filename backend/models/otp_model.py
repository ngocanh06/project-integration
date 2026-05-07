from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.sql import func
from database import Base


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    email       = Column(String(255), nullable=False, index=True)
    otp_code    = Column(String(6), nullable=False)
    purpose     = Column(String(50), nullable=False, default="verify")
    # purpose: "verify" | "reset_password" | "login"
    is_used     = Column(Boolean, default=False, nullable=False)
    created_at  = Column(DateTime, server_default=func.now())
    expires_at  = Column(DateTime, nullable=False)

    def __repr__(self):
        return f"<OtpCode email={self.email} used={self.is_used}>"