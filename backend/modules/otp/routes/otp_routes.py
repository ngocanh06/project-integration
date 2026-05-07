from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from modules.otp.schemas.otp_schema import SendOtpRequest, VerifyOtpRequest, OtpResponse
from modules.otp.services.otp_service import OtpService

router = APIRouter(prefix="/api/otp", tags=["OTP"])


@router.post("/send", response_model=OtpResponse)
def send_otp(body: SendOtpRequest, db: Session = Depends(get_db)):
    """
    Gửi mã OTP về Gmail của người dùng.

    - **email**: địa chỉ Gmail nhận mã
    - **purpose**: mục đích — `verify` | `reset_password` | `login`
    """
    success, message = OtpService.send_otp(db, body.email, body.purpose)
    if not success:
        raise HTTPException(status_code=500, detail=message)
    return OtpResponse(success=True, message=message)


@router.post("/verify", response_model=OtpResponse)
def verify_otp(body: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Xác minh mã OTP người dùng nhập vào.

    - **email**: địa chỉ Gmail đã nhận mã
    - **otp_code**: mã 6 chữ số
    - **purpose**: phải khớp với lúc gửi
    """
    success, message = OtpService.verify_otp(db, body.email, body.otp_code, body.purpose)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return OtpResponse(success=True, message=message)