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

def test_faculty_can_create_assignment(client, db_session):
    token = get_faculty_token(client)
    ta_res = client.get("/academic/teaching-assignments", headers={"Authorization": f"Bearer {token}"})
    assert ta_res.status_code == 200
    cs_id = ta_res.json()[0]["class_subject_id"]

    res = client.post(
        "/assignments/",
        data={
            "class_subject_id": cs_id,
            "title": "Automated Test Assignment",
            "description": "Solve exercise questions 1 to 5.",
            "due_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "max_marks": 50.0,
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Automated Test Assignment"
    assert data["max_marks"] == 50.0

def test_student_can_view_assignments(client, db_session):
    token = get_student_token(client)
    res = client.get("/assignments/student", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assignments = res.json()
    assert isinstance(assignments, list)
    assert len(assignments) >= 1

def test_student_can_submit_assignment(client, db_session):
    student_token = get_student_token(client)
    assignments_res = client.get("/assignments/student", headers={"Authorization": f"Bearer {student_token}"})
    assignments = assignments_res.json()
    assert len(assignments) >= 1
    # Find an assignment that is not yet evaluated
    target = next((a for a in assignments if a["submission_status"] != "EVALUATED"), assignments[0])

    if target["submission_status"] != "EVALUATED":
        res = client.post(
            f"/assignments/{target['id']}/submit",
            data={"submission_text": "Completed tasks via automated test suite."},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert res.status_code == 200
        assert res.json()["status"] == "SUBMITTED"

def test_student_cannot_view_other_submissions(client, db_session):
    student_token = get_student_token(client)
    assignments_res = client.get("/assignments/student", headers={"Authorization": f"Bearer {student_token}"})
    target_id = assignments_res.json()[0]["id"]

    # Student accessing faculty submissions endpoint must be rejected
    res = client.get(f"/assignments/{target_id}/submissions", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

def test_faculty_can_view_submissions_and_evaluate(client, db_session):
    faculty_token = get_faculty_token(client)
    assignments_res = client.get("/assignments/faculty", headers={"Authorization": f"Bearer {faculty_token}"})
    assignments = assignments_res.json()
    assert len(assignments) >= 1

    # Find assignment with submissions
    for a in assignments:
        subs_res = client.get(f"/assignments/{a['id']}/submissions", headers={"Authorization": f"Bearer {faculty_token}"})
        assert subs_res.status_code == 200
        subs = subs_res.json()
        if subs:
            first_sub = subs[0]
            eval_res = client.post(
                f"/assignments/submissions/{first_sub['id']}/evaluate",
                json={
                    "marks_obtained": min(45.0, a["max_marks"] or 100),
                    "feedback": "Graded by automated test suite."
                },
                headers={"Authorization": f"Bearer {faculty_token}"}
            )
            assert eval_res.status_code == 200
            assert eval_res.json()["status"] == "EVALUATED"
            break

def test_study_materials_flow(client, db_session):
    faculty_token = get_faculty_token(client)
    ta_res = client.get("/academic/teaching-assignments", headers={"Authorization": f"Bearer {faculty_token}"})
    cs_id = ta_res.json()[0]["class_subject_id"]

    # Faculty uploads material
    mat_res = client.post(
        "/assignments/materials",
        data={
            "class_subject_id": cs_id,
            "title": "Automated Test Notes",
            "material_type": "NOTES",
            "description": "Lecture notes on algorithms",
            "external_link": "https://classpilot.demo/notes"
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert mat_res.status_code == 201

    # Student views materials
    student_token = get_student_token(client)
    std_mat_res = client.get("/assignments/materials/student", headers={"Authorization": f"Bearer {student_token}"})
    assert std_mat_res.status_code == 200
    assert len(std_mat_res.json()) >= 1
