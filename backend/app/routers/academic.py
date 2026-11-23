from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import require_student, require_faculty, get_current_user
from app.models.user import User
from app.schemas.academic import (
    AcademicClassResponse, FacultyAssignmentDetail,
    StudentRosterItem
)
from app.services import academic_service

router = APIRouter(prefix="/academic", tags=["Academic Structure & Students"])


@router.get("/classes", response_model=List[AcademicClassResponse], summary="Get assigned classes (Faculty)")
def get_faculty_classes(
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve all academic classes assigned to the authenticated faculty member.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_classes_for_faculty(db, faculty.id)


@router.get("/classes/{class_id}/students", response_model=List[StudentRosterItem], summary="Get class student roster")
def get_class_students(
    class_id: int,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve the student roster for an assigned class.
    Only accessible if the faculty teaches at least one subject in that class.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_students_in_class(db, class_id, faculty.id)


@router.get("/students/search", response_model=List[StudentRosterItem], summary="Search students (Faculty)")
def search_students(
    q: str = Query(..., min_length=1, description="Roll number or student name search query"),
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Search students by roll number or name within the faculty's assigned classes.
    """
    faculty = current_user.faculty_profile
    return academic_service.search_students_for_faculty(db, q, faculty.id)


@router.get("/teaching-assignments", response_model=List[FacultyAssignmentDetail], summary="Get faculty teaching assignments")
def get_teaching_assignments(
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve class-subject pairs that the authenticated faculty is assigned to teach.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_faculty_teaching_assignments(db, faculty.id)


@router.get("/my-class", summary="Get student enrolled class details")
def get_student_my_class(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve the enrolled class details, subjects, and classmates for the authenticated student.
    """
    student = current_user.student_profile
    details = academic_service.get_student_class_details(db, student.id)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not enrolled in any academic class. Please contact administration."
        )
    return details


@router.get("/my-classmates", response_model=List[StudentRosterItem], summary="Get student classmates roster")
def get_student_classmates(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve the roster of classmates in the student's enrolled class.
    """
    student = current_user.student_profile
    return academic_service.get_student_classmates(db, student.id)
