from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from modules.auth.schemas.login_schema import LoginSchema, LoginResponseSchema
from modules.auth.schemas.register_schema import RegisterSchema, RegisterResponseSchema
from modules.auth.schemas.reset_password_schema import (
    ForgotPasswordSchema, VerifyResetCodeSchema, ResetPasswordSchema, ChangePasswordSchema
)
from modules.auth.services.auth_service import AuthService
from auth.jwt_handler import verify_access_token

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def get_current_user(authorization: str = None):
    """Dependency to get current authenticated user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = verify_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/register", response_model=RegisterResponseSchema)
async def register(request: RegisterSchema):
    """Register new user"""
    request.validate_passwords_match()
    
    success, message, user_data = AuthService.register_user(
        request.full_name,
        request.business_email,
        request.password,
        request.confirm_password,
        request.system_role.value
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return RegisterResponseSchema(
        user_id=user_data["user_id"],
        email=user_data["email"],
        full_name=user_data["full_name"],
        message="Account created successfully"
    )


@router.post("/login", response_model=LoginResponseSchema)
async def login(request: LoginSchema):
    """Login user"""
    success, message, token_data = AuthService.login_user(request.email, request.password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message
        )
    
    return LoginResponseSchema(**token_data)


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordSchema):
    """Request password reset"""
    success, message, reset_code = AuthService.request_password_reset(request.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # In production, send email with reset code
    # For development, return the code
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": message,
            "reset_code": reset_code  # Remove in production
        }
    )


@router.post("/verify-reset-code")
async def verify_reset_code(request: VerifyResetCodeSchema):
    """Verify password reset code"""
    success, message = AuthService.verify_reset_code(request.email, request.reset_code)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": message}
    )


@router.post("/reset-password")
async def reset_password(request: ResetPasswordSchema):
    """Reset user password"""
    success, message = AuthService.reset_password(
        request.email,
        request.reset_code,
        request.new_password,
        request.confirm_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": message,
            "status": "Password reset successful"
        }
    )


@router.post("/change-password")
async def change_password(request: ChangePasswordSchema, authorization: str = None):
    """Change user password (requires authentication)"""
    # Get current user
    current_user = get_current_user(authorization)
    user_id = current_user.get("user_id")
    
    success, message = AuthService.change_password(
        user_id,
        request.current_password,
        request.new_password,
        request.confirm_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": message}
    )


@router.get("/profile")
async def get_profile(authorization: str = None):
    """Get user profile (requires authentication)"""
    current_user = get_current_user(authorization)
    user_id = current_user.get("user_id")
    
    profile = AuthService.get_user_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=profile
    )


@router.post("/logout")
async def logout(authorization: str = None):
    """Logout user"""
    current_user = get_current_user(authorization)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logout successful"}
    )
