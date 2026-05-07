"""Role and Permission Management Service"""
from typing import Tuple, Dict, Any, Optional, List
from sqlalchemy.orm import Session
from modules.auth.repository.role_repository import RoleRepository, PermissionRepository


class RoleService:
    """Service for role management"""

    @staticmethod
    def create_role(
        role_name: str,
        description: str = None,
        db: Session = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Create a new role"""
        if not role_name or len(role_name) < 2:
            return False, "Role name must be at least 2 characters", None
        
        # Check if role already exists
        if RoleRepository.role_exists(role_name, db):
            return False, "Role with this name already exists", None
        
        try:
            role = RoleRepository.create_role(role_name, description, db)
            return True, "Role created successfully", {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "description": role.description,
            }
        except Exception as e:
            return False, f"Error creating role: {str(e)}", None

    @staticmethod
    def get_role(role_id: str, db: Session) -> Optional[Dict[str, Any]]:
        """Get role by ID"""
        role = RoleRepository.get_role_by_id(role_id, db)
        if role:
            permissions = [
                {
                    "permission_id": p.permission_id,
                    "permission_name": p.permission_name,
                    "resource": p.resource,
                    "action": p.action,
                } for p in role.permissions
            ]
            return {
                "role_id": role.role_id,
                "role_name": role.role_name,
                "description": role.description,
                "permissions": permissions,
                "created_at": role.created_at.isoformat() if role.created_at else None,
                "updated_at": role.updated_at.isoformat() if role.updated_at else None,
            }
        return None

    @staticmethod
    def get_all_roles(db: Session) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get all roles"""
        try:
            roles = RoleRepository.get_all_roles(db)
            roles_data = []
            for role in roles:
                permissions = [
                    {
                        "permission_id": p.permission_id,
                        "permission_name": p.permission_name,
                        "resource": p.resource,
                        "action": p.action,
                    } for p in role.permissions
                ]
                roles_data.append({
                    "role_id": role.role_id,
                    "role_name": role.role_name,
                    "description": role.description,
                    "permissions": permissions,
                    "created_at": role.created_at.isoformat() if role.created_at else None,
                })
            return True, "Roles retrieved successfully", roles_data
        except Exception as e:
            return False, f"Error retrieving roles: {str(e)}", []

    @staticmethod
    def update_role(
        role_id: str,
        role_name: str = None,
        description: str = None,
        db: Session = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Update role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        if not role:
            return False, "Role not found", None
        
        update_data = {}
        
        if role_name:
            if len(role_name) < 2:
                return False, "Role name must be at least 2 characters", None
            
            # Check if new role name already exists
            existing_role = RoleRepository.get_role_by_name(role_name, db)
            if existing_role and existing_role.role_id != role_id:
                return False, "Role name already exists", None
            
            update_data["role_name"] = role_name
        
        if description is not None:
            update_data["description"] = description
        
        try:
            updated_role = RoleRepository.update_role(role_id, update_data, db)
            if updated_role:
                return True, "Role updated successfully", {
                    "role_id": updated_role.role_id,
                    "role_name": updated_role.role_name,
                    "description": updated_role.description,
                }
            return False, "Failed to update role", None
        except Exception as e:
            return False, f"Error updating role: {str(e)}", None

    @staticmethod
    def delete_role(role_id: str, db: Session) -> Tuple[bool, str]:
        """Delete role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        if not role:
            return False, "Role not found"
        
        try:
            RoleRepository.delete_role(role_id, db)
            return True, "Role deleted successfully"
        except Exception as e:
            return False, f"Error deleting role: {str(e)}"

    @staticmethod
    def add_permission_to_role(
        role_id: str,
        permission_id: str,
        db: Session
    ) -> Tuple[bool, str]:
        """Add permission to role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        
        if not role:
            return False, "Role not found"
        if not permission:
            return False, "Permission not found"
        
        try:
            result = RoleRepository.add_permission_to_role(role_id, permission_id, db)
            if result:
                return True, "Permission added to role successfully"
            return False, "Failed to add permission to role"
        except Exception as e:
            return False, f"Error adding permission: {str(e)}"

    @staticmethod
    def remove_permission_from_role(
        role_id: str,
        permission_id: str,
        db: Session
    ) -> Tuple[bool, str]:
        """Remove permission from role"""
        role = RoleRepository.get_role_by_id(role_id, db)
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        
        if not role:
            return False, "Role not found"
        if not permission:
            return False, "Permission not found"
        
        try:
            result = RoleRepository.remove_permission_from_role(role_id, permission_id, db)
            if result:
                return True, "Permission removed from role successfully"
            return False, "Failed to remove permission from role"
        except Exception as e:
            return False, f"Error removing permission: {str(e)}"

    @staticmethod
    def get_role_permissions(role_id: str, db: Session) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get all permissions for a role"""
        try:
            permissions = RoleRepository.get_role_permissions(role_id, db)
            permissions_data = [
                {
                    "permission_id": p.permission_id,
                    "permission_name": p.permission_name,
                    "resource": p.resource,
                    "action": p.action,
                    "description": p.description,
                } for p in permissions
            ]
            return True, "Permissions retrieved successfully", permissions_data
        except Exception as e:
            return False, f"Error retrieving permissions: {str(e)}", []


class PermissionService:
    """Service for permission management"""

    @staticmethod
    def create_permission(
        permission_name: str,
        resource: str,
        action: str,
        description: str = None,
        db: Session = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Create a new permission"""
        if not permission_name or len(permission_name) < 2:
            return False, "Permission name must be at least 2 characters", None
        
        if PermissionRepository.permission_exists(permission_name, db):
            return False, "Permission with this name already exists", None
        
        try:
            permission = PermissionRepository.create_permission(
                permission_name, resource, action, description, db
            )
            return True, "Permission created successfully", {
                "permission_id": permission.permission_id,
                "permission_name": permission.permission_name,
                "resource": permission.resource,
                "action": permission.action,
                "description": permission.description,
            }
        except Exception as e:
            return False, f"Error creating permission: {str(e)}", None

    @staticmethod
    def get_all_permissions(db: Session) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get all permissions"""
        try:
            permissions = PermissionRepository.get_all_permissions(db)
            permissions_data = [
                {
                    "permission_id": p.permission_id,
                    "permission_name": p.permission_name,
                    "resource": p.resource,
                    "action": p.action,
                    "description": p.description,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                } for p in permissions
            ]
            return True, "Permissions retrieved successfully", permissions_data
        except Exception as e:
            return False, f"Error retrieving permissions: {str(e)}", []

    @staticmethod
    def get_permissions_by_resource(resource: str, db: Session) -> Tuple[bool, str, List[Dict[str, Any]]]:
        """Get permissions for a specific resource"""
        try:
            permissions = PermissionRepository.get_permissions_by_resource(resource, db)
            permissions_data = [
                {
                    "permission_id": p.permission_id,
                    "permission_name": p.permission_name,
                    "resource": p.resource,
                    "action": p.action,
                    "description": p.description,
                } for p in permissions
            ]
            return True, f"Permissions for '{resource}' retrieved successfully", permissions_data
        except Exception as e:
            return False, f"Error retrieving permissions: {str(e)}", []

    @staticmethod
    def delete_permission(permission_id: str, db: Session) -> Tuple[bool, str]:
        """Delete permission"""
        permission = PermissionRepository.get_permission_by_id(permission_id, db)
        if not permission:
            return False, "Permission not found"
        
        try:
            PermissionRepository.delete_permission(permission_id, db)
            return True, "Permission deleted successfully"
        except Exception as e:
            return False, f"Error deleting permission: {str(e)}"
