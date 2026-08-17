"""
RCPIT STUDENT & PARENT HOSTEL MANAGEMENT PORTAL - BACKEND API SERVER
Built with Flask, Flask-CORS, and SQLite persistent storage.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime
import json
import os

from database import init_db, seed_db, get_db_connection, DB_PATH

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Ensure DB is ready on startup
init_db()
seed_db()


# --------------------------------------------------------------------------
# Helper Functions
# --------------------------------------------------------------------------

def row_to_dict(row):
    """Convert SQLite Row to dictionary."""
    if row is None:
        return None
    return dict(row)


def rows_to_list(rows):
    """Convert list of SQLite Rows to list of dictionaries."""
    return [dict(r) for r in rows]


# --------------------------------------------------------------------------
# 1. System Health & DB Reset Endpoints
# --------------------------------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "service": "RCPIT Hostel Management Backend",
        "status": "online",
        "database": "SQLite3 (Connected)",
        "timestamp": datetime.now().isoformat(),
        "modules": [
            "Authentication (Student & Parent)",
            "Student Resident Profile & ID Card",
            "Room & Roommates Details & Fixtures Inventory",
            "Complaints & Maintenance Tickets Tracker",
            "Leave Requests & Digital Gate Pass with Parent Consent",
            "Night Roll Call & Monthly Attendance Records",
            "Hostel Notices & Circulars",
            "Parent Notifications & Alerts Dispatch Log"
        ]
    })


@app.route("/api/health", methods=["GET"])
def health():
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1;")
        conn.close()
        return jsonify({
            "success": True,
            "status": "healthy",
            "database": "connected",
            "db_path": DB_PATH
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500


@app.route("/api/reset-db", methods=["POST"])
def reset_database():
    """Admin endpoint to re-seed demo data."""
    try:
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        init_db()
        seed_db()
        return jsonify({"success": True, "message": "Database successfully reset and re-seeded."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --------------------------------------------------------------------------
# 2. Authentication APIs
# --------------------------------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Unified login endpoint for both Student and Parent roles.
    Accepts:
      role: 'student' | 'parent'
      prn: string (for student)
      parentId: string (phone or email for parent)
      wardPrn: string (for parent)
      password: string
    """
    data = request.get_json(silent=True) or {}
    role = data.get("role", "student").lower()
    password = data.get("password", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    if role == "student":
        prn = data.get("prn", "").strip()
        if not prn:
            conn.close()
            return jsonify({"success": False, "message": "Student PRN is required"}), 400

        cursor.execute("SELECT * FROM students WHERE UPPER(prn) = UPPER(?)", (prn,))
        student = cursor.fetchone()

        if not student:
            # Fallback for demo convenience if standard demo PRN
            cursor.execute("SELECT * FROM students LIMIT 1;")
            student = cursor.fetchone()

        if not student:
            conn.close()
            return jsonify({"success": False, "message": "Student record not found"}), 404

        # Verify password (demo accepts 'hostel123' or exact match)
        if password and password != "hostel123" and student["password"] != password:
            conn.close()
            return jsonify({"success": False, "message": "Invalid password entered"}), 401

        student_dict = row_to_dict(student)
        conn.close()
        return jsonify({
            "success": True,
            "role": "student",
            "message": f"Welcome back, {student_dict['name']}!",
            "user": student_dict
        })

    elif role == "parent":
        parent_id = data.get("parentId", "").strip()
        ward_prn = data.get("wardPrn", "").strip()

        cursor.execute("""
            SELECT p.*, s.name as ward_name, s.room_number, s.department as ward_dept, s.hostel_block
            FROM parents p
            LEFT JOIN students s ON UPPER(s.prn) = UPPER(p.linked_ward_prn)
            WHERE p.parent_phone = ? OR p.email = ? OR UPPER(p.linked_ward_prn) = UPPER(?)
            LIMIT 1;
        """, (parent_id, parent_id, ward_prn))
        parent = cursor.fetchone()

        if not parent:
            # Demo fallback
            cursor.execute("""
                SELECT p.*, s.name as ward_name, s.room_number, s.department as ward_dept, s.hostel_block
                FROM parents p
                LEFT JOIN students s ON UPPER(s.prn) = UPPER(p.linked_ward_prn)
                LIMIT 1;
            """)
            parent = cursor.fetchone()

        if not parent:
            conn.close()
            return jsonify({"success": False, "message": "Parent record not found"}), 404

        if password and password != "hostel123" and parent["password"] != password:
            conn.close()
            return jsonify({"success": False, "message": "Invalid password"}), 401

        parent_dict = row_to_dict(parent)
        conn.close()
        return jsonify({
            "success": True,
            "role": "parent",
            "message": f"Welcome {parent_dict['parent_name']}! Accessing Ward Portal.",
            "user": parent_dict
        })

    else:
        conn.close()
        return jsonify({"success": False, "message": "Invalid role specified"}), 400


# --------------------------------------------------------------------------
# 3. Student Resident Profile & Room Details APIs
# --------------------------------------------------------------------------

@app.route("/api/student/profile", methods=["GET"])
def get_student_profile():
    prn = request.args.get("prn", "2026AI042").strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE UPPER(prn) = UPPER(?)", (prn,))
    student = cursor.fetchone()
    if not student:
        cursor.execute("SELECT * FROM students LIMIT 1;")
        student = cursor.fetchone()

    if not student:
        conn.close()
        return jsonify({"success": False, "message": "Student not found"}), 404

    student_data = row_to_dict(student)
    room_num = student_data.get("room_number", "B-304")

    # Fetch Room Info
    cursor.execute("SELECT * FROM rooms WHERE room_number = ?", (room_num,))
    room = cursor.fetchone()
    room_data = row_to_dict(room) if room else {
        "room_number": room_num,
        "block": "Block B",
        "floor": "3rd Floor",
        "room_type": "3-Sharing Deluxe Room",
        "capacity": 3,
        "occupied_count": 3
    }
    if room_data.get("amenities") and isinstance(room_data["amenities"], str):
        try:
            room_data["amenities"] = json.loads(room_data["amenities"])
        except Exception:
            room_data["amenities"] = []

    # Fetch Roommates
    cursor.execute("SELECT * FROM roommates WHERE room_number = ?", (room_num,))
    roommates = rows_to_list(cursor.fetchall())

    # Fetch Room Inventory
    cursor.execute("SELECT * FROM room_inventory WHERE room_number = ?", (room_num,))
    inventory = rows_to_list(cursor.fetchall())

    # Fetch Parent Details
    cursor.execute("SELECT * FROM parents WHERE linked_ward_prn = ? OR parent_phone = ?",
                   (student_data["prn"], student_data["parent_phone"]))
    parent = cursor.fetchone()
    parent_data = row_to_dict(parent) if parent else {}

    conn.close()

    return jsonify({
        "success": True,
        "student": student_data,
        "room": room_data,
        "roommates": roommates,
        "inventory": inventory,
        "parent": parent_data
    })


@app.route("/api/parent/ward-profile", methods=["GET"])
def get_ward_profile():
    parent_phone = request.args.get("parentPhone", "9423199880").strip()
    ward_prn = request.args.get("wardPrn", "2026AI042").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM parents WHERE parent_phone = ? OR UPPER(linked_ward_prn) = UPPER(?)",
                   (parent_phone, ward_prn))
    parent = cursor.fetchone()
    if not parent:
        cursor.execute("SELECT * FROM parents LIMIT 1;")
        parent = cursor.fetchone()

    parent_data = row_to_dict(parent)
    linked_prn = parent_data.get("linked_ward_prn", ward_prn) if parent_data else ward_prn

    cursor.execute("SELECT * FROM students WHERE UPPER(prn) = UPPER(?)", (linked_prn,))
    student = cursor.fetchone()
    student_data = row_to_dict(student) if student else {}

    room_num = student_data.get("room_number", "B-304")

    # Roommates & Inventory
    cursor.execute("SELECT * FROM roommates WHERE room_number = ?", (room_num,))
    roommates = rows_to_list(cursor.fetchall())

    cursor.execute("SELECT * FROM room_inventory WHERE room_number = ?", (room_num,))
    inventory = rows_to_list(cursor.fetchall())

    conn.close()

    return jsonify({
        "success": True,
        "parent": parent_data,
        "ward": student_data,
        "roommates": roommates,
        "inventory": inventory,
        "rector": {
            "name": "Dr. V. K. Patil",
            "role": "Chief Rector (Block B)",
            "phone": "+91 98223 34455",
            "office": "Hostel Rector Office, Wing B"
        }
    })


