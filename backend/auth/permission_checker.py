from typing import List, Optional
from enum import Enum


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
            "manage_roles", "view_audit_log", "manage_system"
        ],
        SystemRole.MANAGER: [
            "view_users", "create_user", "edit_user", "view_audit_log"
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
