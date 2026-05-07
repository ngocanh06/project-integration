from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
import uuid

from models.user_model import User


class AuthRepository:
    """Repository xử lý các thao tác database cho User"""

    # ── User ──────────────────────────────────────────────────────────────────

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        full_name: str,
        hashed_password: str,
        system_role: str = "user"
    ) -> Dict[str, Any]:
        """Tạo người dùng mới"""
        user = User(
            user_id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            password=hashed_password,
            system_role=system_role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return _user_to_dict(user)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[Dict[str, Any]]:
        """Lấy người dùng theo email"""
        user = db.query(User).filter(User.email == email).first()
        return _user_to_dict(user) if user else None

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[Dict[str, Any]]:
        """Lấy người dùng theo ID"""
        user = db.query(User).filter(User.user_id == user_id).first()
        return _user_to_dict(user) if user else None

    @staticmethod
    def update_user_password(db: Session, user_id: str, hashed_password: str) -> bool:
        """Cập nhật mật khẩu người dùng"""
        rows = (
            db.query(User)
            .filter(User.user_id == user_id)
            .update({"password": hashed_password, "updated_at": datetime.utcnow()})
        )
        db.commit()
        return rows > 0

    @staticmethod
    def user_exists(db: Session, email: str) -> bool:
        """Kiểm tra email đã tồn tại chưa"""
        return db.query(User.user_id).filter(User.email == email).first() is not None

    @staticmethod
    def get_all_users(db: Session) -> List[Dict[str, Any]]:
        """Lấy danh sách tất cả người dùng"""
        return [_user_to_dict(u) for u in db.query(User).all()]

    @staticmethod
    def delete_user(db: Session, user_id: str) -> bool:
        """Xóa người dùng"""
        rows = db.query(User).filter(User.user_id == user_id).delete()
        db.commit()
        return rows > 0


# ── Helper ────────────────────────────────────────────────────────────────────

def _user_to_dict(user: User) -> Dict[str, Any]:
    return {
        "user_id":     user.user_id,
        "email":       user.email,
        "full_name":   user.full_name,
        "password":    user.password,
        "system_role": user.system_role,
        "is_active":   user.is_active,
        "created_at":  user.created_at,
        "updated_at":  user.updated_at,
    }