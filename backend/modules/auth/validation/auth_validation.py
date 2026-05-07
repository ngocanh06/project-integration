from typing import Tuple
import re


def validate_email(email: str) -> Tuple[bool, str]:
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    return True, "Email is valid"


def validate_password(password: str) -> Tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    if not (has_upper and has_lower and has_digit):
        return False, "Password must contain uppercase, lowercase, and digits"
    
    return True, "Password is strong"


def validate_full_name(full_name: str) -> Tuple[bool, str]:
    """Validate full name"""
    if not full_name or len(full_name) < 2:
        return False, "Full name must be at least 2 characters"
    
    if len(full_name) > 100:
        return False, "Full name must not exceed 100 characters"
    
    return True, "Full name is valid"


def validate_passwords_match(password: str, confirm_password: str) -> Tuple[bool, str]:
    """Validate that passwords match"""
    if password != confirm_password:
        return False, "Passwords do not match"
    return True, "Passwords match"


def validate_reset_code(reset_code: str) -> Tuple[bool, str]:
    """Validate reset code format"""
    if not reset_code.isdigit():
        return False, "Reset code must contain only digits"
    
    if len(reset_code) != 6:
        return False, "Reset code must be exactly 6 digits"
    
    return True, "Reset code is valid"
