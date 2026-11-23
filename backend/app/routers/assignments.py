import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_student, require_faculty, get_current_user
from app.models.user import User
from app.schemas.academic import (
    AssignmentResponse, SubmissionResponse, SubmissionEvaluation,
    StudyMaterialResponse, AssignmentCreate, StudyMaterialCreate
)
from app.services import academic_service

router = APIRouter(prefix="/assignments", tags=["Assignments & Study Materials"])


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED, summary="Create assignment (Faculty)")
def create_assignment(
    class_subject_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    due_date: str = Form(..., description="ISO 8601 string or YYYY-MM-DDTHH:MM"),
    max_marks: float = Form(100.0),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Create a new assignment for an assigned class-subject with an optional attachment file.
    """
    faculty = current_user.faculty_profile

    try:
        clean_date_str = due_date.replace("Z", "+00:00")
        parsed_due_date = datetime.fromisoformat(clean_date_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid due date format: {e}")

    att_filename, att_path = None, None
    if file and file.filename:
        att_filename, att_path, _ = academic_service.save_upload_file(file, "assignments")

    create_data = AssignmentCreate(
        class_subject_id=class_subject_id,
        title=title,
        description=description,
        due_date=parsed_due_date,
        max_marks=max_marks
    )

    assignment = academic_service.create_assignment(
        db, faculty.id, create_data,
        attachment_filename=att_filename,
        attachment_path=att_path
    )
    return academic_service.format_assignment_response(db, assignment)


@router.get("/faculty", response_model=List[AssignmentResponse], summary="Get faculty assignments")
def get_faculty_assignments(
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve all assignments created for classes and subjects taught by this faculty member.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_faculty_assignments(db, faculty.id)


@router.get("/student", response_model=List[AssignmentResponse], summary="Get student assignments")
def get_student_assignments(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve assignments for the student's enrolled class, including personal submission status.
    """
    student = current_user.student_profile
    return academic_service.get_student_assignments(db, student.id)


@router.post("/{assignment_id}/submit", response_model=SubmissionResponse, summary="Submit assignment (Student)")
def submit_assignment(
    assignment_id: int,
    submission_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Submit an assignment with text response and/or an optional attachment file.
    """
    student = current_user.student_profile

    if not submission_text and not (file and file.filename):
        raise HTTPException(
            status_code=400,
            detail="Submission must include either text notes or a file attachment."
        )

    att_filename, att_path = None, None
    if file and file.filename:
        att_filename, att_path, _ = academic_service.save_upload_file(file, "submissions")

    sub = academic_service.submit_student_assignment(
        db=db,
        student_id=student.id,
        assignment_id=assignment_id,
        submission_text=submission_text,
        attachment_filename=att_filename,
        attachment_path=att_path
    )

    assignment = sub.assignment
    return SubmissionResponse(
        id=sub.id,
        assignment_id=assignment.id,
        assignment_title=assignment.title,
        student_id=sub.student_id,
        student_roll_number=student.roll_number,
        student_name=student.full_name,
        submission_text=sub.submission_text,
        attachment_filename=sub.attachment_filename,
        has_attachment=bool(sub.attachment_path),
        submitted_at=sub.submitted_at,
        status=sub.status,
        marks_obtained=sub.marks_obtained,
        max_marks=assignment.max_marks,
        feedback=sub.feedback,
        evaluated_at=sub.evaluated_at,
        evaluated_by_faculty_id=sub.evaluated_by_faculty_id
    )


@router.get("/{assignment_id}/submissions", response_model=List[SubmissionResponse], summary="Get assignment submissions (Faculty)")
def get_assignment_submissions(
    assignment_id: int,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve all submissions for a given assignment. Only accessible by assigned faculty.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_assignment_submissions_for_faculty(db, faculty.id, assignment_id)


@router.post("/submissions/{submission_id}/evaluate", response_model=SubmissionResponse, summary="Evaluate submission (Faculty)")
def evaluate_submission(
    submission_id: int,
    payload: SubmissionEvaluation,
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Enter marks and feedback for a student submission.
    """
    faculty = current_user.faculty_profile
    return academic_service.evaluate_submission(
        db, faculty.id, submission_id, payload.marks_obtained, payload.feedback
    )


# --- Study Materials Endpoints ---

@router.post("/materials", response_model=StudyMaterialResponse, status_code=status.HTTP_201_CREATED, summary="Upload study material (Faculty)")
def upload_study_material(
    class_subject_id: int = Form(...),
    title: str = Form(...),
    material_type: str = Form("DOCUMENT"),
    description: Optional[str] = Form(None),
    external_link: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Upload study materials (PDF, presentation, document, code, link) for an assigned class and subject.
    """
    faculty = current_user.faculty_profile

    att_filename, att_path, file_size = None, None, None
    if file and file.filename:
        att_filename, att_path, file_size = academic_service.save_upload_file(file, "materials")

    create_data = StudyMaterialCreate(
        class_subject_id=class_subject_id,
        title=title,
        description=description,
        material_type=material_type,
        external_link=external_link
    )

    mat = academic_service.create_study_material(
        db, faculty.id, create_data,
        file_filename=att_filename,
        file_path=att_path,
        file_size_bytes=file_size
    )
    return academic_service.format_material_response(mat)


@router.get("/materials/faculty", response_model=List[StudyMaterialResponse], summary="Get faculty study materials")
def get_faculty_study_materials(
    current_user: User = Depends(require_faculty),
    db: Session = Depends(get_db)
):
    """
    Retrieve study materials uploaded for classes taught by the authenticated faculty.
    """
    faculty = current_user.faculty_profile
    return academic_service.get_faculty_materials(db, faculty.id)


@router.get("/materials/student", response_model=List[StudyMaterialResponse], summary="Get student study materials")
def get_student_study_materials(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Retrieve study materials available for the student's enrolled class.
    """
    student = current_user.student_profile
    return academic_service.get_student_materials(db, student.id)


# --- Secure File Download ---

@router.get("/files/{subfolder}/{filename}", summary="Download secure attachment")
def download_file(
    subfolder: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    Secure file streaming for authenticated users.
    Validates folder isolation and prevents directory traversal.
    """
    if subfolder not in {"assignments", "submissions", "materials"}:
        raise HTTPException(status_code=400, detail="Invalid storage category.")

    # Guard against directory traversal
    clean_filename = os.path.basename(filename)
    if clean_filename != filename or ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename format.")

    target_path = os.path.join(academic_service.UPLOAD_DIR, subfolder, clean_filename)
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="File not found or has been removed.")

    # Provide original filename for download (strip UUID prefix)
    display_name = clean_filename
    if "_" in clean_filename:
        parts = clean_filename.split("_", 1)
        if len(parts[0]) == 32:  # uuid hex length
            display_name = parts[1]

    return FileResponse(
        path=target_path,
        filename=display_name,
        media_type="application/octet-stream"
    )
