from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, Student, Faculty, UserRole
from app.schemas.user import LoginRequest, TokenResponse, UserProfileResponse
from app.core.security import verify_password, create_access_token

class AuthService:
    @staticmethod
    def authenticate_user(
        db: Session,
        login_data: LoginRequest
    ) -> Tuple[User, str, str]:
        """
        Authenticate a user by role and identifier (roll number for student,
        employee ID or email for faculty).
        Returns (user, full_name, identifier).
        """
        identifier = login_data.identifier.strip()
        role_hint = login_data.role.strip().upper() if login_data.role else None

        user: Optional[User] = None
        full_name: str = ""
        user_identifier: str = ""

        if role_hint == UserRole.STUDENT:
            student = db.query(Student).filter(
                func.lower(Student.roll_number) == func.lower(identifier)
            ).first()
            if student and student.user and student.user.role == UserRole.STUDENT:
                user = student.user
                full_name = student.full_name
                user_identifier = student.roll_number

        elif role_hint == UserRole.FACULTY:
            # Check by employee ID
            faculty = db.query(Faculty).filter(
                func.lower(Faculty.employee_id) == func.lower(identifier)
            ).first()
            if faculty and faculty.user and faculty.user.role == UserRole.FACULTY:
                user = faculty.user
                full_name = faculty.full_name
                user_identifier = faculty.employee_id
            else:
                # Check by faculty email
                user_by_email = db.query(User).filter(
                    func.lower(User.email) == func.lower(identifier),
                    User.role == UserRole.FACULTY
                ).first()
                if user_by_email and user_by_email.faculty_profile:
                    user = user_by_email
                    full_name = user_by_email.faculty_profile.full_name
                    user_identifier = user_by_email.faculty_profile.employee_id

        else:
            # No role hint: try student roll_number first
            student = db.query(Student).filter(
                func.lower(Student.roll_number) == func.lower(identifier)
            ).first()
            if student and student.user and student.user.role == UserRole.STUDENT:
                user = student.user
                full_name = student.full_name
                user_identifier = student.roll_number
            else:
                # Try faculty employee ID
                faculty = db.query(Faculty).filter(
                    func.lower(Faculty.employee_id) == func.lower(identifier)
                ).first()
                if faculty and faculty.user and faculty.user.role == UserRole.FACULTY:
                    user = faculty.user
                    full_name = faculty.full_name
                    user_identifier = faculty.employee_id
                else:
                    # Try faculty email
                    user_by_email = db.query(User).filter(
                        func.lower(User.email) == func.lower(identifier),
                        User.role == UserRole.FACULTY
                    ).first()
                    if user_by_email and user_by_email.faculty_profile:
                        user = user_by_email
                        full_name = user_by_email.faculty_profile.full_name
                        user_identifier = user_by_email.faculty_profile.employee_id

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials: No active account matching the provided identifier",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials: Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Please contact administration.",
            )

        return user, full_name, user_identifier

    @staticmethod
    def create_login_response(user: User, full_name: str, identifier: str) -> TokenResponse:
        token = create_access_token(subject=user.id, role=user.role.value)
        profile = UserProfileResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.value,
            is_active=user.is_active,
            full_name=full_name,
            identifier=identifier,
            created_at=user.created_at
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            role=user.role.value,
            user=profile
        )

    @staticmethod
    def get_user_profile_response(user: User) -> UserProfileResponse:
        if user.role == UserRole.STUDENT and user.student_profile:
            full_name = user.student_profile.full_name
            identifier = user.student_profile.roll_number
        elif user.role == UserRole.FACULTY and user.faculty_profile:
            full_name = user.faculty_profile.full_name
            identifier = user.faculty_profile.employee_id
        else:
            full_name = user.username
            identifier = user.username

        return UserProfileResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.value,
            is_active=user.is_active,
            full_name=full_name,
            identifier=identifier,
            created_at=user.created_at
        )
