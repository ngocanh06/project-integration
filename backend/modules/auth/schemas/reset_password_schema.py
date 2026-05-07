from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordSchema(BaseModel):
    """Forgot password request schema"""
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class VerifyResetCodeSchema(BaseModel):
    """Verify reset code request schema"""
    email: EmailStr
    reset_code: str = Field(..., min_length=6, max_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "reset_code": "123456"
            }
        }


class ResetPasswordSchema(BaseModel):
    """Reset password request schema"""
    email: EmailStr
    reset_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "reset_code": "123456",
                "new_password": "NewPass123",
                "confirm_password": "NewPass123"
            }
        }


class ChangePasswordSchema(BaseModel):
    """Change password request schema"""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "OldPass123",
                "new_password": "NewPass123",
                "confirm_password": "NewPass123"
            }
        }
