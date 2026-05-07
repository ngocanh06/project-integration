"""Role and Permission Management Routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from middleware.auth_middleware import AuthMiddleware
from middleware.role_middleware import RoleMiddleware
from modules.auth.services.role_service import RoleService, PermissionService
from pydantic import BaseModel

router = APIRouter(prefix="/api/roles", tags=["roles"])


# ── Schemas ────────────────────────────────────────────────────────────────

class PermissionSchema(BaseModel):
    permission_name: str
    resource: str
    action: str
    description: Optional[str] = None


class RoleSchema(BaseModel):
    role_name: str
    description: Optional[str] = None


class RoleUpdateSchema(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None


class AssignPermissionSchema(BaseModel):
    permission_id: str


# ── Role Routes ────────────────────────────────────────────────────────────

@router.get("", name="Get all roles")
async def get_all_roles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get all roles"""
    success, message, roles = RoleService.get_all_roles(db)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": roles,
            "total": len(roles)
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.get("/{role_id}", name="Get role by ID")
async def get_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get role by ID"""
    role = RoleService.get_role(role_id, db)
    
    if role:
        return {
            "success": True,
            "message": "Role retrieved successfully",
            "data": role
        }
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")


@router.post("", name="Create new role")
async def create_role(
    role_data: RoleSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Create a new role (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message, role = RoleService.create_role(
        role_name=role_data.role_name,
        description=role_data.description,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": role
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.put("/{role_id}", name="Update role")
async def update_role(
    role_id: str,
    role_data: RoleUpdateSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Update role (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message, role = RoleService.update_role(
        role_id=role_id,
        role_name=role_data.role_name,
        description=role_data.description,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": role
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.delete("/{role_id}", name="Delete role")
async def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Delete role (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message = RoleService.delete_role(role_id, db)
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)


@router.get("/{role_id}/permissions", name="Get role permissions")
async def get_role_permissions(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get all permissions for a role"""
    success, message, permissions = RoleService.get_role_permissions(role_id, db)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": permissions,
            "total": len(permissions)
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.post("/{role_id}/permissions", name="Add permission to role")
async def add_permission(
    role_id: str,
    perm_data: AssignPermissionSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Add permission to role (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message = RoleService.add_permission_to_role(
        role_id=role_id,
        permission_id=perm_data.permission_id,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.delete("/{role_id}/permissions/{permission_id}", name="Remove permission from role")
async def remove_permission(
    role_id: str,
    permission_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Remove permission from role (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message = RoleService.remove_permission_from_role(
        role_id=role_id,
        permission_id=permission_id,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


# ── Permission Routes ──────────────────────────────────────────────────────

permissions_router = APIRouter(prefix="/api/permissions", tags=["permissions"])


@permissions_router.get("", name="Get all permissions")
async def get_all_permissions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get all permissions"""
    success, message, permissions = PermissionService.get_all_permissions(db)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": permissions,
            "total": len(permissions)
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@permissions_router.post("", name="Create new permission")
async def create_permission(
    perm_data: PermissionSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Create a new permission (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message, permission = PermissionService.create_permission(
        permission_name=perm_data.permission_name,
        resource=perm_data.resource,
        action=perm_data.action,
        description=perm_data.description,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": permission
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@permissions_router.get("/resource/{resource}", name="Get permissions by resource")
async def get_permissions_by_resource(
    resource: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get permissions for a specific resource"""
    success, message, permissions = PermissionService.get_permissions_by_resource(resource, db)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": permissions,
            "total": len(permissions)
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@permissions_router.delete("/{permission_id}", name="Delete permission")
async def delete_permission(
    permission_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Delete permission (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message = PermissionService.delete_permission(permission_id, db)
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)
