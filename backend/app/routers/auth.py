from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserProfileResponse, MessageResponse
from app.services.auth_service import AuthService
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse, summary="Authenticate student or faculty")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate a student or faculty member.
    - Student: Identifier is Roll Number.
    - Faculty: Identifier is Employee ID or Email.
    Returns signed JWT access token and user profile.
    """
    user, full_name, identifier = AuthService.authenticate_user(db, login_data)
    return AuthService.create_login_response(user, full_name, identifier)

@router.get("/me", response_model=UserProfileResponse, summary="Get current authenticated user profile")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Returns basic profile and role of the currently authenticated user.
    """
    return AuthService.get_user_profile_response(current_user)

@router.post("/logout", response_model=MessageResponse, summary="Logout user session")
def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Client-side token disposal endpoint.
    Notifies that session has been terminated.
    """
    return MessageResponse(message="Successfully logged out from ClassPilot")
