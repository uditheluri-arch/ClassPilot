"""
ClassPilot Database Seeder - Step 2: Complete Academic Management
Seeds demo accounts, classes, subjects, faculty assignments, exams, assignments, and study materials.
Idempotent and safe to run multiple times.
"""
import sys
import os
from datetime import datetime, timedelta

# Ensure backend root is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, Student, Faculty, UserRole
from app.models.academic import (
    AcademicClass, Subject, ClassSubject, FacultyAssignment,
    Examination, ExamMark, Assignment, AssignmentSubmission, StudyMaterial
)
from app.core.security import get_password_hash

def seed_database():
    print("🌱 Starting ClassPilot Step 2 database seeding...")
    db = SessionLocal()
    try:
        # =========================================================================
        # 1. ACADEMIC CLASSES
        # =========================================================================
        class_data = [
            {"name": "Class 8", "section": "A", "description": "Middle School - Grade 8 Section A"},
            {"name": "Class 9", "section": "A", "description": "High School - Grade 9 Section A"},
            {"name": "Class 10", "section": "A", "description": "Secondary School - Grade 10 Board Section A"},
        ]
        classes_map = {}
        for c in class_data:
            existing = db.query(AcademicClass).filter(AcademicClass.name == c["name"]).first()
            if not existing:
                existing = AcademicClass(name=c["name"], section=c["section"], description=c["description"])
                db.add(existing)
                db.flush()
                print(f"  + Created class: {c['name']}")
            else:
                existing.section = c["section"]
                existing.description = c["description"]
            classes_map[c["name"]] = existing

        # =========================================================================
        # 2. SUBJECTS
        # =========================================================================
        subject_data = [
            {"code": "MATH101", "name": "Mathematics", "description": "Algebra, Geometry, Trigonometry & Calculus fundamentals"},
            {"code": "SCI101", "name": "Science", "description": "Physics, Chemistry and Biology foundations"},
            {"code": "ENG101", "name": "English Language & Literature", "description": "Reading comprehension, grammar and creative writing"},
            {"code": "CS101", "name": "Computer Science", "description": "Python Programming, Data Structures and Computer Systems"},
            {"code": "SST101", "name": "Social Studies", "description": "History, Geography, Political Science and Economics"},
        ]
        subjects_map = {}
        for s in subject_data:
            existing = db.query(Subject).filter(Subject.code == s["code"]).first()
            if not existing:
                existing = Subject(code=s["code"], name=s["name"], description=s["description"])
                db.add(existing)
                db.flush()
                print(f"  + Created subject: {s['code']} - {s['name']}")
            else:
                existing.name = s["name"]
                existing.description = s["description"]
            subjects_map[s["code"]] = existing

        # =========================================================================
        # 3. CLASS-SUBJECT MAPPINGS
        # =========================================================================
        class_subject_rules = {
            "Class 10": ["MATH101", "SCI101", "ENG101", "CS101", "SST101"],
            "Class 9": ["MATH101", "SCI101", "ENG101", "CS101", "SST101"],
            "Class 8": ["MATH101", "SCI101", "ENG101", "SST101"],
        }
        class_subjects_map = {}  # key: (class_name, subject_code) -> ClassSubject
        for c_name, sub_codes in class_subject_rules.items():
            cls_obj = classes_map[c_name]
            for scode in sub_codes:
                sub_obj = subjects_map[scode]
                cs = db.query(ClassSubject).filter(
                    ClassSubject.class_id == cls_obj.id,
                    ClassSubject.subject_id == sub_obj.id
                ).first()
                if not cs:
                    cs = ClassSubject(class_id=cls_obj.id, subject_id=sub_obj.id)
                    db.add(cs)
                    db.flush()
                class_subjects_map[(c_name, scode)] = cs

        # =========================================================================
        # 4. STUDENTS
        # =========================================================================
        students_info = [
            {"roll": "STU001", "name": "Aarav Sharma", "username": "stu001", "email": "student@classpilot.demo", "pass": "Student@123", "class": "Class 10"},
            {"roll": "STU002", "name": "Diya Patel", "username": "stu002", "email": "diya.patel@classpilot.demo", "pass": "Student@123", "class": "Class 10"},
            {"roll": "STU003", "name": "Rohan Gupta", "username": "stu003", "email": "rohan.gupta@classpilot.demo", "pass": "Student@123", "class": "Class 10"},
            {"roll": "STU004", "name": "Ananya Verma", "username": "stu004", "email": "ananya.verma@classpilot.demo", "pass": "Student@123", "class": "Class 9"},
            {"roll": "STU005", "name": "Vikram Singh", "username": "stu005", "email": "vikram.singh@classpilot.demo", "pass": "Student@123", "class": "Class 8"},
        ]
        students_map = {}
        for s in students_info:
            cls_obj = classes_map[s["class"]]
            existing_student = db.query(Student).filter(Student.roll_number == s["roll"]).first()
            if existing_student:
                existing_student.full_name = s["name"]
                existing_student.class_id = cls_obj.id
                existing_student.user.password_hash = get_password_hash(s["pass"])
                existing_student.user.is_active = True
                students_map[s["roll"]] = existing_student
            else:
                user = db.query(User).filter(User.username == s["username"]).first()
                if not user:
                    user = User(
                        username=s["username"],
                        email=s["email"],
                        password_hash=get_password_hash(s["pass"]),
                        role=UserRole.STUDENT,
                        is_active=True
                    )
                    db.add(user)
                    db.flush()
                student = Student(
                    user_id=user.id,
                    roll_number=s["roll"],
                    full_name=s["name"],
                    class_id=cls_obj.id
                )
                db.add(student)
                db.flush()
                students_map[s["roll"]] = student
                print(f"  + Created student: {s['roll']} ({s['name']}) -> {s['class']}")

        # =========================================================================
        # 5. FACULTY
        # =========================================================================
        faculty_info = [
            {
                "emp_id": "FAC001",
                "name": "Dr. Sarah Jenkins",
                "username": "fac001",
                "email": "faculty@classpilot.demo",
                "pass": "Faculty@123",
                "assignments": [("Class 10", "MATH101"), ("Class 10", "CS101"), ("Class 9", "SCI101")]
            },
            {
                "emp_id": "FAC002",
                "name": "Prof. Rajesh Kumar",
                "username": "fac002",
                "email": "rajesh@classpilot.demo",
                "pass": "Faculty@123",
                "assignments": [("Class 8", "MATH101"), ("Class 10", "SCI101")]
            }
        ]
        faculties_map = {}
        for f in faculty_info:
            existing_fac = db.query(Faculty).filter(Faculty.employee_id == f["emp_id"]).first()
            if existing_fac:
                existing_fac.full_name = f["name"]
                existing_fac.user.email = f["email"]
                existing_fac.user.password_hash = get_password_hash(f["pass"])
                existing_fac.user.is_active = True
                faculties_map[f["emp_id"]] = existing_fac
            else:
                user = db.query(User).filter(User.username == f["username"]).first()
                if not user:
                    user = User(
                        username=f["username"],
                        email=f["email"],
                        password_hash=get_password_hash(f["pass"]),
                        role=UserRole.FACULTY,
                        is_active=True
                    )
                    db.add(user)
                    db.flush()
                fac = Faculty(
                    user_id=user.id,
                    employee_id=f["emp_id"],
                    full_name=f["name"]
                )
                db.add(fac)
                db.flush()
                faculties_map[f["emp_id"]] = fac
                print(f"  + Created faculty: {f['emp_id']} ({f['name']})")

            # Faculty Teaching Assignments
            fac_obj = faculties_map[f["emp_id"]]
            for c_name, scode in f["assignments"]:
                cs = class_subjects_map[(c_name, scode)]
                fa = db.query(FacultyAssignment).filter(
                    FacultyAssignment.faculty_id == fac_obj.id,
                    FacultyAssignment.class_subject_id == cs.id
                ).first()
                if not fa:
                    fa = FacultyAssignment(faculty_id=fac_obj.id, class_subject_id=cs.id)
                    db.add(fa)
                    db.flush()
                    print(f"    * Assigned {f['emp_id']} to {c_name} - {scode}")

        # =========================================================================
        # 6. EXAMINATIONS & MARKS
        # =========================================================================
        fac1 = faculties_map["FAC001"]
        cs_class10_cs = class_subjects_map[("Class 10", "CS101")]
        cs_class10_math = class_subjects_map[("Class 10", "MATH101")]

        # Exam 1: Published Mid-Term Exam
        exam1 = db.query(Examination).filter(
            Examination.class_subject_id == cs_class10_cs.id,
            Examination.name == "Mid-Term Examination: Computer Science"
        ).first()
        if not exam1:
            exam1 = Examination(
                class_subject_id=cs_class10_cs.id,
                created_by_faculty_id=fac1.id,
                name="Mid-Term Examination: Computer Science",
                exam_type="MID_TERM",
                exam_date=datetime.now() - timedelta(days=5),
                start_time="10:00 AM",
                duration_minutes=90,
                max_marks=100.0,
                passing_marks=40.0,
                is_published=True,
                instructions="Covers Units 1-4: Python syntax, functions, conditionals, and arrays."
            )
            db.add(exam1)
            db.flush()
            print("  + Created Exam: Mid-Term Examination: Computer Science (Published)")

        # Marks for Exam 1
        exam1_marks = [
            ("STU001", 88.5, "Excellent comprehension of algorithm design and syntax."),
            ("STU002", 79.0, "Very good effort. Solid logic."),
            ("STU003", 64.0, "Good attempt, needs review on nested loops."),
        ]
        for roll, marks, remarks in exam1_marks:
            stu = students_map[roll]
            m = db.query(ExamMark).filter(
                ExamMark.examination_id == exam1.id,
                ExamMark.student_id == stu.id
            ).first()
            if not m:
                m = ExamMark(
                    examination_id=exam1.id,
                    student_id=stu.id,
                    marks_obtained=marks,
                    remarks=remarks
                )
                db.add(m)

        # Exam 2: Upcoming Unit Test (Unpublished)
        exam2 = db.query(Examination).filter(
            Examination.class_subject_id == cs_class10_math.id,
            Examination.name == "Unit Test 1: Trigonometry & Polynomials"
        ).first()
        if not exam2:
            exam2 = Examination(
                class_subject_id=cs_class10_math.id,
                created_by_faculty_id=fac1.id,
                name="Unit Test 1: Trigonometry & Polynomials",
                exam_type="UNIT_TEST",
                exam_date=datetime.now() + timedelta(days=7),
                start_time="09:00 AM",
                duration_minutes=60,
                max_marks=50.0,
                passing_marks=20.0,
                is_published=False,
                instructions="Scientific calculators are not permitted. Bring geometry kit."
            )
            db.add(exam2)
            db.flush()
            print("  + Created Exam: Unit Test 1: Trigonometry & Polynomials (Upcoming)")

        # =========================================================================
        # 7. ASSIGNMENTS & SUBMISSIONS
        # =========================================================================
        assign1 = db.query(Assignment).filter(
            Assignment.class_subject_id == cs_class10_cs.id,
            Assignment.title == "Assignment 1: Python Data Structures & Algorithmic Logic"
        ).first()
        if not assign1:
            assign1 = Assignment(
                class_subject_id=cs_class10_cs.id,
                created_by_faculty_id=fac1.id,
                title="Assignment 1: Python Data Structures & Algorithmic Logic",
                description="Implement 5 core algorithms using Python dictionaries and lists. Document time and space complexities.",
                due_date=datetime.now() + timedelta(days=3),
                max_marks=100.0,
                attachment_filename=None,
                attachment_path=None
            )
            db.add(assign1)
            db.flush()
            print("  + Created Assignment 1 (Class 10 CS)")

        # Submission for STU001
        stu1 = students_map["STU001"]
        sub1 = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assign1.id,
            AssignmentSubmission.student_id == stu1.id
        ).first()
        if not sub1:
            sub1 = AssignmentSubmission(
                assignment_id=assign1.id,
                student_id=stu1.id,
                submission_text="Completed all algorithmic exercises with full time/space complexity analysis and test cases.",
                status="EVALUATED",
                marks_obtained=95.0,
                feedback="Flawless implementation and outstanding code comments!",
                evaluated_at=datetime.now() - timedelta(hours=6),
                evaluated_by_faculty_id=fac1.id
            )
            db.add(sub1)

        # Assignment 2 (Class 10 Math)
        assign2 = db.query(Assignment).filter(
            Assignment.class_subject_id == cs_class10_math.id,
            Assignment.title == "Assignment: Real Numbers and Polynomial Proofs"
        ).first()
        if not assign2:
            assign2 = Assignment(
                class_subject_id=cs_class10_math.id,
                created_by_faculty_id=fac1.id,
                title="Assignment: Real Numbers and Polynomial Proofs",
                description="Complete textbook exercise 2.1 to 2.4. Show step-by-step proofs for Euclidean lemma application.",
                due_date=datetime.now() + timedelta(days=6),
                max_marks=50.0
            )
            db.add(assign2)
            db.flush()
            print("  + Created Assignment 2 (Class 10 Math)")

        # =========================================================================
        # 8. STUDY MATERIALS
        # =========================================================================
        materials_data = [
            {
                "cs": cs_class10_cs,
                "title": "Python 3 Official Tutorial & Complete Language Reference",
                "description": "Comprehensive tutorial covering standard library, OOP, and data structures.",
                "type": "REFERENCE",
                "link": "https://docs.python.org/3/tutorial/"
            },
            {
                "cs": cs_class10_math,
                "title": "Trigonometric Identities & Standard Value Tables",
                "description": "Handy reference sheet containing standard angle values and Pythagorean identities.",
                "type": "DOCUMENT",
                "link": "https://en.wikipedia.org/wiki/List_of_trigonometric_identities"
            }
        ]
        for m in materials_data:
            mat = db.query(StudyMaterial).filter(
                StudyMaterial.class_subject_id == m["cs"].id,
                StudyMaterial.title == m["title"]
            ).first()
            if not mat:
                mat = StudyMaterial(
                    class_subject_id=m["cs"].id,
                    uploaded_by_faculty_id=fac1.id,
                    title=m["title"],
                    description=m["description"],
                    material_type=m["type"],
                    external_link=m["link"]
                )
                db.add(mat)
                print(f"  + Created Study Material: {m['title']}")

        db.commit()
        print("\n✨ Step 2 Database seeding completed successfully!")
        print("--------------------------------------------------")
        print("Classes: Class 8, Class 9, Class 10")
        print("Subjects: Math, Science, English, CS, Social Studies")
        print("Demo Credentials:")
        print("Student: STU001 / Student@123 (Class 10)")
        print("Faculty: FAC001 / Faculty@123 (Teaches Class 10 Math & CS, Class 9 Science)")
        print("Faculty: FAC002 / Faculty@123 (Teaches Class 8 Math, Class 10 Science)")
        print("--------------------------------------------------")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed with error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
