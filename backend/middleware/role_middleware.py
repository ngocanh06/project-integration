"""Role-based Authorization Middleware"""
from fastapi import Request, HTTPException, status
from typing import List, Optional
from auth.permission_checker import PermissionChecker, check_permission
from middleware.auth_middleware import AuthMiddleware
from database import get_db


class RoleMiddleware:
    """Middleware for role-based access control"""

    @staticmethod
    def require_role(request: Request, required_roles: List[str]):
        """Require specific role"""
        user = AuthMiddleware.get_current_user(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        
        user_role = user.get("system_role", "user")
        
        # Check if user's role matches any of required roles
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        
        return user

    @staticmethod
    def require_admin(request: Request):
        """Require admin role"""
        return RoleMiddleware.require_role(request, ["admin"])

    @staticmethod
    def require_manager(request: Request):
        """Require manager or admin role"""
        return RoleMiddleware.require_role(request, ["admin", "manager"])

    @staticmethod
    def require_permission(request: Request, permission: str, db = None):
        """Require specific permission"""
        user = AuthMiddleware.get_current_user(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        
        user_id = user.get("sub")  # 'sub' is typically the user ID in JWT
        
        if not db:
            db = next(get_db())
        
        if not PermissionChecker.has_permission(user_id, permission, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}",
            )
        
        return user

    @staticmethod
    def check_hierarchy(user_role: str, required_role: str) -> bool:
        """Check if user's role is at or above required role"""
        return check_permission(user_role, required_role)
