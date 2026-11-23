from fastapi import APIRouter, Depends
from app.core.deps import require_student
from app.models.user import User
from app.schemas.user import StudentProfileResponse

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/profile", response_model=StudentProfileResponse, summary="Get student profile")
def get_student_profile(
    current_student: User = Depends(require_student)
):
    """
    Retrieve full student profile for the authenticated student.
    Strictly forbidden for faculty accounts.
    """
    profile = current_student.student_profile
    return StudentProfileResponse(
        id=profile.id,
        user_id=current_student.id,
        roll_number=profile.roll_number,
        full_name=profile.full_name,
        username=current_student.username,
        email=current_student.email,
        role=current_student.role.value,
        is_active=current_student.is_active,
        created_at=current_student.created_at
    )
