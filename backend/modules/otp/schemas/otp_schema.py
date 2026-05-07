from pydantic import BaseModel, EmailStr
from typing import Literal


class SendOtpRequest(BaseModel):
    email: EmailStr
    purpose: Literal["verify", "reset_password", "login"] = "verify"


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str
    purpose: Literal["verify", "reset_password", "login"] = "verify"


class OtpResponse(BaseModel):
    success: bool
    message: str