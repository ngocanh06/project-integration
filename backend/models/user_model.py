from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    user_id     = Column(String(36), primary_key=True, index=True)
    email       = Column(String(255), unique=True, nullable=False, index=True)
    full_name   = Column(String(255), nullable=False)
    password    = Column(Text, nullable=False)
    system_role = Column(String(50), nullable=False, default="user")
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User email={self.email}>"