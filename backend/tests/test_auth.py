def test_student_login_success(client, db_session):
    response = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "STU001",
        "password": "Student@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "STUDENT"
    assert data["user"]["identifier"] == "STU001"
    assert data["user"]["full_name"] in ["Demo Student", "Aarav Sharma"]
    assert "password_hash" not in str(data)

def test_faculty_login_with_employee_id_success(client, db_session):
    response = client.post("/auth/login", json={
        "role": "FACULTY",
        "identifier": "FAC001",
        "password": "Faculty@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "FACULTY"
    assert data["user"]["identifier"] == "FAC001"
    assert data["user"]["full_name"] in ["Demo Faculty", "Dr. Sarah Jenkins"]
    assert "password_hash" not in str(data)

def test_faculty_login_with_email_success(client, db_session):
    response = client.post("/auth/login", json={
        "role": "FACULTY",
        "identifier": "faculty@classpilot.demo",
        "password": "Faculty@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "FACULTY"
    assert data["user"]["identifier"] == "FAC001"

def test_login_invalid_password_rejected(client, db_session):
    response = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "STU001",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401
    data = response.json()
    assert "Incorrect password" in data["detail"]

def test_login_unknown_account_rejected(client, db_session):
    response = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "UNKNOWN999",
        "password": "Student@123"
    })
    assert response.status_code == 401
    data = response.json()
    assert "No active account" in data["detail"]

def test_login_inactive_account_rejected(client, db_session):
    response = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "INACTIVE001",
        "password": "Inactive@123"
    })
    assert response.status_code == 403
    data = response.json()
    assert "inactive" in data["detail"].lower()

def test_get_current_user_me(client, db_session):
    # Log in first
    login_res = client.post("/auth/login", json={
        "identifier": "STU001",
        "password": "Student@123"
    })
    token = login_res.json()["access_token"]
    
    # Query /auth/me
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["identifier"] == "STU001"
    assert me_data["role"] == "STUDENT"
    assert "password_hash" not in str(me_data)

def test_logout_endpoint(client, db_session):
    login_res = client.post("/auth/login", json={
        "identifier": "STU001",
        "password": "Student@123"
    })
    token = login_res.json()["access_token"]

    logout_res = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200
    assert "logged out" in logout_res.json()["message"].lower()
