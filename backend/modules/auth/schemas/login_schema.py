from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginSchema(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123"
            }
        }


class LoginResponseSchema(BaseModel):
    """Login response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    system_role: str

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIs...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                "token_type": "bearer",
                "user_id": "123",
                "email": "user@example.com",
                "full_name": "John Doe",
                "system_role": "user"
            }
        }
