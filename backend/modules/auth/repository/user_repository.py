"""User Repository for database operations"""
from sqlalchemy.orm import Session
from typing import List, Optional
from models.user_model import User
import uuid


class UserRepository:
    """Repository for User model"""

    @staticmethod
    def create_user(email: str, full_name: str, password: str, system_role: str = "user", db: Session = None) -> User:
        """Create a new user"""
        user = User(
            user_id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            password=password,
            system_role=system_role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_id(user_id: str, db: Session) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def get_user_by_email(email: str, db: Session) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users"""
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def get_active_users(db: Session) -> List[User]:
        """Get all active users"""
        return db.query(User).filter(User.is_active == True).all()

    @staticmethod
    def update_user(user_id: str, update_data: dict, db: Session) -> Optional[User]:
        """Update user"""
        user = UserRepository.get_user_by_id(user_id, db)
        if user:
            for key, value in update_data.items():
                if hasattr(user, key) and key not in ['user_id', 'created_at']:
                    setattr(user, key, value)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def delete_user(user_id: str, db: Session) -> bool:
        """Delete user (soft delete)"""
        user = UserRepository.get_user_by_id(user_id, db)
        if user:
            user.is_active = False
            db.commit()
            return True
        return False

    @staticmethod
    def user_exists(email: str, db: Session) -> bool:
        """Check if user exists"""
        return db.query(User).filter(User.email == email).first() is not None

    @staticmethod
    def get_users_by_role(role: str, db: Session) -> List[User]:
        """Get all users with specific role"""
        return db.query(User).filter(User.system_role == role).filter(User.is_active == True).all()
