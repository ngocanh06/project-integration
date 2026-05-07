"""Permission checker utility for authorization"""
from typing import List, Optional
from enum import Enum
from sqlalchemy.orm import Session


class SystemRole(str, Enum):
    """System roles enum"""
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"


def check_permission(user_role: str, required_role: str) -> bool:
    """Check if user has required role"""
    role_hierarchy = {
        SystemRole.ADMIN: [SystemRole.ADMIN, SystemRole.MANAGER, SystemRole.USER],
        SystemRole.MANAGER: [SystemRole.MANAGER, SystemRole.USER],
        SystemRole.USER: [SystemRole.USER]
    }
    
    user_role_enum = SystemRole(user_role) if isinstance(user_role, str) else user_role
    required_role_enum = SystemRole(required_role) if isinstance(required_role, str) else required_role
    
    allowed_roles = role_hierarchy.get(user_role_enum, [])
    return required_role_enum in allowed_roles


def get_user_permissions(user_role: str) -> List[str]:
    """Get list of permissions for user role"""
    permissions = {
        SystemRole.ADMIN: [
            "view_users", "create_user", "edit_user", "delete_user",
            "manage_roles", "view_audit_log", "manage_system",
            "user:manage", "role:manage", "permission:manage", "report:view"
        ],
        SystemRole.MANAGER: [
            "view_users", "create_user", "edit_user", "view_audit_log",
            "report:view", "attendance:manage"
        ],
        SystemRole.USER: [
            "view_profile", "edit_profile", "change_password"
        ]
    }
    
    user_role_enum = SystemRole(user_role) if isinstance(user_role, str) else user_role
    return permissions.get(user_role_enum, [])


def has_permission(user_role: str, permission: str) -> bool:
    """Check if user has specific permission"""
    permissions = get_user_permissions(user_role)
    return permission in permissions


class PermissionChecker:
    """Check user permissions and authorize actions"""

    @staticmethod
    def has_permission(user_id: str, permission_name: str, db: Session) -> bool:
        """Check if user has specific permission"""
        from database.db_auth_connector import AuthDatabaseConnector
        return AuthDatabaseConnector.user_has_permission(user_id, permission_name, db)

    @staticmethod
    def has_any_permission(user_id: str, permissions: List[str], db: Session) -> bool:
        """Check if user has any of the specified permissions"""
        for permission in permissions:
            if PermissionChecker.has_permission(user_id, permission, db):
                return True
        return False

    @staticmethod
    def has_all_permissions(user_id: str, permissions: List[str], db: Session) -> bool:
        """Check if user has all specified permissions"""
        for permission in permissions:
            if not PermissionChecker.has_permission(user_id, permission, db):
                return False
        return True

    @staticmethod
    def can_manage_users(user_id: str, db: Session) -> bool:
        """Check if user can manage other users"""
        return PermissionChecker.has_permission(user_id, "user:manage", db)

    @staticmethod
    def can_manage_roles(user_id: str, db: Session) -> bool:
        """Check if user can manage roles"""
        return PermissionChecker.has_permission(user_id, "role:manage", db)

    @staticmethod
    def is_admin(user_id: str, db: Session) -> bool:
        """Check if user is admin"""
        from database.db_auth_connector import AuthDatabaseConnector
        user = AuthDatabaseConnector.get_user_by_id(user_id, db)
        return user and user.system_role == "admin"

    @staticmethod
    def is_active(user_id: str, db: Session) -> bool:
        """Check if user is active"""
        from database.db_auth_connector import AuthDatabaseConnector
        user = AuthDatabaseConnector.get_user_by_id(user_id, db)
        return user and user.is_active
