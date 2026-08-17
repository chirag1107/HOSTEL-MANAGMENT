"""
RCPIT HOSTEL MANAGEMENT SYSTEM - DATABASE LAYER
SQLite-based persistent database with automated schema creation, indexing, and seed data.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hostel.db")


def get_db_connection():
    """Returns a SQLite connection with dict-like row factory and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initializes all required database tables and indices."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        prn TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL DEFAULT 'hostel123',
        department TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        dob TEXT,
        blood_group TEXT,
        photo_url TEXT,
        hostel_block TEXT NOT NULL,
        room_number TEXT NOT NULL,
        bed_number TEXT NOT NULL,
        admission_date TEXT,
        bio_punch_id TEXT,
        disciplinary_record TEXT DEFAULT 'Clean Record (Zero Infractions)',
        mess_token TEXT,
        fee_status TEXT DEFAULT 'Paid',
        fee_amount TEXT DEFAULT '₹65,000 Paid (No Dues)',
        parent_phone TEXT
    );
    """)

    # 2. Parents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS parents (
        parent_phone TEXT PRIMARY KEY,
        parent_name TEXT NOT NULL,
        email TEXT,
        password TEXT NOT NULL DEFAULT 'hostel123',
        occupation TEXT,
        mother_name TEXT,
        mother_phone TEXT,
        mother_occupation TEXT,
        address TEXT,
        distance_from_campus TEXT,
        travel_route TEXT,
        local_guardian_name TEXT,
        local_guardian_relation TEXT,
        local_guardian_address TEXT,
        local_guardian_phone TEXT,
        linked_ward_prn TEXT NOT NULL
    );
    """)

    # 3. Rooms Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        room_number TEXT PRIMARY KEY,
        block TEXT NOT NULL,
        floor TEXT NOT NULL,
        room_type TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 3,
        occupied_count INTEGER NOT NULL DEFAULT 3,
        amenities TEXT
    );
    """)

    # 4. Roommates Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roommates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT NOT NULL,
        prn TEXT NOT NULL,
        name TEXT NOT NULL,
        bed_number TEXT NOT NULL,
        department TEXT NOT NULL,
        phone TEXT NOT NULL,
        hometown TEXT NOT NULL,
        FOREIGN KEY (room_number) REFERENCES rooms(room_number)
    );
    """)

    # 5. Room Inventory Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS room_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT NOT NULL,
        item_name TEXT NOT NULL,
        item_tag TEXT NOT NULL,
        status TEXT NOT NULL,
        condition_class TEXT NOT NULL,
        icon TEXT NOT NULL,
        FOREIGN KEY (room_number) REFERENCES rooms(room_number)
    );
    """)

    # 6. Complaints Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        student_prn TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        room TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'In Progress',
        lodged_date TEXT NOT NULL,
        description TEXT NOT NULL,
        assigned_to TEXT,
        technician_phone TEXT,
        scheduled_time TEXT,
        resolved_date TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_prn) REFERENCES students(prn)
    );
    """)

    # 7. Leave Passes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leave_passes (
        id TEXT PRIMARY KEY,
        student_prn TEXT NOT NULL,
        type TEXT NOT NULL,
        destination TEXT NOT NULL,
        from_date TEXT NOT NULL,
        to_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Approved',
        approved_by TEXT,
        parent_consent_status TEXT DEFAULT 'Not Required',
        parent_consent_note TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_prn) REFERENCES students(prn)
    );
    """)

    # 8. Attendance Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_prn TEXT NOT NULL,
        date TEXT NOT NULL,
        inspection_time TEXT NOT NULL,
        verification_mode TEXT NOT NULL,
        warden TEXT NOT NULL,
        status TEXT NOT NULL,
        remarks TEXT,
        FOREIGN KEY (student_prn) REFERENCES students(prn)
    );
    """)

    # 9. Notices Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        cat_label TEXT NOT NULL,
        date TEXT NOT NULL,
        body TEXT NOT NULL,
        author TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 10. Parent Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS parent_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_phone TEXT NOT NULL,
        student_prn TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        time_tag TEXT NOT NULL,
        border_color TEXT DEFAULT '#38bdf8',
        dispatch_info TEXT,
        officer TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("[Database] All tables and indices initialized successfully.")