# --------------------------------------------------------------------------
# 4. Complaints & Maintenance APIs
# --------------------------------------------------------------------------

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    prn = request.args.get("prn", "").strip()
    status_filter = request.args.get("status", "all").strip()
    search = request.args.get("search", "").strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if prn:
        query += " AND UPPER(student_prn) = UPPER(?)"
        params.append(prn)

    if status_filter and status_filter.lower() != "all":
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status_filter)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    complaints = rows_to_list(cursor.fetchall())

    # Apply in-memory search if provided
    if search:
        complaints = [
            c for c in complaints
            if search in c["title"].lower()
            or search in c["id"].lower()
            or search in c["category"].lower()
            or search in (c["description"] or "").lower()
        ]

    # Calculate count statistics
    cursor.execute("SELECT status, COUNT(*) as cnt FROM complaints GROUP BY status;")
    status_counts = {"all": 0, "inProgress": 0, "pending": 0, "resolved": 0}
    for row in cursor.fetchall():
        st = row["status"].lower()
        cnt = row["cnt"]
        status_counts["all"] += cnt
        if "progress" in st:
            status_counts["inProgress"] += cnt
        elif "pending" in st:
            status_counts["pending"] += cnt
        elif "resolved" in st:
            status_counts["resolved"] += cnt

    conn.close()

    return jsonify({
        "success": True,
        "complaints": complaints,
        "counts": status_counts
    })


