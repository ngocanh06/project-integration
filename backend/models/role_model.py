from sqlalchemy import Column, String, DateTime, Text, Table, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

# Association table for many-to-many relationship between Role and Permission
role_permission = Table(
    'role_permission',
    Base.metadata,
    Column('role_id', String(36), ForeignKey('roles.role_id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', String(36), ForeignKey('permissions.permission_id', ondelete='CASCADE'), primary_key=True)
)


class Role(Base):
    __tablename__ = "roles"

    role_id     = Column(String(36), primary_key=True, index=True)
    role_name   = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    permissions = relationship("Permission", secondary=role_permission, backref="roles")
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Role name={self.role_name}>"


class Permission(Base):
    __tablename__ = "permissions"

    permission_id   = Column(String(36), primary_key=True, index=True)
    permission_name = Column(String(100), unique=True, nullable=False, index=True)
    description     = Column(Text, nullable=True)
    resource        = Column(String(100), nullable=False)  # e.g., 'user', 'role', 'report'
    action          = Column(String(100), nullable=False)   # e.g., 'create', 'read', 'update', 'delete'
    created_at      = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Permission {self.permission_name}>"
