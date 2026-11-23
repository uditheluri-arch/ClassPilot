import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    student_profile = relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    faculty_profile = relationship(
        "Faculty",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="SET NULL"), nullable=True, index=True)
    roll_number = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)

    user = relationship("User", back_populates="student_profile")
    academic_class = relationship("AcademicClass", back_populates="students")
    exam_marks = relationship("ExamMark", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("AssignmentSubmission", back_populates="student", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)

    user = relationship("User", back_populates="faculty_profile")
    teaching_assignments = relationship("FacultyAssignment", back_populates="faculty", cascade="all, delete-orphan")
    created_examinations = relationship("Examination", back_populates="created_by_faculty", cascade="all, delete-orphan")
    created_assignments = relationship("Assignment", back_populates="created_by_faculty", cascade="all, delete-orphan")
    uploaded_materials = relationship("StudyMaterial", back_populates="uploaded_by_faculty", cascade="all, delete-orphan")