@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    data = request.get_json(silent=True) or {}
    prn = data.get("prn", "2026AI042").strip()
    category = data.get("category", "General Maintenance").strip()
    priority = data.get("priority", "Medium").strip()
    room = data.get("room", "Room B-304 (Bed 2)").strip()
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    image_url = data.get("imageUrl", "")

    if not title or not description:
        return jsonify({"success": False, "message": "Title and description are required"}), 400

    # Auto-assign staff & scheduled time based on category
    staff_map = {
        "Electrical": ("Mr. Kailash (Electrician)", "+91 98220 54321", "Inspection scheduled within 4 hours"),
        "Plumbing": ("Mr. Santosh (Plumber)", "+91 98221 65432", "Inspection scheduled today by 4:00 PM"),
        "Internet / Wi-Fi": ("Campus IT Network Team", "+91 98222 76543", "Network check dispatched"),
        "Carpentry & Furniture": ("Mr. Ashok (Carpentry)", "+91 98223 87654", "Visit scheduled tomorrow morning"),
        "Cleanliness & Housekeeping": ("Housekeeping Wing Lead", "+91 98224 98765", "Cleaning staff notified"),
        "Mess & Food": ("Hostel Mess Committee Lead", "+91 98225 09876", "Reviewed by Mess Warden")
    }

    staff_info = staff_map.get(category, ("Maintenance Dispatch Desk", "+91 98220 00000", "Inspection scheduled within 24 hours"))

    ticket_id = f"TCK-{random.randint(310, 999)}"
    now_str = datetime.now().strftime("Today, %I:%M %p")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO complaints (
        id, student_prn, category, title, room, priority, status,
        lodged_date, description, assigned_to, technician_phone, scheduled_time, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, 'In Progress', ?, ?, ?, ?, ?, ?);
    """, (
        ticket_id, prn, category, title, room, priority,
        now_str, description, staff_info[0], staff_info[1], staff_info[2], image_url
    ))

    conn.commit()

    # Retrieve created record
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (ticket_id,))
    new_ticket = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Complaint #{ticket_id} lodged successfully!",
        "complaint": new_ticket
    }), 201


@app.route("/api/complaints/<ticket_id>/status", methods=["PATCH"])
def update_complaint_status(ticket_id):
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "Resolved").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    resolved_time = datetime.now().strftime("%d %b %Y, %I:%M %p") if new_status.lower() == "resolved" else None

    cursor.execute("""
    UPDATE complaints
    SET status = ?, resolved_date = COALESCE(?, resolved_date)
    WHERE id = ?;
    """, (new_status, resolved_time, ticket_id))

    conn.commit()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (ticket_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()

    if not updated:
        return jsonify({"success": False, "message": "Ticket not found"}), 404

    return jsonify({
        "success": True,
        "message": f"Ticket #{ticket_id} status updated to {new_status}",
        "complaint": updated
    })


# --------------------------------------------------------------------------
# 5. Leave Request & Digital Gate Pass APIs
# --------------------------------------------------------------------------

@app.route("/api/passes", methods=["GET"])
def get_passes():
    prn = request.args.get("prn", "").strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM leave_passes WHERE 1=1"
    params = []
    if prn:
        query += " AND UPPER(student_prn) = UPPER(?)"
        params.append(prn)

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    passes = rows_to_list(cursor.fetchall())

    # Count active approved passes
    active_count = sum(1 for p in passes if p.get("status") == "Approved" and p.get("active") == 1)
    pending_consent_passes = [p for p in passes if p.get("parent_consent_status") == "Pending" or p.get("status") == "Pending Parent Consent"]

    conn.close()

    return jsonify({
        "success": True,
        "passes": passes,
        "activeCount": active_count,
        "pendingConsentCount": len(pending_consent_passes),
        "pendingConsentPasses": pending_consent_passes
    })


@app.route("/api/passes", methods=["POST"])
def create_leave_pass():
    data = request.get_json(silent=True) or {}
    prn = data.get("prn", "2026AI042").strip()
    pass_type = data.get("type", "Local Evening Outing (Market)").strip()
    destination = data.get("destination", "").strip()
    from_date = data.get("from", "").strip() or datetime.now().strftime("Today, %I:%M %p")
    to_date = data.get("to", "").strip() or "Today, 09:30 PM"
    reason = data.get("reason", "").strip()

    if not destination or not reason:
        return jsonify({"success": False, "message": "Destination and Reason are required"}), 400

    pass_id = f"RCPIT-GP-{random.randint(8900, 9999)}"

    # Determine approval flow
    is_local = "local" in pass_type.lower()
    if is_local:
        status = "Approved"
        approved_by = "Dr. V. K. Patil (Chief Rector)"
        parent_consent_status = "Granted"
        note = "Auto-approved for local daytime outing"
    else:
        status = "Pending Parent Consent"
        approved_by = "Pending Rector Approval"
        parent_consent_status = "Pending"
        note = "Requires digital parent consent"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO leave_passes (
        id, student_prn, type, destination, from_date, to_date, reason,
        status, approved_by, parent_consent_status, parent_consent_note, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
    """, (
        pass_id, prn, pass_type, destination, from_date, to_date, reason,
        status, approved_by, parent_consent_status, note
    ))

    # Also automatically insert an alert into parent_notifications
    cursor.execute("SELECT parent_phone, name FROM students WHERE UPPER(prn) = UPPER(?)", (prn,))
    student_row = cursor.fetchone()
    parent_phone = student_row["parent_phone"] if student_row else "9423199880"
    student_name = student_row["name"] if student_row else "Rohit Sharma"

    notif_title = f"{pass_type}: {status.upper()}"
    notif_body = f"{student_name} ({prn}) applied for {pass_type} to '{destination}'. {note}."
    time_str = datetime.now().strftime("Today, %I:%M %p")

    cursor.execute("""
    INSERT INTO parent_notifications (
        parent_phone, student_prn, type, title, message, category,
        time_tag, border_color, dispatch_info, officer, is_read
    ) VALUES (?, ?, 'consent', ?, ?, 'urgent', ?, '#f59e0b', 'Pending Parent Digital Consent', 'Hostel Portal Automation', 0);
    """, (parent_phone, prn, notif_title, notif_body, time_str))

    conn.commit()

    cursor.execute("SELECT * FROM leave_passes WHERE id = ?", (pass_id,))
    new_pass = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Leave application #{pass_id} submitted successfully!",
        "pass": new_pass
    }), 201


