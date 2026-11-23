from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import require_student, require_faculty
from app.models.user import User
from app.schemas.academic import (
    ExamCreate, ExamResponse, ExamMarkResponse, ExamMarksBatchRequest,
    StudentExamResultResponse
)
from app.services import academic_service

router = APIRouter(prefix="/exams", tags=["Examination Management"])


class PublishToggleRequest(BaseModel):
    is_published: bool


@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED, summary="Create examination (Faculty)")
def create_exam(
    payload: ExamCreate,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Create a new examination for an assigned class-subject combination.
    """
    faculty = current_user.faculty_profile
    exam = academic_service.create_examination(db, faculty.id, payload)
    return academic_service.format_exam_response(db, exam)


@router.get("/faculty", response_model=List[ExamResponse], summary="Get faculty examinations")
def get_faculty_exams(
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve all examinations for classes and subjects taught by the faculty member.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_faculty_examinations(db, faculty.id)


@router.get("/student", response_model=List[ExamResponse], summary="Get student examinations schedule")
def get_student_exams(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve examination schedules for the student's enrolled class.
    """
    student = current_user.student_profile
    return academic_service.get_student_examinations(db, student.id)


@router.get("/{exam_id}/marks", response_model=List[ExamMarkResponse], summary="Get student marks for examination (Faculty)")
def get_exam_marks(
    exam_id: int,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve the roster of students and their marks for a specific examination.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_exam_marks_for_faculty(db, faculty.id, exam_id)


@router.post("/{exam_id}/marks", response_model=List[ExamMarkResponse], summary="Enter or update marks (Faculty)")
def submit_exam_marks(
    exam_id: int,
    payload: ExamMarksBatchRequest,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Enter or update student marks for a specific examination.
    Validates marks are between 0 and max_marks, and that students belong to the class.
    """
    faculty = current_user.faculty_profile
    return academic_service.enter_or_update_exam_marks(db, faculty.id, exam_id, payload.marks)


@router.patch("/{exam_id}/publish", response_model=ExamResponse, summary="Publish or unpublish exam results (Faculty)")
def toggle_publish(
    exam_id: int,
    payload: PublishToggleRequest,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Publish or unpublish results for an examination.
    Published results are immediately visible to students.
    """
    faculty = current_user.faculty_profile
    return academic_service.toggle_publish_exam(db, faculty.id, exam_id, payload.is_published)


@router.get("/my-results", response_model=List[StudentExamResultResponse], summary="Get published results (Student)")
def get_my_results(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve all published examination marks and performance metrics for the authenticated student.
    """
    student = current_user.student_profile
    return academic_service.get_student_results(db, student.id)
