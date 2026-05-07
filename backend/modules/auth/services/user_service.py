"""User Management Service"""
from typing import Tuple, Dict, Any, Optional, List
from sqlalchemy.orm import Session
from modules.auth.repository.user_repository import UserRepository
from modules.auth.repository.role_repository import RoleRepository
from modules.auth.validation.auth_validation import validate_email, validate_full_name
from auth.password_hasher import hash_password, verify_password


class UserService:
    """Service for user management"""

    @staticmethod
    def get_user_by_id(user_id: str, db: Session) -> Optional[Dict[str, Any]]:
        """Get user information by ID"""
        user = UserRepository.get_user_by_id(user_id, db)
        if user:
            return {
                "user_id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "system_role": user.system_role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            }
        return None

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get all users"""
        try:
            users = UserRepository.get_all_users(db, skip, limit)
            users_data = []
            for user in users:
                users_data.append({
                    "user_id": user.user_id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "system_role": user.system_role,
                    "is_active": user.is_active,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                })
            return True, "Users retrieved successfully", users_data
        except Exception as e:
            return False, f"Error retrieving users: {str(e)}", []

    @staticmethod
    def create_user(
        email: str,
        full_name: str,
        password: str,
        system_role: str = "user",
        db: Session = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Create a new user"""
        # Validate email
        valid_email, email_msg = validate_email(email)
        if not valid_email:
            return False, email_msg, None
        
        # Validate full name
        valid_name, name_msg = validate_full_name(full_name)
        if not valid_name:
            return False, name_msg, None
        
        # Check if user already exists
        if UserRepository.user_exists(email, db):
            return False, "User with this email already exists", None
        
        try:
            # Hash password
            hashed_password = hash_password(password)
            
            # Create user
            user = UserRepository.create_user(email, full_name, hashed_password, system_role, db)
            
            return True, "User created successfully", {
                "user_id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "system_role": user.system_role,
                "is_active": user.is_active,
            }
        except Exception as e:
            return False, f"Error creating user: {str(e)}", None

    @staticmethod
    def update_user(
        user_id: str,
        email: str = None,
        full_name: str = None,
        system_role: str = None,
        db: Session = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Update user information"""
        # Get existing user
        user = UserRepository.get_user_by_id(user_id, db)
        if not user:
            return False, "User not found", None
        
        update_data = {}
        
        # Validate and prepare updates
        if email:
            valid_email, email_msg = validate_email(email)
            if not valid_email:
                return False, email_msg, None
            
            # Check if new email already exists
            existing_user = UserRepository.get_user_by_email(email, db)
            if existing_user and existing_user.user_id != user_id:
                return False, "Email already in use", None
            
            update_data["email"] = email
        
        if full_name:
            valid_name, name_msg = validate_full_name(full_name)
            if not valid_name:
                return False, name_msg, None
            update_data["full_name"] = full_name
        
        if system_role:
            update_data["system_role"] = system_role
        
        try:
            updated_user = UserRepository.update_user(user_id, update_data, db)
            if updated_user:
                return True, "User updated successfully", {
                    "user_id": updated_user.user_id,
                    "email": updated_user.email,
                    "full_name": updated_user.full_name,
                    "system_role": updated_user.system_role,
                }
            return False, "Failed to update user", None
        except Exception as e:
            return False, f"Error updating user: {str(e)}", None

    @staticmethod
    def delete_user(user_id: str, db: Session) -> Tuple[bool, str]:
        """Delete user"""
        user = UserRepository.get_user_by_id(user_id, db)
        if not user:
            return False, "User not found"
        
        try:
            UserRepository.delete_user(user_id, db)
            return True, "User deleted successfully"
        except Exception as e:
            return False, f"Error deleting user: {str(e)}"

    @staticmethod
    def change_user_password(
        user_id: str,
        old_password: str,
        new_password: str,
        db: Session
    ) -> Tuple[bool, str]:
        """Change user password"""
        user = UserRepository.get_user_by_id(user_id, db)
        if not user:
            return False, "User not found"
        
        # Verify old password
        if not verify_password(old_password, user.password):
            return False, "Current password is incorrect"
        
        try:
            hashed_password = hash_password(new_password)
            updated_user = UserRepository.update_user(
                user_id,
                {"password": hashed_password},
                db
            )
            if updated_user:
                return True, "Password changed successfully"
            return False, "Failed to change password"
        except Exception as e:
            return False, f"Error changing password: {str(e)}"

    @staticmethod
    def get_users_by_role(role: str, db: Session) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get all users with specific role"""
        try:
            users = UserRepository.get_users_by_role(role, db)
            users_data = [
                {
                    "user_id": u.user_id,
                    "email": u.email,
                    "full_name": u.full_name,
                    "system_role": u.system_role,
                } for u in users
            ]
            return True, f"Users with role '{role}' retrieved successfully", users_data
        except Exception as e:
            return False, f"Error retrieving users: {str(e)}", []