def seed_db():
    """Populates default dataset if tables are empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if student exists
    cursor.execute("SELECT COUNT(*) FROM students;")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    print("[Database] Seeding initial demo data...")

    # 1. Student
    cursor.execute("""
    INSERT INTO students (
        prn, name, email, phone, password, department, academic_year,
        dob, blood_group, photo_url, hostel_block, room_number,
        bed_number, admission_date, bio_punch_id, disciplinary_record,
        mess_token, fee_status, fee_amount, parent_phone
    ) VALUES (
        '2026AI042', 'Rohit Devendra Sharma', 'rohit.sharma@rcpit.ac.in', '+91 98765 43210', 'hostel123',
        'B.Tech - Artificial Intelligence & Data Science', 'Third Year (Semester VI)',
        '12 July 2004', 'O +ve', '', 'Block B (Boys Senior Hostel)', 'B-304',
        'Bed #02 (Window Side)', '01 July 2024', 'BIO-RCPIT-0942', 'Clean Record (Zero Infractions)',
        'Active Card #RCPIT-M-8821', 'Paid', '₹65,000 Paid (No Dues)', '9423199880'
    );
    """)

    # 2. Parent
    cursor.execute("""
    INSERT INTO parents (
        parent_phone, parent_name, email, password, occupation,
        mother_name, mother_phone, mother_occupation, address,
        distance_from_campus, travel_route, local_guardian_name,
        local_guardian_relation, local_guardian_address, local_guardian_phone,
        linked_ward_prn
    ) VALUES (
        '9423199880', 'Mr. Rajesh Devendra Sharma', 'rajesh.sharma.nashik@gmail.com', 'hostel123',
        'Senior Civil Engineer (PWD)', 'Mrs. Sunita Rajesh Sharma', '+91 94231 99881',
        'Professor / Homemaker', 'Flat No. 402, ''Shree Ganesh Heights'', Near Samarth Nagar Water Tank, Gangapur Road, Nashik, Maharashtra - 422013',
        '~185 km', 'MSRTC / NH-52', 'Mr. Mahendra S. Patil', 'Maternal Uncle (Resident of Shirpur)',
        '12, Karvand Naka Road, Shirpur', '+91 98901 23456', '2026AI042'
    );
    """)

    # 3. Room
    cursor.execute("""
    INSERT INTO rooms (
        room_number, block, floor, room_type, capacity, occupied_count, amenities
    ) VALUES (
        'B-304', 'Block B', '3rd Floor (East Wing)',
        '3-Sharing Deluxe Student Room with Attached Washroom & Balcony',
        3, 3, '["3 Bed Capacity", "High-Speed LAN + Wi-Fi", "24/7 Power Backup", "Solar Hot Water"]'
    );
    """)

    # 4. Roommates
    roommates = [
        ('B-304', '2026AI042', 'Rohit Sharma (You)', 'Bed #02', 'B.Tech AI & DS (Yr 3)', '+91 98765 43210', 'Nashik'),
        ('B-304', '2026CS108', 'Aditya Patil', 'Bed #01', 'B.Tech Computer Engg (Yr 3)', '+91 98234 11223', 'Jalgaon'),
        ('B-304', '2026IT055', 'Sameer Kulkarni', 'Bed #03', 'B.Tech Information Tech (Yr 3)', '+91 94032 88771', 'Pune')
    ]
    cursor.executemany("""
    INSERT INTO roommates (room_number, prn, name, bed_number, department, phone, hometown)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, roommates)

    # 5. Room Inventory
    inventory = [
        ('B-304', 'Study Cot & Mattress', 'Tag: B304-BED-2', 'Good', 'good', '🛏️'),
        ('B-304', 'Study Table & Chair', 'Tag: B304-TBL-2', 'Good', 'good', '📚'),
        ('B-304', 'Steel Almirah Locker', 'Tag: B304-LKR-2', 'Good', 'good', '🚪'),
        ('B-304', 'Tube light & Night Lamp', 'LED 20W', 'Working', 'good', '💡'),
        ('B-304', 'Ceiling Fan & Regulator', 'Regulator check required', 'Repair Open', 'repair', '🌀'),
        ('B-304', 'Gigabit LAN Port', 'Port #B304-P2', 'Active', 'good', '🌐')
    ]
    cursor.executemany("""
    INSERT INTO room_inventory (room_number, item_name, item_tag, status, condition_class, icon)
    VALUES (?, ?, ?, ?, ?, ?);
    """, inventory)

    # 6. Complaints
    complaints = [
        ('TCK-309', '2026AI042', 'Electrical', 'Ceiling Fan Speed Regulator Issue', 'Room B-304 (Bed 2)', 'Medium', 'In Progress', 'Today, 10:15 AM', 'Fan is operating only at speed 5. Knob cannot decrease speed. Please repair regulator.', 'Mr. Kailash (Electrician)', '+91 98220 54321', 'Today, 04:30 PM', None, None),
        ('TCK-294', '2026AI042', 'Plumbing', 'Bathroom Washbasin Tap Dripping', 'Room B-304', 'Low', 'Resolved', '10 Aug 2026', 'Continuous water drip in washbasin tap causing wastage.', 'Mr. Santosh (Plumber)', None, None, '11 Aug 2026, 03:00 PM', None),
        ('TCK-281', '2026AI042', 'Internet / Wi-Fi', 'Wi-Fi Access Point Frequent Disconnects', 'Hostel Block B (3rd Floor)', 'High', 'Resolved', '02 Aug 2026', 'Speed drops below 1 Mbps and drops frequent ping packets.', 'Campus IT Network Team', None, None, '02 Aug 2026, 06:15 PM', None)
    ]
    cursor.executemany("""
    INSERT INTO complaints (
        id, student_prn, category, title, room, priority, status,
        lodged_date, description, assigned_to, technician_phone, scheduled_time, resolved_date, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, complaints)

    # 7. Leave Passes
    passes = [
        ('RCPIT-GP-8842', '2026AI042', 'Local Evening Outing (Market)', 'Shirpur Market / Book Depot', '16 Aug 2026, 05:30 PM', '16 Aug 2026, 09:30 PM', 'Purchase engineering drawing sheets & reference books.', 'Approved', 'Dr. V. K. Patil (Chief Rector)', 'Granted', 'Auto-approved for local daytime outing', 1),
        ('RCPIT-GP-8711', '2026AI042', 'Weekend Home Visit', 'Nashik (Flat 402, Gangapur Road)', '08 Aug 2026, 05:00 PM', '10 Aug 2026, 08:00 PM', 'Sister birthday function and family gathering.', 'Completed', 'Dr. V. K. Patil (Chief Rector)', 'Granted', 'Parent digital consent verified via phone', 0),
        ('RCPIT-GP-8905', '2026AI042', 'Weekend Home Visit', 'Nashik (Flat 402, Gangapur Road)', '22 Aug 2026, 05:00 PM', '24 Aug 2026, 08:30 PM', 'Traveling to home (Nashik) via MSRTC Bus for cousin''s family celebration. Departure planned Friday evening.', 'Pending Parent Consent', 'Pending Rector Approval', 'Pending', None, 1)
    ]
    cursor.executemany("""
    INSERT INTO leave_passes (
        id, student_prn, type, destination, from_date, to_date, reason,
        status, approved_by, parent_consent_status, parent_consent_note, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, passes)

    # 8. Attendance Data
    attendance_records = [
        ('2026AI042', '16 Aug 2026 (Today)', 'Scheduled 09:45 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Pending Tonight', 'Roll call scheduled'),
        ('2026AI042', '15 Aug 2026 (Sat)', '09:48 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Present', 'In-Room Verified'),
        ('2026AI042', '14 Aug 2026 (Fri)', '09:46 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Present', 'In-Room Verified'),
        ('2026AI042', '13 Aug 2026 (Thu)', '09:50 PM', 'Biometric Handheld', 'Prof. R. M. Deore', 'Present', 'In-Room Verified'),
        ('2026AI042', '12 Aug 2026 (Wed)', '09:44 PM', 'Biometric Handheld', 'Prof. R. M. Deore', 'Present', 'In-Room Verified'),
        ('2026AI042', '11 Aug 2026 (Tue)', '09:47 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Present', 'In-Room Verified'),
        ('2026AI042', '10 Aug 2026 (Mon)', '09:45 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Present', 'Returned from Home'),
        ('2026AI042', '09 Aug 2026 (Sun)', '--:--', 'Official Gate Pass', 'Dr. V. K. Patil', 'On Leave', 'Weekend Home Leave #8711'),
        ('2026AI042', '08 Aug 2026 (Sat)', '09:52 PM', 'Biometric Handheld', 'Dr. V. K. Patil', 'Present', 'In-Room Verified'),
        ('2026AI042', '07 Aug 2026 (Fri)', '09:46 PM', 'Biometric Handheld', 'Prof. R. M. Deore', 'Present', 'In-Room Verified')
    ]
    cursor.executemany("""
    INSERT INTO attendance (student_prn, date, inspection_time, verification_mode, warden, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, attendance_records)

    # 9. Notices
    notices = [
        ('NTC-801', 'Hostel Night Roll Call Timings Strict Compliance', 'urgent', 'URGENT NOTICE', '16 Aug 2026, 04:30 PM', 'All resident students of Block A, B & C must strictly report inside their allotted rooms by 09:45 PM for biometric roll call. Unexcused absence will trigger automated SMS alerts to registered parent contacts.', 'Chief Rector Office, RCPIT', 1),
        ('NTC-798', 'Sunday Special Feast Dinner Menu - Mess Wing B', 'mess', 'MESS COMMITTEE', '15 Aug 2026', 'Special Dinner Feast scheduled for this Sunday from 07:30 PM to 09:45 PM. Menu includes Paneer Butter Masala, Gulab Jamun, Jeera Rice, and Sweet Kheer.', 'Hostel Mess & Dining Committee', 1),
        ('NTC-789', 'Mandatory Digital Gate Pass via Portal for Evening Outings', 'general', 'GENERAL CIRCULAR', '12 Aug 2026', 'All local outing requests must be lodged via the Hostel Portal 1 hour before departure. Security guards at Gate 1 & 2 will scan QR passes on student smartphones before allowing exit.', 'Campus Security & Rectorate', 1),
        ('NTC-775', 'Annual Room Inventory & Electrical Fixture Audit', 'general', 'ADMINISTRATION', '05 Aug 2026', 'Annual inspection for fans, lights, tables, and study cots is currently underway. Please submit repair tickets via your student portal for any faulty regulators or taps.', 'Hostel Maintenance Dept', 1)
    ]
    cursor.executemany("""
    INSERT INTO notices (id, title, category, cat_label, date, body, author, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, notices)

    # 10. Parent Notifications
    parent_notifs = [
        ('9423199880', '2026AI042', 'gate', 'Ward Exited Campus Main Gate', 'Your ward Rohit Sharma (2026AI042) has departed through Main Gate 1 on approved Local Evening Outing Pass #RCPIT-GP-8842. Biometric gate scanning verified. Return deadline is 09:30 PM tonight.', 'urgent', 'Today, 05:31 PM', '#38bdf8', 'SMS Delivered to +91 9423199880', 'Security Post 1', 0),
        ('9423199880', '2026AI042', 'roll_call', 'Night Roll Call Verified: PRESENT', 'Your ward was physically present in Room B-304 during the 09:45 PM night inspection conducted by Warden Dr. V. K. Patil. Biometric scanner match recorded.', 'urgent', '15 Aug 2026, 09:50 PM', '#10b981', 'Present in Room', 'Dr. V. K. Patil (Chief Rector)', 0),
        ('9423199880', '2026AI042', 'consent', 'Weekend Leave Consent Request from Ward', 'Rohit Sharma has submitted a request for Weekend Home Visit from 22 Aug to 24 Aug. Please review and provide digital consent under the Leave Req. Status tab.', 'urgent', '14 Aug 2026, 11:00 AM', '#f59e0b', 'Pending Parent Digital Signature', 'Hostel Portal Automation', 0),
        ('9423199880', '2026AI042', 'fee', 'Annual Hostel & Mess Fee Payment Cleared', 'Official fee receipt #RCPIT-H-9921 generated. Full academic year hostel fee of ₹65,000 received with zero dues remaining.', 'urgent', '01 July 2026', '#8b5cf6', 'Online NetBanking Cleared', 'RCPIT Central Hostel Trust', 0)
    ]
    cursor.executemany("""
    INSERT INTO parent_notifications (
        parent_phone, student_prn, type, title, message, category,
        time_tag, border_color, dispatch_info, officer, is_read
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, parent_notifs)

    conn.commit()
    conn.close()
    print("[Database] Initial seeding completed successfully.")


if __name__ == "__main__":
    init_db()
    seed_db()