@app.route("/api/passes/<pass_id>/parent-consent", methods=["POST"])
def parent_consent_action(pass_id):
    """Parent approves or declines digital leave consent."""
    data = request.get_json(silent=True) or {}
    action = data.get("action", "approve").lower()  # 'approve' | 'reject'
    parent_phone = data.get("parentPhone", "9423199880")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM leave_passes WHERE id = ?", (pass_id,))
    target_pass = cursor.fetchone()

    if not target_pass:
        # Fallback to the latest pending pass if pass_id not exact
        cursor.execute("SELECT * FROM leave_passes WHERE parent_consent_status = 'Pending' ORDER BY created_at DESC LIMIT 1;")
        target_pass = cursor.fetchone()

    if not target_pass:
        conn.close()
        return jsonify({"success": False, "message": "No pending leave pass found"}), 404

    actual_pass_id = target_pass["id"]

    if action == "approve":
        new_status = "Approved"
        consent_status = "Granted"
        approved_by = "Dr. V. K. Patil (Chief Rector)"
        note = f"Parent digital consent verified via Portal on {datetime.now().strftime('%d %b %Y at %I:%M %p')}."
    else:
        new_status = "Declined by Parent"
        consent_status = "Declined"
        approved_by = "Declined by Parent"
        note = f"Parent declined leave request on {datetime.now().strftime('%d %b %Y at %I:%M %p')}."

    cursor.execute("""
    UPDATE leave_passes
    SET status = ?, parent_consent_status = ?, approved_by = ?, parent_consent_note = ?
    WHERE id = ?;
    """, (new_status, consent_status, approved_by, note, actual_pass_id))

    # Add confirmation to parent notifications
    cursor.execute("""
    INSERT INTO parent_notifications (
        parent_phone, student_prn, type, title, message, category,
        time_tag, border_color, dispatch_info, officer, is_read
    ) VALUES (?, ?, 'consent', ?, ?, 'urgent', ?, '#10b981', 'Parent Portal Digital Signature Recorded', 'Dr. V. K. Patil (Chief Rector)', 0);
    """, (
        parent_phone,
        target_pass["student_prn"],
        f"Parent Consent: {consent_status.upper()} (#{actual_pass_id})",
        note,
        datetime.now().strftime("Today, %I:%M %p")
    ))

    conn.commit()

    cursor.execute("SELECT * FROM leave_passes WHERE id = ?", (actual_pass_id,))
    updated_pass = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Leave pass #{actual_pass_id} consent recorded as {consent_status}!",
        "pass": updated_pass
    })


