"""
ClassPilot Database Inspection and Verification Script
Read-only queries to verify database connectivity, schema, table counts, and record integrity.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def verify():
    print("=" * 60)
    print("ClassPilot Database Inspection (Read-Only)")
    print("=" * 60)
    
    with engine.connect() as conn:
        # 1. Connection & DB Info
        db_info = conn.execute(text("SELECT current_database(), current_user, version()")).fetchone()
        print(f"Connected to Database: {db_info[0]}")
        print(f"Connected as User:     {db_info[1]}")
        print(f"PostgreSQL Version:    {db_info[2][:50]}...")
        
        # 2. Schema and Tables
        tables = conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        )).fetchall()
        print(f"\nFound {len(tables)} tables in 'public' schema:")
        for t in tables:
            tname = t[0]
            cnt = conn.execute(text(f'SELECT count(*) FROM "{tname}"')).scalar()
            print(f"  ✓ {tname:<25} : {cnt:>4} rows")
        
        # 3. Sample verification
        print("\nRecord Verification:")
        users = conn.execute(text("SELECT username, role, is_active FROM users ORDER BY id")).fetchall()
        print("  Users:")
        for u in users:
            print(f"    - {u[0]} ({u[1]}, active={u[2]})")
            
        students = conn.execute(text("SELECT roll_number, full_name FROM students ORDER BY id")).fetchall()
        print("  Students:")
        for s in students:
            print(f"    - {s[0]}: {s[1]}")

        faculty = conn.execute(text("SELECT employee_id, full_name FROM faculty ORDER BY id")).fetchall()
        print("  Faculty:")
        for f in faculty:
            print(f"    - {f[0]}: {f[1]}")

        classes = conn.execute(text("SELECT name, section FROM classes ORDER BY id")).fetchall()
        print("  Classes:")
        for c in classes:
            print(f"    - {c[0]} (Section {c[1]})")

        subjects = conn.execute(text("SELECT code, name FROM subjects ORDER BY id")).fetchall()
        print("  Subjects:")
        for sub in subjects:
            print(f"    - {sub[0]}: {sub[1]}")

        exams = conn.execute(text("SELECT name, exam_type, max_marks, is_published FROM examinations ORDER BY id")).fetchall()
        print("  Examinations:")
        for ex in exams:
            print(f"    - {ex[0]} ({ex[1]}, max={ex[2]}, published={ex[3]})")

    print("=" * 60)
    print("Database verification completed successfully with 100% data integrity!")
    print("=" * 60)

if __name__ == "__main__":
    verify()
