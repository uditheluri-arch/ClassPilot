import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal
from app.models.user import User, Student, Faculty, UserRole
from app.core.security import get_password_hash

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="session")
def db_session():
    db = SessionLocal()
    try:
        # Create an inactive user for testing inactive account login rejection
        inactive_user = db.query(User).filter(User.username == "inactive_stu").first()
        if not inactive_user:
            inactive_user = User(
                username="inactive_stu",
                email="inactive@classpilot.demo",
                password_hash=get_password_hash("Inactive@123"),
                role=UserRole.STUDENT,
                is_active=False
            )
            db.add(inactive_user)
            db.flush()

            inactive_student = Student(
                user_id=inactive_user.id,
                roll_number="INACTIVE001",
                full_name="Inactive Student"
            )
            db.add(inactive_student)
            db.commit()

        yield db
    finally:
        db.close()
