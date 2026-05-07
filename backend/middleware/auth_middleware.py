"""Authentication Middleware"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from auth.jwt_handler import verify_access_token
from typing import Optional, Dict, Any
import jwt


class AuthMiddleware:
    """Middleware for authentication"""

    @staticmethod
    def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
        """Get current user from request"""
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                return None
            
            payload = verify_access_token(token)
            return payload
        except (ValueError, jwt.InvalidTokenError):
            return None

    @staticmethod
    def require_auth(request: Request) -> Dict[str, Any]:
        """Require authentication"""
        user = AuthMiddleware.get_current_user(request)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def get_token_from_request(request: Request) -> Optional[str]:
        """Extract token from request"""
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        
        try:
            scheme, token = auth_header.split()
            if scheme.lower() == "bearer":
                return token
        except ValueError:
            pass
        
        return None
