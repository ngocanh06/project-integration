"""Database connector for authentication module"""
from sqlalchemy.orm import Session
from typing import Optional, List
from models.user_model import User
from models.role_model import Role, Permission
from database import SessionLocal


class AuthDatabaseConnector:
    """Connector for authentication-related database operations"""

    @staticmethod
    def get_db_session() -> Session:
        """Get a new database session"""
        return SessionLocal()

    @staticmethod
    def get_user_by_email(email: str, db: Session) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(user_id: str, db: Session) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def get_active_users(db: Session) -> List[User]:
        """Get all active users"""
        return db.query(User).filter(User.is_active == True).all()

    @staticmethod
    def create_user(user: User, db: Session) -> User:
        """Create new user"""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(user_id: str, updates: dict, db: Session) -> Optional[User]:
        """Update user information"""
        user = db.query(User).filter(User.user_id == user_id).first()
        if user:
            for key, value in updates.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def delete_user(user_id: str, db: Session) -> bool:
        """Delete user (soft delete by setting is_active to False)"""
        user = db.query(User).filter(User.user_id == user_id).first()
        if user:
            user.is_active = False
            db.commit()
            return True
        return False

    @staticmethod
    def get_role_by_id(role_id: str, db: Session) -> Optional[Role]:
        """Get role by ID"""
        return db.query(Role).filter(Role.role_id == role_id).first()

    @staticmethod
    def get_role_by_name(role_name: str, db: Session) -> Optional[Role]:
        """Get role by name"""
        return db.query(Role).filter(Role.role_name == role_name).first()

    @staticmethod
    def get_all_roles(db: Session) -> List[Role]:
        """Get all roles"""
        return db.query(Role).all()

    @staticmethod
    def create_role(role: Role, db: Session) -> Role:
        """Create new role"""
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def update_role(role_id: str, updates: dict, db: Session) -> Optional[Role]:
        """Update role"""
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if role:
            for key, value in updates.items():
                if hasattr(role, key) and key != 'permissions':
                    setattr(role, key, value)
            db.commit()
            db.refresh(role)
        return role

    @staticmethod
    def delete_role(role_id: str, db: Session) -> bool:
        """Delete role"""
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if role:
            db.delete(role)
            db.commit()
            return True
        return False

    @staticmethod
    def get_permission_by_id(permission_id: str, db: Session) -> Optional[Permission]:
        """Get permission by ID"""
        return db.query(Permission).filter(Permission.permission_id == permission_id).first()

    @staticmethod
    def get_all_permissions(db: Session) -> List[Permission]:
        """Get all permissions"""
        return db.query(Permission).all()

    @staticmethod
    def get_permissions_by_resource(resource: str, db: Session) -> List[Permission]:
        """Get permissions for a specific resource"""
        return db.query(Permission).filter(Permission.resource == resource).all()

    @staticmethod
    def create_permission(permission: Permission, db: Session) -> Permission:
        """Create new permission"""
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission

    @staticmethod
    def delete_permission(permission_id: str, db: Session) -> bool:
        """Delete permission"""
        permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
        if permission:
            db.delete(permission)
            db.commit()
            return True
        return False

    @staticmethod
    def assign_permission_to_role(role_id: str, permission_id: str, db: Session) -> bool:
        """Assign permission to role"""
        role = db.query(Role).filter(Role.role_id == role_id).first()
        permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
        
        if role and permission:
            if permission not in role.permissions:
                role.permissions.append(permission)
                db.commit()
            return True
        return False

    @staticmethod
    def remove_permission_from_role(role_id: str, permission_id: str, db: Session) -> bool:
        """Remove permission from role"""
        role = db.query(Role).filter(Role.role_id == role_id).first()
        permission = db.query(Permission).filter(Permission.permission_id == permission_id).first()
        
        if role and permission:
            if permission in role.permissions:
                role.permissions.remove(permission)
                db.commit()
            return True
        return False

    @staticmethod
    def get_role_permissions(role_id: str, db: Session) -> List[Permission]:
        """Get all permissions for a role"""
        role = db.query(Role).filter(Role.role_id == role_id).first()
        return role.permissions if role else []

    @staticmethod
    def user_has_permission(user_id: str, permission_name: str, db: Session) -> bool:
        """Check if user has specific permission"""
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return False
        
        # If user is admin, grant all permissions
        if user.system_role == "admin":
            return True
        
        role = db.query(Role).filter(Role.role_name == user.system_role).first()
        if role:
            permission_names = [p.permission_name for p in role.permissions]
            return permission_name in permission_names
        
        return False
