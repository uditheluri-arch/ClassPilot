from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

# --- Classes & Subjects ---

class SubjectResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ClassSubjectResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int
    subject: SubjectResponse

    model_config = ConfigDict(from_attributes=True)


class AcademicClassResponse(BaseModel):
    id: int
    name: str
    section: Optional[str] = "A"
    description: Optional[str] = None
    student_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class AcademicClassDetailResponse(AcademicClassResponse):
    subjects: List[SubjectResponse] = []


class FacultyAssignmentDetail(BaseModel):
    id: int
    class_subject_id: int
    class_id: int
    class_name: str
    section: Optional[str] = "A"
    subject_id: int
    subject_code: str
    subject_name: str
    assigned_date: datetime


# --- Student Management ---

class StudentRosterItem(BaseModel):
    id: int
    user_id: int
    roll_number: str
    full_name: str
    email: Optional[str] = None
    class_id: Optional[int] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


# --- Examination Management ---

class ExamCreate(BaseModel):
    class_subject_id: int
    name: str = Field(..., min_length=2, max_length=150)
    exam_type: str = Field(default="UNIT_TEST", max_length=50)
    exam_date: datetime
    start_time: Optional[str] = Field(default=None, max_length=20)
    duration_minutes: int = Field(default=90, ge=10, le=360)
    max_marks: float = Field(default=100.0, gt=0)
    passing_marks: float = Field(default=40.0, ge=0)
    instructions: Optional[str] = None


class ExamResponse(BaseModel):
    id: int
    class_subject_id: int
    class_id: int
    class_name: str
    section: Optional[str] = "A"
    subject_id: int
    subject_code: str
    subject_name: str
    created_by_faculty_id: int
    created_by_name: Optional[str] = None
    name: str
    exam_type: str
    exam_date: datetime
    start_time: Optional[str] = None
    duration_minutes: int
    max_marks: float
    passing_marks: float
    is_published: bool
    instructions: Optional[str] = None
    created_at: datetime
    marks_entered_count: Optional[int] = 0
    total_students: Optional[int] = 0


class ExamMarkEntry(BaseModel):
    student_id: int
    marks_obtained: float = Field(..., ge=0)
    remarks: Optional[str] = Field(default=None, max_length=255)


class ExamMarksBatchRequest(BaseModel):
    marks: List[ExamMarkEntry]


class ExamMarkResponse(BaseModel):
    id: int
    examination_id: int
    student_id: int
    student_roll_number: str
    student_name: str
    marks_obtained: float
    remarks: Optional[str] = None
    max_marks: float
    passing_marks: float
    is_passed: bool
    is_published: bool


class StudentExamResultResponse(BaseModel):
    examination_id: int
    exam_name: str
    exam_type: str
    exam_date: datetime
    class_name: str
    subject_code: str
    subject_name: str
    marks_obtained: float
    max_marks: float
    passing_marks: float
    percentage: float
    is_passed: bool
    remarks: Optional[str] = None


# --- Assignments & Submissions ---

class AssignmentCreate(BaseModel):
    class_subject_id: int
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    due_date: datetime
    max_marks: Optional[float] = Field(default=100.0, gt=0)


class AssignmentResponse(BaseModel):
    id: int
    class_subject_id: int
    class_id: int
    class_name: str
    section: Optional[str] = "A"
    subject_id: int
    subject_code: str
    subject_name: str
    created_by_faculty_id: int
    created_by_name: Optional[str] = None
    title: str
    description: str
    due_date: datetime
    max_marks: Optional[float] = 100.0
    attachment_filename: Optional[str] = None
    has_attachment: bool = False
    created_at: datetime
    total_submissions: Optional[int] = 0
    total_students: Optional[int] = 0
    # For student context
    submission_status: Optional[str] = None
    student_submission: Optional[dict] = None


class SubmissionCreate(BaseModel):
    submission_text: Optional[str] = None


class SubmissionEvaluation(BaseModel):
    marks_obtained: float = Field(..., ge=0)
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    assignment_title: str
    student_id: int
    student_roll_number: str
    student_name: str
    submission_text: Optional[str] = None
    attachment_filename: Optional[str] = None
    has_attachment: bool = False
    submitted_at: datetime
    status: str
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    feedback: Optional[str] = None
    evaluated_at: Optional[datetime] = None
    evaluated_by_faculty_id: Optional[int] = None


# --- Study Materials ---

class StudyMaterialCreate(BaseModel):
    class_subject_id: int
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    material_type: str = Field(default="DOCUMENT", max_length=50)
    external_link: Optional[str] = Field(default=None, max_length=500)


class StudyMaterialResponse(BaseModel):
    id: int
    class_subject_id: int
    class_id: int
    class_name: str
    section: Optional[str] = "A"
    subject_id: int
    subject_code: str
    subject_name: str
    uploaded_by_faculty_id: int
    uploaded_by_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    material_type: str
    file_filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    external_link: Optional[str] = None
    created_at: datetime
