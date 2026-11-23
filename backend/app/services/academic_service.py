import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from app.models.user import User, Student, Faculty, UserRole
from app.models.academic import (
    AcademicClass, Subject, ClassSubject, FacultyAssignment,
    Examination, ExamMark, Assignment, AssignmentSubmission, StudyMaterial
)
from app.schemas.academic import (
    ExamCreate, ExamMarkEntry, AssignmentCreate, StudyMaterialCreate,
    FacultyAssignmentDetail, StudentRosterItem, ExamResponse,
    ExamMarkResponse, StudentExamResultResponse, AssignmentResponse,
    SubmissionResponse, StudyMaterialResponse
)

# Upload directory configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
    ".png", ".jpg", ".jpeg", ".gif", ".zip", ".tar.gz",
    ".py", ".java", ".cpp", ".c", ".html", ".css", ".js"
}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def ensure_upload_dirs():
    for sub in ["assignments", "submissions", "materials"]:
        path = os.path.join(UPLOAD_DIR, sub)
        os.makedirs(path, exist_ok=True)


ensure_upload_dirs()


def save_upload_file(file: UploadFile, subfolder: str) -> tuple[str, str, int]:
    """
    Saves an uploaded file safely.
    Returns (original_filename, stored_relative_path, file_size).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

    original_filename = os.path.basename(file.filename)
    _, ext = os.path.splitext(original_filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' is not permitted. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Sanitize and unique filename
    unique_name = f"{uuid.uuid4().hex}_{original_filename}"
    subfolder_path = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(subfolder_path, exist_ok=True)
    destination_path = os.path.join(subfolder_path, unique_name)

    file_size = 0
    with open(destination_path, "wb") as buffer:
        while chunk := file.file.read(1024 * 64):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                buffer.close()
                if os.path.exists(destination_path):
                    os.remove(destination_path)
                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE // (1024 * 1024)} MB."
                )
            buffer.write(chunk)

    rel_path = os.path.join(subfolder, unique_name).replace("\\", "/")
    return original_filename, rel_path, file_size


# --- Entity Lookups & Permissions ---

def get_student_profile(db: Session, user_id: int) -> Student:
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")
    return student


def get_faculty_profile(db: Session, user_id: int) -> Faculty:
    faculty = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty profile not found.")
    return faculty


def get_faculty_assigned_class_subject_ids(db: Session, faculty_id: int) -> List[int]:
    assignments = db.query(FacultyAssignment.class_subject_id).filter(
        FacultyAssignment.faculty_id == faculty_id
    ).all()
    return [a[0] for a in assignments]


def get_faculty_assigned_class_ids(db: Session, faculty_id: int) -> List[int]:
    rows = (
        db.query(ClassSubject.class_id)
        .join(FacultyAssignment, FacultyAssignment.class_subject_id == ClassSubject.id)
        .filter(FacultyAssignment.faculty_id == faculty_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


def verify_faculty_teaches_class_subject(db: Session, faculty_id: int, class_subject_id: int) -> ClassSubject:
    cs = (
        db.query(ClassSubject)
        .options(joinedload(ClassSubject.academic_class), joinedload(ClassSubject.subject))
        .filter(ClassSubject.id == class_subject_id)
        .first()
    )
    if not cs:
        raise HTTPException(status_code=404, detail="Class-subject mapping not found.")

    is_assigned = (
        db.query(FacultyAssignment)
        .filter(
            FacultyAssignment.faculty_id == faculty_id,
            FacultyAssignment.class_subject_id == class_subject_id
        )
        .first()
    )
    if not is_assigned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage this class and subject combination."
        )
    return cs


def verify_faculty_teaches_class(db: Session, faculty_id: int, class_id: int):
    assigned_class_ids = get_faculty_assigned_class_ids(db, faculty_id)
    if class_id not in assigned_class_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to students from unassigned classes."
        )


# --- Module 1: Academic Structure & Student Management ---

def get_classes_for_faculty(db: Session, faculty_id: int):
    """Returns only classes that the faculty is assigned to teach."""
    class_ids = get_faculty_assigned_class_ids(db, faculty_id)
    if not class_ids:
        return []
    classes = db.query(AcademicClass).filter(AcademicClass.id.in_(class_ids)).order_by(AcademicClass.name).all()
    result = []
    for c in classes:
        student_count = db.query(Student).filter(Student.class_id == c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "section": c.section,
            "description": c.description,
            "student_count": student_count
        })
    return result


def get_faculty_teaching_assignments(db: Session, faculty_id: int) -> List[FacultyAssignmentDetail]:
    assignments = (
        db.query(FacultyAssignment)
        .join(ClassSubject, FacultyAssignment.class_subject_id == ClassSubject.id)
        .join(AcademicClass, ClassSubject.class_id == AcademicClass.id)
        .join(Subject, ClassSubject.subject_id == Subject.id)
        .filter(FacultyAssignment.faculty_id == faculty_id)
        .order_by(AcademicClass.name, Subject.name)
        .all()
    )
    result = []
    for fa in assignments:
        cs = fa.class_subject
        result.append(FacultyAssignmentDetail(
            id=fa.id,
            class_subject_id=cs.id,
            class_id=cs.class_id,
            class_name=cs.academic_class.name,
            section=cs.academic_class.section,
            subject_id=cs.subject_id,
            subject_code=cs.subject.code,
            subject_name=cs.subject.name,
            assigned_date=fa.assigned_date
        ))
    return result


def get_students_in_class(db: Session, class_id: int, faculty_id: int) -> List[StudentRosterItem]:
    verify_faculty_teaches_class(db, faculty_id, class_id)
    students = (
        db.query(Student)
        .join(User, Student.user_id == User.id)
        .join(AcademicClass, Student.class_id == AcademicClass.id)
        .filter(Student.class_id == class_id)
        .order_by(Student.roll_number)
        .all()
    )
    return [
        StudentRosterItem(
            id=s.id,
            user_id=s.user_id,
            roll_number=s.roll_number,
            full_name=s.full_name,
            email=s.user.email if s.user else None,
            class_id=s.class_id,
            class_name=s.academic_class.name if s.academic_class else None,
            section=s.academic_class.section if s.academic_class else None,
            is_active=s.user.is_active if s.user else True
        )
        for s in students
    ]


def search_students_for_faculty(db: Session, query: str, faculty_id: int) -> List[StudentRosterItem]:
    assigned_class_ids = get_faculty_assigned_class_ids(db, faculty_id)
    if not assigned_class_ids:
        return []

    q = f"%{query.strip()}%"
    students = (
        db.query(Student)
        .join(User, Student.user_id == User.id)
        .outerjoin(AcademicClass, Student.class_id == AcademicClass.id)
        .filter(
            Student.class_id.in_(assigned_class_ids),
            or_(
                Student.roll_number.ilike(q),
                Student.full_name.ilike(q)
            )
        )
        .order_by(Student.roll_number)
        .all()
    )
    return [
        StudentRosterItem(
            id=s.id,
            user_id=s.user_id,
            roll_number=s.roll_number,
            full_name=s.full_name,
            email=s.user.email if s.user else None,
            class_id=s.class_id,
            class_name=s.academic_class.name if s.academic_class else None,
            section=s.academic_class.section if s.academic_class else None,
            is_active=s.user.is_active if s.user else True
        )
        for s in students
    ]


def get_student_class_details(db: Session, student_id: int):
    student = (
        db.query(Student)
        .options(joinedload(Student.academic_class))
        .filter(Student.id == student_id)
        .first()
    )
    if not student or not student.academic_class:
        return None

    # Get class subjects
    class_subjects = (
        db.query(ClassSubject)
        .options(joinedload(ClassSubject.subject))
        .filter(ClassSubject.class_id == student.class_id)
        .all()
    )
    subjects_data = [
        {
            "class_subject_id": cs.id,
            "subject_id": cs.subject.id,
            "code": cs.subject.code,
            "name": cs.subject.name,
            "description": cs.subject.description
        }
        for cs in class_subjects
    ]

    # Student count
    student_count = db.query(Student).filter(Student.class_id == student.class_id).count()

    return {
        "class_id": student.academic_class.id,
        "name": student.academic_class.name,
        "section": student.academic_class.section,
        "description": student.academic_class.description,
        "student_count": student_count,
        "subjects": subjects_data
    }


def get_student_classmates(db: Session, student_id: int) -> List[StudentRosterItem]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.class_id:
        return []

    students = (
        db.query(Student)
        .join(User, Student.user_id == User.id)
        .join(AcademicClass, Student.class_id == AcademicClass.id)
        .filter(Student.class_id == student.class_id)
        .order_by(Student.roll_number)
        .all()
    )
    return [
        StudentRosterItem(
            id=s.id,
            user_id=s.user_id,
            roll_number=s.roll_number,
            full_name=s.full_name,
            email=s.user.email if s.user else None,
            class_id=s.class_id,
            class_name=s.academic_class.name if s.academic_class else None,
            section=s.academic_class.section if s.academic_class else None,
            is_active=s.user.is_active if s.user else True
        )
        for s in students
    ]


# --- Module 2: Examination Management ---

def create_examination(db: Session, faculty_id: int, data: ExamCreate) -> Examination:
    verify_faculty_teaches_class_subject(db, faculty_id, data.class_subject_id)
    if data.passing_marks > data.max_marks:
        raise HTTPException(
            status_code=400,
            detail="Passing marks cannot exceed maximum marks."
        )

    exam = Examination(
        class_subject_id=data.class_subject_id,
        created_by_faculty_id=faculty_id,
        name=data.name.strip(),
        exam_type=data.exam_type.strip(),
        exam_date=data.exam_date,
        start_time=data.start_time,
        duration_minutes=data.duration_minutes,
        max_marks=data.max_marks,
        passing_marks=data.passing_marks,
        instructions=data.instructions,
        is_published=False
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


def format_exam_response(db: Session, exam: Examination) -> ExamResponse:
    cs = exam.class_subject
    marks_entered = db.query(ExamMark).filter(ExamMark.examination_id == exam.id).count()
    total_students = db.query(Student).filter(Student.class_id == cs.class_id).count()
    return ExamResponse(
        id=exam.id,
        class_subject_id=cs.id,
        class_id=cs.class_id,
        class_name=cs.academic_class.name,
        section=cs.academic_class.section,
        subject_id=cs.subject.id,
        subject_code=cs.subject.code,
        subject_name=cs.subject.name,
        created_by_faculty_id=exam.created_by_faculty_id,
        created_by_name=exam.created_by_faculty.full_name if exam.created_by_faculty else None,
        name=exam.name,
        exam_type=exam.exam_type,
        exam_date=exam.exam_date,
        start_time=exam.start_time,
        duration_minutes=exam.duration_minutes,
        max_marks=exam.max_marks,
        passing_marks=exam.passing_marks,
        is_published=exam.is_published,
        instructions=exam.instructions,
        created_at=exam.created_at,
        marks_entered_count=marks_entered,
        total_students=total_students
    )


def get_faculty_examinations(db: Session, faculty_id: int) -> List[ExamResponse]:
    cs_ids = get_faculty_assigned_class_subject_ids(db, faculty_id)
    if not cs_ids:
        return []
    exams = (
        db.query(Examination)
        .options(
            joinedload(Examination.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(Examination.class_subject).joinedload(ClassSubject.subject),
            joinedload(Examination.created_by_faculty)
        )
        .filter(Examination.class_subject_id.in_(cs_ids))
        .order_by(Examination.exam_date.desc())
        .all()
    )
    return [format_exam_response(db, e) for e in exams]


def get_student_examinations(db: Session, student_id: int) -> List[ExamResponse]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.class_id:
        return []

    # Get class subjects for student's class
    cs_ids = [cs.id for cs in db.query(ClassSubject.id).filter(ClassSubject.class_id == student.class_id).all()]
    if not cs_ids:
        return []

    exams = (
        db.query(Examination)
        .options(
            joinedload(Examination.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(Examination.class_subject).joinedload(ClassSubject.subject),
            joinedload(Examination.created_by_faculty)
        )
        .filter(Examination.class_subject_id.in_(cs_ids))
        .order_by(Examination.exam_date.asc())
        .all()
    )
    return [format_exam_response(db, e) for e in exams]


def get_exam_marks_for_faculty(db: Session, faculty_id: int, exam_id: int) -> List[ExamMarkResponse]:
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found.")
    verify_faculty_teaches_class_subject(db, faculty_id, exam.class_subject_id)

    # Get all students in the exam's class
    students = (
        db.query(Student)
        .filter(Student.class_id == exam.class_subject.class_id)
        .order_by(Student.roll_number)
        .all()
    )

    marks_map = {
        m.student_id: m
        for m in db.query(ExamMark).filter(ExamMark.examination_id == exam.id).all()
    }

    result = []
    for s in students:
        mark = marks_map.get(s.id)
        marks_obtained = mark.marks_obtained if mark else 0.0
        remarks = mark.remarks if mark else None
        mark_id = mark.id if mark else 0
        is_passed = marks_obtained >= exam.passing_marks if mark else False

        result.append(ExamMarkResponse(
            id=mark_id,
            examination_id=exam.id,
            student_id=s.id,
            student_roll_number=s.roll_number,
            student_name=s.full_name,
            marks_obtained=marks_obtained,
            remarks=remarks,
            max_marks=exam.max_marks,
            passing_marks=exam.passing_marks,
            is_passed=is_passed,
            is_published=exam.is_published
        ))
    return result


def enter_or_update_exam_marks(
    db: Session, faculty_id: int, exam_id: int, marks_data: List[ExamMarkEntry]
) -> List[ExamMarkResponse]:
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found.")
    verify_faculty_teaches_class_subject(db, faculty_id, exam.class_subject_id)

    class_student_ids = {
        s.id for s in db.query(Student.id).filter(Student.class_id == exam.class_subject.class_id).all()
    }

    for entry in marks_data:
        if entry.student_id not in class_student_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Student ID {entry.student_id} does not belong to the class for this examination."
            )
        if entry.marks_obtained < 0 or entry.marks_obtained > exam.max_marks:
            raise HTTPException(
                status_code=400,
                detail=f"Marks obtained ({entry.marks_obtained}) must be between 0 and maximum marks ({exam.max_marks})."
            )

        existing = (
            db.query(ExamMark)
            .filter(ExamMark.examination_id == exam.id, ExamMark.student_id == entry.student_id)
            .first()
        )
        if existing:
            existing.marks_obtained = entry.marks_obtained
            existing.remarks = entry.remarks
        else:
            new_mark = ExamMark(
                examination_id=exam.id,
                student_id=entry.student_id,
                marks_obtained=entry.marks_obtained,
                remarks=entry.remarks
            )
            db.add(new_mark)

    db.commit()
    return get_exam_marks_for_faculty(db, faculty_id, exam_id)


def toggle_publish_exam(db: Session, faculty_id: int, exam_id: int, is_published: bool) -> ExamResponse:
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found.")
    verify_faculty_teaches_class_subject(db, faculty_id, exam.class_subject_id)

    exam.is_published = is_published
    db.commit()
    db.refresh(exam)
    return format_exam_response(db, exam)


def get_student_results(db: Session, student_id: int) -> List[StudentExamResultResponse]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return []

    # Only return marks for published examinations
    marks = (
        db.query(ExamMark)
        .join(Examination, ExamMark.examination_id == Examination.id)
        .join(ClassSubject, Examination.class_subject_id == ClassSubject.id)
        .join(AcademicClass, ClassSubject.class_id == AcademicClass.id)
        .join(Subject, ClassSubject.subject_id == Subject.id)
        .filter(
            ExamMark.student_id == student_id,
            Examination.is_published == True
        )
        .order_by(Examination.exam_date.desc())
        .all()
    )

    results = []
    for m in marks:
        exam = m.examination
        cs = exam.class_subject
        max_m = exam.max_marks
        pct = round((m.marks_obtained / max_m * 100), 2) if max_m > 0 else 0.0
        results.append(StudentExamResultResponse(
            examination_id=exam.id,
            exam_name=exam.name,
            exam_type=exam.exam_type,
            exam_date=exam.exam_date,
            class_name=cs.academic_class.name,
            subject_code=cs.subject.code,
            subject_name=cs.subject.name,
            marks_obtained=m.marks_obtained,
            max_marks=exam.max_marks,
            passing_marks=exam.passing_marks,
            percentage=pct,
            is_passed=m.marks_obtained >= exam.passing_marks,
            remarks=m.remarks
        ))
    return results


# --- Module 3: Assignments & Study Materials ---

def create_assignment(
    db: Session, faculty_id: int, data: AssignmentCreate,
    attachment_filename: Optional[str] = None, attachment_path: Optional[str] = None
) -> Assignment:
    verify_faculty_teaches_class_subject(db, faculty_id, data.class_subject_id)

    assignment = Assignment(
        class_subject_id=data.class_subject_id,
        created_by_faculty_id=faculty_id,
        title=data.title.strip(),
        description=data.description.strip(),
        due_date=data.due_date,
        max_marks=data.max_marks or 100.0,
        attachment_filename=attachment_filename,
        attachment_path=attachment_path
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def format_assignment_response(
    db: Session, assignment: Assignment, student_id: Optional[int] = None
) -> AssignmentResponse:
    cs = assignment.class_subject
    submission_count = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment.id
    ).count()
    total_students = db.query(Student).filter(Student.class_id == cs.class_id).count()

    submission_status = "PENDING"
    student_submission_dict = None

    if student_id:
        sub = (
            db.query(AssignmentSubmission)
            .filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.student_id == student_id
            )
            .first()
        )
        if sub:
            submission_status = sub.status
            student_submission_dict = {
                "id": sub.id,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                "submission_text": sub.submission_text,
                "attachment_filename": sub.attachment_filename,
                "status": sub.status,
                "marks_obtained": sub.marks_obtained,
                "feedback": sub.feedback,
                "evaluated_at": sub.evaluated_at.isoformat() if sub.evaluated_at else None
            }

    return AssignmentResponse(
        id=assignment.id,
        class_subject_id=cs.id,
        class_id=cs.class_id,
        class_name=cs.academic_class.name,
        section=cs.academic_class.section,
        subject_id=cs.subject.id,
        subject_code=cs.subject.code,
        subject_name=cs.subject.name,
        created_by_faculty_id=assignment.created_by_faculty_id,
        created_by_name=assignment.created_by_faculty.full_name if assignment.created_by_faculty else None,
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        max_marks=assignment.max_marks,
        attachment_filename=assignment.attachment_filename,
        has_attachment=bool(assignment.attachment_path),
        created_at=assignment.created_at,
        total_submissions=submission_count,
        total_students=total_students,
        submission_status=submission_status,
        student_submission=student_submission_dict
    )


def get_faculty_assignments(db: Session, faculty_id: int) -> List[AssignmentResponse]:
    cs_ids = get_faculty_assigned_class_subject_ids(db, faculty_id)
    if not cs_ids:
        return []
    assignments = (
        db.query(Assignment)
        .options(
            joinedload(Assignment.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(Assignment.class_subject).joinedload(ClassSubject.subject),
            joinedload(Assignment.created_by_faculty)
        )
        .filter(Assignment.class_subject_id.in_(cs_ids))
        .order_by(Assignment.due_date.desc())
        .all()
    )
    return [format_assignment_response(db, a) for a in assignments]


def get_student_assignments(db: Session, student_id: int) -> List[AssignmentResponse]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.class_id:
        return []

    cs_ids = [cs.id for cs in db.query(ClassSubject.id).filter(ClassSubject.class_id == student.class_id).all()]
    if not cs_ids:
        return []

    assignments = (
        db.query(Assignment)
        .options(
            joinedload(Assignment.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(Assignment.class_subject).joinedload(ClassSubject.subject),
            joinedload(Assignment.created_by_faculty)
        )
        .filter(Assignment.class_subject_id.in_(cs_ids))
        .order_by(Assignment.due_date.asc())
        .all()
    )
    return [format_assignment_response(db, a, student_id=student_id) for a in assignments]


def submit_student_assignment(
    db: Session, student_id: int, assignment_id: int,
    submission_text: Optional[str] = None,
    attachment_filename: Optional[str] = None,
    attachment_path: Optional[str] = None
) -> AssignmentSubmission:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.class_id:
        raise HTTPException(status_code=400, detail="Student is not enrolled in any class.")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    if assignment.class_subject.class_id != student.class_id:
        raise HTTPException(status_code=403, detail="You can only submit assignments for your own class.")

    submission = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.student_id == student_id
        )
        .first()
    )

    if submission:
        # Re-submission / update
        if submission.status == "EVALUATED":
            raise HTTPException(status_code=400, detail="Cannot resubmit an assignment that has already been evaluated.")
        if submission_text is not None:
            submission.submission_text = submission_text
        if attachment_filename and attachment_path:
            submission.attachment_filename = attachment_filename
            submission.attachment_path = attachment_path
        submission.submitted_at = datetime.now()
        submission.status = "SUBMITTED"
    else:
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student_id,
            submission_text=submission_text,
            attachment_filename=attachment_filename,
            attachment_path=attachment_path,
            status="SUBMITTED"
        )
        db.add(submission)

    db.commit()
    db.refresh(submission)
    return submission


def get_assignment_submissions_for_faculty(
    db: Session, faculty_id: int, assignment_id: int
) -> List[SubmissionResponse]:
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    verify_faculty_teaches_class_subject(db, faculty_id, assignment.class_subject_id)

    submissions = (
        db.query(AssignmentSubmission)
        .options(joinedload(AssignmentSubmission.student), joinedload(AssignmentSubmission.assignment))
        .filter(AssignmentSubmission.assignment_id == assignment_id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .all()
    )
    result = []
    for s in submissions:
        result.append(SubmissionResponse(
            id=s.id,
            assignment_id=s.assignment_id,
            assignment_title=assignment.title,
            student_id=s.student_id,
            student_roll_number=s.student.roll_number,
            student_name=s.student.full_name,
            submission_text=s.submission_text,
            attachment_filename=s.attachment_filename,
            has_attachment=bool(s.attachment_path),
            submitted_at=s.submitted_at,
            status=s.status,
            marks_obtained=s.marks_obtained,
            max_marks=assignment.max_marks,
            feedback=s.feedback,
            evaluated_at=s.evaluated_at,
            evaluated_by_faculty_id=s.evaluated_by_faculty_id
        ))
    return result


def evaluate_submission(
    db: Session, faculty_id: int, submission_id: int, marks_obtained: float, feedback: Optional[str]
) -> SubmissionResponse:
    sub = (
        db.query(AssignmentSubmission)
        .options(
            joinedload(AssignmentSubmission.assignment),
            joinedload(AssignmentSubmission.student)
        )
        .filter(AssignmentSubmission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    assignment = sub.assignment
    verify_faculty_teaches_class_subject(db, faculty_id, assignment.class_subject_id)

    if marks_obtained < 0 or (assignment.max_marks and marks_obtained > assignment.max_marks):
        raise HTTPException(
            status_code=400,
            detail=f"Marks obtained must be between 0 and maximum marks ({assignment.max_marks})."
        )

    sub.marks_obtained = marks_obtained
    sub.feedback = feedback
    sub.evaluated_at = datetime.now()
    sub.evaluated_by_faculty_id = faculty_id
    sub.status = "EVALUATED"

    db.commit()
    db.refresh(sub)

    return SubmissionResponse(
        id=sub.id,
        assignment_id=assignment.id,
        assignment_title=assignment.title,
        student_id=sub.student_id,
        student_roll_number=sub.student.roll_number,
        student_name=sub.student.full_name,
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


def create_study_material(
    db: Session, faculty_id: int, data: StudyMaterialCreate,
    file_filename: Optional[str] = None, file_path: Optional[str] = None, file_size_bytes: Optional[int] = None
) -> StudyMaterial:
    verify_faculty_teaches_class_subject(db, faculty_id, data.class_subject_id)

    material = StudyMaterial(
        class_subject_id=data.class_subject_id,
        uploaded_by_faculty_id=faculty_id,
        title=data.title.strip(),
        description=data.description.strip() if data.description else None,
        material_type=data.material_type.strip(),
        file_filename=file_filename,
        file_path=file_path,
        file_size_bytes=file_size_bytes,
        external_link=data.external_link.strip() if data.external_link else None
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


def format_material_response(material: StudyMaterial) -> StudyMaterialResponse:
    cs = material.class_subject
    return StudyMaterialResponse(
        id=material.id,
        class_subject_id=cs.id,
        class_id=cs.class_id,
        class_name=cs.academic_class.name,
        section=cs.academic_class.section,
        subject_id=cs.subject.id,
        subject_code=cs.subject.code,
        subject_name=cs.subject.name,
        uploaded_by_faculty_id=material.uploaded_by_faculty_id,
        uploaded_by_name=material.uploaded_by_faculty.full_name if material.uploaded_by_faculty else None,
        title=material.title,
        description=material.description,
        material_type=material.material_type,
        file_filename=material.file_filename,
        file_size_bytes=material.file_size_bytes,
        external_link=material.external_link,
        created_at=material.created_at
    )


def get_faculty_materials(db: Session, faculty_id: int) -> List[StudyMaterialResponse]:
    cs_ids = get_faculty_assigned_class_subject_ids(db, faculty_id)
    if not cs_ids:
        return []
    materials = (
        db.query(StudyMaterial)
        .options(
            joinedload(StudyMaterial.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(StudyMaterial.class_subject).joinedload(ClassSubject.subject),
            joinedload(StudyMaterial.uploaded_by_faculty)
        )
        .filter(StudyMaterial.class_subject_id.in_(cs_ids))
        .order_by(StudyMaterial.created_at.desc())
        .all()
    )
    return [format_material_response(m) for m in materials]


def get_student_materials(db: Session, student_id: int) -> List[StudyMaterialResponse]:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student or not student.class_id:
        return []

    cs_ids = [cs.id for cs in db.query(ClassSubject.id).filter(ClassSubject.class_id == student.class_id).all()]
    if not cs_ids:
        return []

    materials = (
        db.query(StudyMaterial)
        .options(
            joinedload(StudyMaterial.class_subject).joinedload(ClassSubject.academic_class),
            joinedload(StudyMaterial.class_subject).joinedload(ClassSubject.subject),
            joinedload(StudyMaterial.uploaded_by_faculty)
        )
        .filter(StudyMaterial.class_subject_id.in_(cs_ids))
        .order_by(StudyMaterial.created_at.desc())
        .all()
    )
    return [format_material_response(m) for m in materials]
