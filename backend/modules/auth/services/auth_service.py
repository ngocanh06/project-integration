from typing import Tuple, Dict, Any, Optional
import random
import string
from auth.jwt_handler import create_access_token, create_refresh_token
from auth.password_hasher import hash_password, verify_password, check_password_strength
from modules.auth.repository.auth_repository import AuthRepository
from modules.auth.validation.auth_validation import (
    validate_email, validate_password, validate_full_name, 
    validate_passwords_match, validate_reset_code
)


class AuthService:
    """Service for authentication business logic"""

    @staticmethod
    def register_user(
        full_name: str,
        business_email: str,
        password: str,
        confirm_password: str,
        system_role: str = "user"
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Register new user"""
        # Validate inputs
        valid_email, email_msg = validate_email(business_email)
        if not valid_email:
            return False, email_msg, None
        
        valid_name, name_msg = validate_full_name(full_name)
        if not valid_name:
            return False, name_msg, None
        
        valid_pwd, pwd_msg = validate_password(password)
        if not valid_pwd:
            return False, pwd_msg, None
        
        valid_match, match_msg = validate_passwords_match(password, confirm_password)
        if not valid_match:
            return False, match_msg, None
        
        # Check if user already exists
        if AuthRepository.user_exists(business_email):
            return False, "User with this email already exists", None
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user
        user = AuthRepository.create_user(business_email, full_name, hashed_password, system_role)
        
        return True, "User registered successfully", {
            "user_id": user["user_id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }

    @staticmethod
    def login_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Login user"""
        # Validate inputs
        valid_email, email_msg = validate_email(email)
        if not valid_email:
            return False, email_msg, None
        
        # Get user
        user = AuthRepository.get_user_by_email(email)
        if not user:
            return False, "Invalid email or password", None
        
        # Verify password
        if not verify_password(password, user["password"]):
            return False, "Invalid email or password", None
        
        if not user["is_active"]:
            return False, "User account is inactive", None
        
        # Create tokens
        access_token = create_access_token({
            "user_id": user["user_id"],
            "email": user["email"],
            "system_role": user["system_role"]
        })
        
        refresh_token = create_refresh_token({
            "user_id": user["user_id"],
            "email": user["email"]
        })
        
        return True, "Login successful", {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user["user_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "system_role": user["system_role"]
        }

    @staticmethod
    def request_password_reset(email: str) -> Tuple[bool, str, Optional[str]]:
        """Request password reset"""
        # Validate email
        valid_email, email_msg = validate_email(email)
        if not valid_email:
            return False, email_msg, None
        
        # Check if user exists
        if not AuthRepository.user_exists(email):
            # Return success to prevent email enumeration
            return True, "If email exists, reset code will be sent", None
        
        # Generate reset code
        reset_code = ''.join(random.choices(string.digits, k=6))
        
        # Save reset code
        AuthRepository.create_reset_code(email, reset_code)
        
        # In production, send email with reset code
        # For now, return the code (remove in production)
        return True, "Reset code sent to email", reset_code

    @staticmethod
    def verify_reset_code(email: str, reset_code: str) -> Tuple[bool, str]:
        """Verify password reset code"""
        # Validate inputs
        valid_email, email_msg = validate_email(email)
        if not valid_email:
            return False, email_msg
        
        valid_code, code_msg = validate_reset_code(reset_code)
        if not valid_code:
            return False, code_msg
        
        # Verify code
        if not AuthRepository.verify_reset_code(email, reset_code):
            return False, "Invalid or expired reset code"
        
        return True, "Reset code verified"

    @staticmethod
    def reset_password(
        email: str,
        reset_code: str,
        new_password: str,
        confirm_password: str
    ) -> Tuple[bool, str]:
        """Reset user password"""
        # Verify reset code
        valid_code, _ = AuthService.verify_reset_code(email, reset_code)
        if not valid_code:
            return False, "Invalid or expired reset code"
        
        # Validate new password
        valid_pwd, pwd_msg = validate_password(new_password)
        if not valid_pwd:
            return False, pwd_msg
        
        # Validate passwords match
        valid_match, match_msg = validate_passwords_match(new_password, confirm_password)
        if not valid_match:
            return False, match_msg
        
        # Get user
        user = AuthRepository.get_user_by_email(email)
        if not user:
            return False, "User not found"
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        AuthRepository.update_user_password(user["user_id"], hashed_password)
        AuthRepository.mark_reset_code_as_used(email)
        
        return True, "Password reset successfully"

    @staticmethod
    def change_password(
        user_id: str,
        current_password: str,
        new_password: str,
        confirm_password: str
    ) -> Tuple[bool, str]:
        """Change user password"""
        # Get user
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            return False, "User not found"
        
        # Verify current password
        if not verify_password(current_password, user["password"]):
            return False, "Current password is incorrect"
        
        # Validate new password
        valid_pwd, pwd_msg = validate_password(new_password)
        if not valid_pwd:
            return False, pwd_msg
        
        # Validate passwords match
        valid_match, match_msg = validate_passwords_match(new_password, confirm_password)
        if not valid_match:
            return False, match_msg
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        AuthRepository.update_user_password(user_id, hashed_password)
        
        return True, "Password changed successfully"

    @staticmethod
    def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile"""
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            return None
        
        return {
            "user_id": user["user_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "system_role": user["system_role"],
            "is_active": user["is_active"],
            "created_at": user["created_at"].isoformat(),
            "updated_at": user["updated_at"].isoformat()
        }