# --------------------------------------------------------------------------
# 6. Night Roll Call & Attendance APIs
# --------------------------------------------------------------------------

@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    prn = request.args.get("prn", "2026AI042").strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM attendance WHERE UPPER(student_prn) = UPPER(?) ORDER BY id ASC", (prn,))
    records = rows_to_list(cursor.fetchall())

    if not records:
        cursor.execute("SELECT * FROM attendance ORDER BY id ASC")
        records = rows_to_list(cursor.fetchall())

    # Calculate statistics
    total_days = len(records) if records else 29
    present_days = sum(1 for r in records if r["status"] == "Present")
    leave_days = sum(1 for r in records if r["status"] == "On Leave")
    absent_days = sum(1 for r in records if r["status"] == "Absent")

    attendance_pct = round(((present_days + leave_days) / total_days * 100), 1) if total_days > 0 else 96.8

    conn.close()

    return jsonify({
        "success": True,
        "attendance": records,
        "stats": {
            "percentage": f"{attendance_pct}%",
            "presentDays": f"{present_days} Days",
            "leaveDays": f"{leave_days} Day" if leave_days == 1 else f"{leave_days} Days",
            "absentDays": f"{absent_days} Days",
            "month": "August 2026",
            "rollCallTime": "09:45 PM Daily"
        }
    })


