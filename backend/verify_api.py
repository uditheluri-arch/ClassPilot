"""
ClassPilot Live API Verification Script
Tests health, authentication, RBAC, and academic endpoints against live FastAPI backend.
"""
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def verify_api():
    print("=" * 60)
    print("ClassPilot Live API Endpoints Verification")
    print("=" * 60)
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Health endpoint
    res = client.get("/health")
    print(f"[1] GET /health -> Status: {res.status_code}, Response: {res.json()}")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"

    # 2. Student Login
    res = client.post("/auth/login", json={
        "role": "STUDENT",
        "identifier": "STU001",
        "password": "Student@123"
    })
    print(f"[2] POST /auth/login (Student STU001) -> Status: {res.status_code}")
    assert res.status_code == 200, f"Student login failed: {res.text}"
    stu_data = res.json()
    stu_token = stu_data["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    print(f"    Student Name: {stu_data['user']['full_name']}, Role: {stu_data['user']['role']}")

    # 3. Student Profile & My Class
    res = client.get("/student/profile", headers=stu_headers)
    print(f"[3] GET /student/profile -> Status: {res.status_code}, Name: {res.json().get('full_name')}")
    assert res.status_code == 200

    res = client.get("/academic/my-class", headers=stu_headers)
    print(f"[4] GET /academic/my-class -> Status: {res.status_code}, Class: {res.json().get('name')} {res.json().get('section')}")
    print(f"    Enrolled Subjects Count: {len(res.json().get('subjects', []))}")
    assert res.status_code == 200

    # 4. Student Exams
    res = client.get("/exams/student", headers=stu_headers)
    print(f"[5] GET /exams/student -> Status: {res.status_code}, Total Exams: {len(res.json())}")
    assert res.status_code == 200

    # 5. Student Assignments
    res = client.get("/assignments/student", headers=stu_headers)
    print(f"[6] GET /assignments/student -> Status: {res.status_code}, Total Assignments: {len(res.json())}")
    assert res.status_code == 200

    # 6. Faculty Login
    res = client.post("/auth/login", json={
        "role": "FACULTY",
        "identifier": "FAC001",
        "password": "Faculty@123"
    })
    print(f"[7] POST /auth/login (Faculty FAC001) -> Status: {res.status_code}")
    assert res.status_code == 200, f"Faculty login failed: {res.text}"
    fac_data = res.json()
    fac_token = fac_data["access_token"]
    fac_headers = {"Authorization": f"Bearer {fac_token}"}
    print(f"    Faculty Name: {fac_data['user']['full_name']}, Role: {fac_data['user']['role']}")

    # 7. Faculty Profile & Assigned Classes
    res = client.get("/faculty/profile", headers=fac_headers)
    print(f"[8] GET /faculty/profile -> Status: {res.status_code}, Name: {res.json().get('full_name')}")
    assert res.status_code == 200

    res = client.get("/academic/classes", headers=fac_headers)
    print(f"[9] GET /academic/classes -> Status: {res.status_code}, Assigned Classes Count: {len(res.json())}")
    assert res.status_code == 200

    # 8. Faculty Exams & Assignments
    res = client.get("/exams/faculty", headers=fac_headers)
    print(f"[10] GET /exams/faculty -> Status: {res.status_code}, Total Exams Created: {len(res.json())}")
    assert res.status_code == 200

    res = client.get("/assignments/faculty", headers=fac_headers)
    print(f"[11] GET /assignments/faculty -> Status: {res.status_code}, Total Assignments: {len(res.json())}")
    assert res.status_code == 200

    print("=" * 60)
    print("All live API endpoints verified with 100% success!")
    print("=" * 60)

if __name__ == "__main__":
    verify_api()
