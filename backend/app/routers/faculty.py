from fastapi import APIRouter, Depends
from app.core.deps import require_faculty
from app.models.user import User
from app.schemas.user import FacultyProfileResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.get("/profile", response_model=FacultyProfileResponse, summary="Get faculty profile")
def get_faculty_profile(
    current_faculty: User = Depends(require_faculty)
):
    """
    Retrieve full faculty profile for the authenticated faculty member.
    Strictly forbidden for student accounts.
    """
    profile = current_faculty.faculty_profile
    return FacultyProfileResponse(
        id=profile.id,
        user_id=current_faculty.id,
        employee_id=profile.employee_id,
        full_name=profile.full_name,
        username=current_faculty.username,
        email=current_faculty.email,
        role=current_faculty.role.value,
        is_active=current_faculty.is_active,
        created_at=current_faculty.created_at
    )
