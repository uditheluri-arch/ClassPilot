from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class AcademicClass(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    section = Column(String(20), nullable=True, default="A")
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    students = relationship("Student", back_populates="academic_class")
    class_subjects = relationship("ClassSubject", back_populates="academic_class", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_subjects = relationship("ClassSubject", back_populates="subject", cascade="all, delete-orphan")


class ClassSubject(Base):
    __tablename__ = "class_subjects"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("class_id", "subject_id", name="uq_class_subject"),
    )

    academic_class = relationship("AcademicClass", back_populates="class_subjects")
    subject = relationship("Subject", back_populates="class_subjects")
    faculty_assignments = relationship("FacultyAssignment", back_populates="class_subject", cascade="all, delete-orphan")
    examinations = relationship("Examination", back_populates="class_subject", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="class_subject", cascade="all, delete-orphan")
    study_materials = relationship("StudyMaterial", back_populates="class_subject", cascade="all, delete-orphan")


class FacultyAssignment(Base):
    __tablename__ = "faculty_assignments"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("faculty_id", "class_subject_id", name="uq_faculty_class_subject"),
    )

    faculty = relationship("Faculty", back_populates="teaching_assignments")
    class_subject = relationship("ClassSubject", back_populates="faculty_assignments")


class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    exam_type = Column(String(50), nullable=False, default="UNIT_TEST")
    exam_date = Column(DateTime(timezone=True), nullable=False)
    start_time = Column(String(20), nullable=True)
    duration_minutes = Column(Integer, default=90, nullable=False)
    max_marks = Column(Float, default=100.0, nullable=False)
    passing_marks = Column(Float, default=40.0, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_subject = relationship("ClassSubject", back_populates="examinations")
    created_by_faculty = relationship("Faculty", back_populates="created_examinations")
    marks = relationship("ExamMark", back_populates="examination", cascade="all, delete-orphan")


class ExamMark(Base):
    __tablename__ = "exam_marks"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    marks_obtained = Column(Float, nullable=False)
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("examination_id", "student_id", name="uq_exam_student_marks"),
    )

    examination = relationship("Examination", back_populates="marks")
    student = relationship("Student", back_populates="exam_marks")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    max_marks = Column(Float, default=100.0, nullable=True)
    attachment_filename = Column(String(255), nullable=True)
    attachment_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_subject = relationship("ClassSubject", back_populates="assignments")
    created_by_faculty = relationship("Faculty", back_populates="created_assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_text = Column(Text, nullable=True)
    attachment_filename = Column(String(255), nullable=True)
    attachment_path = Column(String(500), nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(String(30), default="SUBMITTED", nullable=False)
    marks_obtained = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), nullable=True)
    evaluated_by_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        UniqueConstraint("assignment_id", "student_id", name="uq_assignment_student_submission"),
    )

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")
    evaluator = relationship("Faculty", foreign_keys=[evaluated_by_faculty_id])


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    material_type = Column(String(50), default="DOCUMENT", nullable=False)
    file_filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    external_link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_subject = relationship("ClassSubject", back_populates="study_materials")
    uploaded_by_faculty = relationship("Faculty", back_populates="uploaded_materials")
