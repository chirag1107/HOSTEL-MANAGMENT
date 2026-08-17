"""
AUTOMATED BACKEND API TEST SUITE FOR RCPIT HOSTEL MANAGEMENT
Runs unit/integration tests against Flask test client to verify all endpoints and DB operations.
"""

import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import init_db, seed_db

def run_tests():
    print("=" * 60)
    print("RCPIT HOSTEL BACKEND API - TEST EXECUTION SUITE")
    print("=" * 60)

    client = app.test_client()

    # Test 1: Health & Root
    print("\n[TEST 1] Root & Health Check Endpoints")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  [OK] Root status: {res.json.get('status')}")

    res_h = client.get("/api/health")
    assert res_h.status_code == 200
    print(f"  [OK] Health check: {res_h.json.get('database')}")

    # Test 2: Student Login
    print("\n[TEST 2] Authentication - Student Login")
    res_s = client.post("/api/auth/login", json={
        "role": "student",
        "prn": "2026AI042",
        "password": "hostel123"
    })
    assert res_s.status_code == 200
    student_data = res_s.json
    assert student_data["success"] is True
    print(f"  [OK] Student login success: {student_data['user']['name']} ({student_data['user']['prn']})")

    # Test 3: Parent Login
    print("\n[TEST 3] Authentication - Parent Login")
    res_p = client.post("/api/auth/login", json={
        "role": "parent",
        "parentId": "9423199880",
        "wardPrn": "2026AI042",
        "password": "hostel123"
    })
    assert res_p.status_code == 200
    parent_data = res_p.json
    assert parent_data["success"] is True
    print(f"  [OK] Parent login success: {parent_data['user']['parent_name']}")

    # Test 4: Student Profile API
    print("\n[TEST 4] Student Profile, Room, Roommates & Inventory API")
    res_prof = client.get("/api/student/profile?prn=2026AI042")
    assert res_prof.status_code == 200
    prof_json = res_prof.json
    print(f"  [OK] Student: {prof_json['student']['name']}, Room: {prof_json['room']['room_number']}")
    print(f"  [OK] Roommates count: {len(prof_json['roommates'])}, Inventory count: {len(prof_json['inventory'])}")

    # Test 5: Complaints API (Fetch & Submit)
    print("\n[TEST 5] Complaints API")
    res_c = client.get("/api/complaints?prn=2026AI042")
    assert res_c.status_code == 200
    init_count = len(res_c.json["complaints"])
    print(f"  [OK] Initial complaints count: {init_count}")

    # Submit new complaint
    new_c_payload = {
        "prn": "2026AI042",
        "category": "Electrical",
        "priority": "High",
        "room": "Room B-304",
        "title": "Study table LED lamp flickering",
        "description": "Tube flickers constantly during study hours."
    }
    res_post_c = client.post("/api/complaints", json=new_c_payload)
    assert res_post_c.status_code == 201
    new_tck_id = res_post_c.json["complaint"]["id"]
    print(f"  [OK] Lodged new complaint: #{new_tck_id} ({res_post_c.json['complaint']['title']})")

    # Update complaint status
    res_patch = client.patch(f"/api/complaints/{new_tck_id}/status", json={"status": "Resolved"})
    assert res_patch.status_code == 200
    print(f"  [OK] Updated ticket #{new_tck_id} to Resolved.")

    # Test 6: Passes API (Submit & Parent Consent)
    print("\n[TEST 6] Leave Passes & Parent Consent Workflow")
    res_pass = client.get("/api/passes?prn=2026AI042")
    assert res_pass.status_code == 200
    print(f"  [OK] Active passes count: {res_pass.json['activeCount']}, Total: {len(res_pass.json['passes'])}")

    # Submit Weekend Leave
    leave_payload = {
        "prn": "2026AI042",
        "type": "Weekend Home Visit",
        "destination": "Nashik (Gangapur Road)",
        "from": "Friday 05:00 PM",
        "to": "Sunday 08:30 PM",
        "reason": "Family gathering and wedding function."
    }
    res_leave = client.post("/api/passes", json=leave_payload)
    assert res_leave.status_code == 201
    created_pass_id = res_leave.json["pass"]["id"]
    print(f"  [OK] Leave pass created: #{created_pass_id}, Status: {res_leave.json['pass']['status']}")

    # Parent grants consent
    res_consent = client.post(f"/api/passes/{created_pass_id}/parent-consent", json={
        "action": "approve",
        "parentPhone": "9423199880"
    })
    assert res_consent.status_code == 200
    assert res_consent.json["pass"]["parent_consent_status"] == "Granted"
    print(f"  [OK] Parent consent granted for #{created_pass_id}: {res_consent.json['pass']['status']}")

    # Test 7: Attendance API
    print("\n[TEST 7] Night Roll Call & Attendance Records")
    res_att = client.get("/api/attendance?prn=2026AI042")
    assert res_att.status_code == 200
    att_data = res_att.json
    print(f"  [OK] Attendance rate: {att_data['stats']['percentage']}, Present: {att_data['stats']['presentDays']}")
    print(f"  [OK] Total daily log records: {len(att_data['attendance'])}")

    # Test 8: Notices API
    print("\n[TEST 8] Hostel Notices & Circulars")
    res_n = client.get("/api/notices?category=all")
    assert res_n.status_code == 200
    print(f"  [OK] Notices count: {res_n.json['count']}")

    # Test 9: Parent Notifications Feed
    print("\n[TEST 9] Parent Alerts & SMS Dispatch Notifications")
    res_pnotif = client.get("/api/parent/notifications?parentPhone=9423199880")
    assert res_pnotif.status_code == 200
    print(f"  [OK] Parent notification alerts count: {len(res_pnotif.json['notifications'])}")

    print("\n" + "=" * 60)
    print("ALL BACKEND API TESTS PASSED SUCCESSFULLY! (9/9 Modules Validated)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
