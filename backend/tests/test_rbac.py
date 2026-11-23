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

def test_student_can_access_student_profile(client, db_session):
    token = get_student_token(client)
    response = client.get("/student/profile", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["roll_number"] == "STU001"
    assert data["role"] == "STUDENT"
    assert data["full_name"] in ["Demo Student", "Aarav Sharma"]

def test_student_cannot_access_faculty_profile(client, db_session):
    token = get_student_token(client)
    response = client.get("/faculty/profile", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    data = response.json()
    assert "Faculty role required" in data["detail"]

def test_faculty_can_access_faculty_profile(client, db_session):
    token = get_faculty_token(client)
    response = client.get("/faculty/profile", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == "FAC001"
    assert data["role"] == "FACULTY"
    assert data["full_name"] in ["Demo Faculty", "Dr. Sarah Jenkins"]

def test_faculty_cannot_access_student_profile(client, db_session):
    token = get_faculty_token(client)
    response = client.get("/student/profile", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    data = response.json()
    assert "Student role required" in data["detail"]

def test_unauthenticated_request_rejected(client):
    # Missing Authorization header
    res1 = client.get("/student/profile")
    assert res1.status_code == 401

    res2 = client.get("/faculty/profile")
    assert res2.status_code == 401

    res3 = client.get("/auth/me")
    assert res3.status_code == 401

def test_invalid_token_rejected(client):
    # Malformed token
    res = client.get("/student/profile", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res.status_code == 401
