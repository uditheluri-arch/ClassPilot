import pytest

def get_student_token(client):
    res = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "STU001",
        "password": "Student@123"
    })
    return res.json()["access_token"]

def get_faculty_token(client):
    res = client.post("/auth/login", json={
        "role": "FACULTY",
        "identifier": "FAC001",
        "password": "Faculty@123"
    })
    return res.json()["access_token"]

def test_student_can_get_my_class(client, db_session):
    token = get_student_token(client)
    res = client.get("/academic/my-class", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Class 10"
    assert data["student_count"] >= 1
    assert len(data["subjects"]) >= 1

def test_faculty_cannot_access_student_my_class(client, db_session):
    token = get_faculty_token(client)
    res = client.get("/academic/my-class", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403

def test_faculty_can_get_assigned_classes(client, db_session):
    token = get_faculty_token(client)
    res = client.get("/academic/classes", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    classes = res.json()
    assert len(classes) >= 1
    class_names = [c["name"] for c in classes]
    assert "Class 10" in class_names

def test_student_cannot_access_faculty_classes(client, db_session):
    token = get_student_token(client)
    res = client.get("/academic/classes", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403

def test_faculty_can_get_class_students(client, db_session):
    token = get_faculty_token(client)
    # Get faculty classes first
    classes_res = client.get("/academic/classes", headers={"Authorization": f"Bearer {token}"})
    class_10 = next(c for c in classes_res.json() if c["name"] == "Class 10")

    res = client.get(f"/academic/classes/{class_10['id']}/students", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    students = res.json()
    assert len(students) >= 1
    rolls = [s["roll_number"] for s in students]
    assert "STU001" in rolls

def test_faculty_cannot_access_unassigned_class_students(client, db_session):
    token = get_faculty_token(client)
    # Class 8 is assigned to FAC002, not FAC001
    from app.models.academic import AcademicClass
    c8 = db_session.query(AcademicClass).filter(AcademicClass.name == "Class 8").first()
    if c8:
        res = client.get(f"/academic/classes/{c8.id}/students", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403
        assert "unassigned classes" in res.json()["detail"].lower()

def test_faculty_can_search_students(client, db_session):
    token = get_faculty_token(client)
    res = client.get("/academic/students/search?q=STU001", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert results[0]["roll_number"] == "STU001"

def test_faculty_teaching_assignments(client, db_session):
    token = get_faculty_token(client)
    res = client.get("/academic/teaching-assignments", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assignments = res.json()
    assert len(assignments) >= 1
    subject_codes = [a["subject_code"] for a in assignments]
    assert "CS101" in subject_codes or "MATH101" in subject_codes