# --------------------------------------------------------------------------
# 7. Notices & Circulars APIs
# --------------------------------------------------------------------------

@app.route("/api/notices", methods=["GET"])
def get_notices():
    category = request.args.get("category", "all").strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    if category and category != "all":
        cursor.execute("SELECT * FROM notices WHERE LOWER(category) = LOWER(?) AND is_active = 1 ORDER BY created_at DESC", (category,))
    else:
        cursor.execute("SELECT * FROM notices WHERE is_active = 1 ORDER BY created_at DESC")

    notices = rows_to_list(cursor.fetchall())
    conn.close()

    return jsonify({
        "success": True,
        "notices": notices,
        "count": len(notices)
    })


@app.route("/api/notices", methods=["POST"])
def create_notice():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    category = data.get("category", "general").strip().lower()
    cat_label = data.get("catLabel", "GENERAL CIRCULAR").strip().upper()
    body = data.get("body", "").strip()
    author = data.get("author", "Hostel Administration, RCPIT").strip()

    if not title or not body:
        return jsonify({"success": False, "message": "Title and body are required"}), 400

    notice_id = f"NTC-{random.randint(810, 999)}"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO notices (id, title, category, cat_label, date, body, author, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1);
    """, (notice_id, title, category, cat_label, now_str, body, author))

    conn.commit()
    cursor.execute("SELECT * FROM notices WHERE id = ?", (notice_id,))
    new_notice = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Notice #{notice_id} published successfully!",
        "notice": new_notice
    }), 201


# --------------------------------------------------------------------------
# 8. Parent Notifications & Alerts Feed APIs
# --------------------------------------------------------------------------

@app.route("/api/parent/notifications", methods=["GET"])
def get_parent_notifications():
    parent_phone = request.args.get("parentPhone", "9423199880").strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM parent_notifications WHERE parent_phone = ? ORDER BY id DESC", (parent_phone,))
    notifications = rows_to_list(cursor.fetchall())

    if not notifications:
        cursor.execute("SELECT * FROM parent_notifications ORDER BY id DESC")
        notifications = rows_to_list(cursor.fetchall())

    unread_count = sum(1 for n in notifications if n.get("is_read") == 0)
    conn.close()

    return jsonify({
        "success": True,
        "notifications": notifications,
        "unreadCount": unread_count
    })


@app.route("/api/parent/notifications/mark-read", methods=["POST"])
def mark_notifications_read():
    parent_phone = request.args.get("parentPhone", "9423199880").strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE parent_notifications SET is_read = 1 WHERE parent_phone = ?", (parent_phone,))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "All notifications marked as read."
    })


# --------------------------------------------------------------------------
# Server Main Entry
# --------------------------------------------------------------------------

if __name__ == "__main__":
    print("[Server] Starting RCPIT Hostel Management API Server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)