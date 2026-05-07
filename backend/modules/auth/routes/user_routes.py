"""User Management Routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from middleware.auth_middleware import AuthMiddleware
from middleware.role_middleware import RoleMiddleware
from modules.auth.services.user_service import UserService
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/users", tags=["users"])


# ── Schemas ────────────────────────────────────────────────────────────────

class UserCreateSchema(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    system_role: Optional[str] = "user"


class UserUpdateSchema(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    system_role: Optional[str] = None


class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


# ── Routes ────────────────────────────────────────────────────────────────

@router.get("", name="Get all users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get all users (Admin only)"""
    # Check admin role
    RoleMiddleware.require_admin(None, db)
    
    success, message, users = UserService.get_all_users(db, skip, limit)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": users,
            "total": len(users)
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.get("/{user_id}", name="Get user by ID")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get user by ID"""
    user_data = UserService.get_user_by_id(user_id, db)
    
    if user_data:
        return {
            "success": True,
            "message": "User retrieved successfully",
            "data": user_data
        }
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.post("", name="Create new user")
async def create_user(
    user_data: UserCreateSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Create a new user (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message, user = UserService.create_user(
        email=user_data.email,
        full_name=user_data.full_name,
        password=user_data.password,
        system_role=user_data.system_role,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": user
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.put("/{user_id}", name="Update user")
async def update_user(
    user_id: str,
    user_data: UserUpdateSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Update user (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message, user = UserService.update_user(
        user_id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        system_role=user_data.system_role,
        db=db
    )
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": user
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.delete("/{user_id}", name="Delete user")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Delete user (Admin only)"""
    RoleMiddleware.require_admin(None, db)
    
    success, message = UserService.delete_user(user_id, db)
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_404_BAD_REQUEST, detail=message)


@router.get("/role/{role}", name="Get users by role")
async def get_users_by_role(
    role: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Get all users with specific role"""
    success, message, users = UserService.get_users_by_role(role, db)
    
    if success:
        return {
            "success": True,
            "message": message,
            "data": users
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.post("/{user_id}/change-password", name="Change password")
async def change_password(
    user_id: str,
    pwd_data: ChangePasswordSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthMiddleware.require_auth)
):
    """Change user password"""
    # User can only change their own password, unless admin
    if current_user.get("sub") != user_id and current_user.get("system_role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only change your own password"
        )
    
    if pwd_data.new_password != pwd_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    success, message = UserService.change_user_password(
        user_id, pwd_data.old_password, pwd_data.new_password, db
    )
    
    if success:
        return {
            "success": True,
            "message": message
        }
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
