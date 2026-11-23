import pytest
from datetime import datetime, timedelta

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

def test_faculty_can_create_exam_for_assigned_class_subject(client, db_session):
    token = get_faculty_token(client)
    # Get teaching assignments
    ta_res = client.get("/academic/teaching-assignments", headers={"Authorization": f"Bearer {token}"})
    assert ta_res.status_code == 200
    cs_id = ta_res.json()[0]["class_subject_id"]

    exam_payload = {
        "class_subject_id": cs_id,
        "name": "Automated Test Exam 2026",
        "exam_type": "UNIT_TEST",
        "exam_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "start_time": "11:00 AM",
        "duration_minutes": 60,
        "max_marks": 50.0,
        "passing_marks": 20.0,
        "instructions": "No calculators allowed."
    }

    res = client.post("/exams/", json=exam_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Automated Test Exam 2026"
    assert data["max_marks"] == 50.0
    assert data["is_published"] is False

def test_faculty_cannot_create_exam_with_invalid_marks(client, db_session):
    token = get_faculty_token(client)
    ta_res = client.get("/academic/teaching-assignments", headers={"Authorization": f"Bearer {token}"})
    cs_id = ta_res.json()[0]["class_subject_id"]

    # Passing marks greater than max marks
    bad_payload = {
        "class_subject_id": cs_id,
        "name": "Invalid Marks Exam",
        "exam_type": "QUIZ",
        "exam_date": (datetime.now() + timedelta(days=5)).isoformat(),
        "duration_minutes": 30,
        "max_marks": 25.0,
        "passing_marks": 30.0  # Invalid!
    }
    res = client.post("/exams/", json=bad_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 400
    assert "cannot exceed maximum marks" in res.json()["detail"].lower()

def test_faculty_cannot_create_exam_for_unassigned_class_subject(client, db_session):
    token = get_faculty_token(client)
    from app.models.academic import ClassSubject, AcademicClass
    c8 = db_session.query(AcademicClass).filter(AcademicClass.name == "Class 8").first()
    if c8:
        cs8 = db_session.query(ClassSubject).filter(ClassSubject.class_id == c8.id).first()
        if cs8:
            res = client.post("/exams/", json={
                "class_subject_id": cs8.id,
                "name": "Unauthorized Exam",
                "exam_type": "UNIT_TEST",
                "exam_date": (datetime.now() + timedelta(days=5)).isoformat(),
                "duration_minutes": 60,
                "max_marks": 100.0,
                "passing_marks": 40.0
            }, headers={"Authorization": f"Bearer {token}"})
            assert res.status_code == 403

def test_student_can_view_exam_schedules(client, db_session):
    token = get_student_token(client)
    res = client.get("/exams/student", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    exams = res.json()
    assert isinstance(exams, list)
    assert len(exams) >= 1

def test_student_can_view_published_results_only(client, db_session):
    token = get_student_token(client)
    res = client.get("/exams/my-results", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    results = res.json()
    assert isinstance(results, list)
    # Mid-Term exam was seeded as published
    if results:
        res_item = results[0]
        assert "marks_obtained" in res_item
        assert "percentage" in res_item
        assert "is_passed" in res_item

def test_faculty_can_enter_marks_and_toggle_publish(client, db_session):
    token = get_faculty_token(client)
    exams_res = client.get("/exams/faculty", headers={"Authorization": f"Bearer {token}"})
    exams = exams_res.json()
    assert len(exams) >= 1
    exam = exams[0]

    # Get exam marks list
    marks_res = client.get(f"/exams/{exam['id']}/marks", headers={"Authorization": f"Bearer {token}"})
    assert marks_res.status_code == 200
    students_marks = marks_res.json()

    if students_marks:
        first_student = students_marks[0]
        # Update marks
        submit_res = client.post(f"/exams/{exam['id']}/marks", json={
            "marks": [{
                "student_id": first_student["student_id"],
                "marks_obtained": min(85.0, exam["max_marks"]),
                "remarks": "Updated via pytest"
            }]
        }, headers={"Authorization": f"Bearer {token}"})
        assert submit_res.status_code == 200

    # Toggle publish
    curr_status = exam["is_published"]
    toggle_res = client.patch(f"/exams/{exam['id']}/publish", json={
        "is_published": not curr_status
    }, headers={"Authorization": f"Bearer {token}"})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_published"] is (not curr_status)
