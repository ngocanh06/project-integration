from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class SystemRoleEnum(str, Enum):
    """System role options for registration"""
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"


class RegisterSchema(BaseModel):
    """Registration request schema"""
    full_name: str = Field(..., min_length=2, max_length=100)
    business_email: EmailStr
    system_role: SystemRoleEnum = SystemRoleEnum.USER
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "business_email": "john@company.com",
                "system_role": "user",
                "password": "SecurePass123",
                "confirm_password": "SecurePass123"
            }
        }

    def validate_passwords_match(self):
        """Validate that passwords match"""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")


class RegisterResponseSchema(BaseModel):
    """Registration response schema"""
    user_id: str
    email: str
    full_name: str
    message: str = "Account created successfully"

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123",
                "email": "john@company.com",
                "full_name": "John Doe",
                "message": "Account created successfully"
            }
        }
