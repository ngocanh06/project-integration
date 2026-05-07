"""Role Repository for database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from models.role_model import Role, Permission
import uuid


class RoleRepository:
    """Repository for Role model"""

    @staticmethod
    def create_role(role_name: str, description: str = None, db: Session = None) -> Role:
        """Create a new role"""
        role = Role(
            role_id=str(uuid.uuid4()),
            role_name=role_name,
            description=description
        )
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

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
    def update_role(role_id: str, update_data: dict, db: Session) -> Optional[Role]:
        """Update role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        if role:
            for key, value in update_data.items():
                if hasattr(role, key) and key not in ['role_id', 'created_at', 'permissions']:
                    setattr(role, key, value)
            db.commit()
            db.refresh(role)
        return role

    @staticmethod
    def delete_role(role_id: str, db: Session) -> bool:
        """Delete role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        if role:
            db.delete(role)
            db.commit()
            return True
        return False

    @staticmethod
    def role_exists(role_name: str, db: Session) -> bool:
        """Check if role exists"""
        return db.query(Role).filter(Role.role_name == role_name).first() is not None

    @staticmethod
    def add_permission_to_role(role_id: str, permission_id: str, db: Session) -> bool:
        """Add permission to role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        
        if role and permission:
            if permission not in role.permissions:
                role.permissions.append(permission)
                db.commit()
            return True
        return False

    @staticmethod
    def remove_permission_from_role(role_id: str, permission_id: str, db: Session) -> bool:
        """Remove permission from role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        
        if role and permission:
            if permission in role.permissions:
                role.permissions.remove(permission)
                db.commit()
            return True
        return False

    @staticmethod
    def get_role_permissions(role_id: str, db: Session) -> List[Permission]:
        """Get all permissions for a role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        return role.permissions if role else []


class PermissionRepository:
    """Repository for Permission model"""

    @staticmethod
    def create_permission(permission_name: str, resource: str, action: str, description: str = None, db: Session = None) -> Permission:
        """Create a new permission"""
        permission = Permission(
            permission_id=str(uuid.uuid4()),
            permission_name=permission_name,
            resource=resource,
            action=action,
            description=description
        )
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission

    @staticmethod
    def get_permission_by_id(permission_id: str, db: Session) -> Optional[Permission]:
        """Get permission by ID"""
        return db.query(Permission).filter(Permission.permission_id == permission_id).first()

    @staticmethod
    def get_permission_by_name(permission_name: str, db: Session) -> Optional[Permission]:
        """Get permission by name"""
        return db.query(Permission).filter(Permission.permission_name == permission_name).first()

    @staticmethod
    def get_all_permissions(db: Session) -> List[Permission]:
        """Get all permissions"""
        return db.query(Permission).all()

    @staticmethod
    def get_permissions_by_resource(resource: str, db: Session) -> List[Permission]:
        """Get permissions for a resource"""
        return db.query(Permission).filter(Permission.resource == resource).all()

    @staticmethod
    def delete_permission(permission_id: str, db: Session) -> bool:
        """Delete permission"""
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        if permission:
            db.delete(permission)
            db.commit()
            return True
        return False

    @staticmethod
    def permission_exists(permission_name: str, db: Session) -> bool:
        """Check if permission exists"""
        return db.query(Permission).filter(Permission.permission_name == permission_name).first() is not None
