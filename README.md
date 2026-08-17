# HOSTEL MANAGEMENT APPLICATION

An integrated, role-based hostel management automation suite engineered for **R. C. Patel Institute of Technology, Shirpur**.

---

## 🏛️ Portal Modules Overview

### 🎓 1. Student Portal (9 Modules)
1. **🔑 Student Login**: PRN / Enrollment ID authentication with 1-Click Demo Login (`2026AI042` / `hostel123`).
2. **👤 Student Profile**: Personal & academic credentials, digital resident ID card, and printable resident slip.
3. **🛏️ Room Details**: Allocated room (`B-304`), roommates directory, and furniture/fixture inventory status.
4. **✍️ Complaint Submit**: Categorized grievance lodging (Electrical, Plumbing, Wi-Fi, Carpentry, Housekeeping, Mess) with live staff dispatch.
5. **📋 Complaint Status**: Real-time ticket tracker with filters (*All, In Progress, Pending, Resolved*) and instant search.
6. **📅 Attendance & Night Roll Call**: Daily 09:45 PM night roll call logs and monthly attendance statistics (96.8% rate).
7. **📝 Leave Request & Gate Pass**: Outing and weekend pass generator with QR code, parent consent linkage, and rector signature.
8. **📢 Hostel Notices**: Administrative circulars, mess feast menus, and curfew rules with category filters.
9. **👨‍👩‍👦 Parent Details**: Father/Mother contacts, WhatsApp direct links, permanent home address, and local guardian info.

---

### 👨‍👩‍👦 2. Parent Portal (8 Modules)
1. **🔑 Parent Login**: Registered parent mobile/email (`9423199880`) and linked ward PRN (`2026AI042`) with instant demo access.
2. **👤 Child Profile**: Institutional resident records, academic status, mentor details, and verified ward badge.
3. **🛏️ Child Room Details**: Ward room overview, roommate directory, and safety inspection inventory.
4. **📅 Child Attendance**: Daily biometric night roll call records and monthly attendance metrics.
5. **📝 Leave Req. Status**: Real-time pass status with **Parent Digital Consent / Decline** one-click action.
6. **📋 Complaint Status**: Tracking room maintenance tickets raised by the ward with assigned technician details.
7. **📢 Hostel Notices**: Official administrative advisories, mess committee notices, and security directives.
8. **🔔 Imp. Notifications**: Automated SMS dispatch logs, main gate exit/entry records, and fee payment receipts.

---

## 🚀 Running Locally

### 1. Start the Flask Backend Server
The backend is built with **Flask**, **Flask-CORS**, and persistent **SQLite3**.

```bash
# Navigate to project directory
cd b:\Z-SEM-PROJECT\HOSTEL-APP

# Run backend server
python backend/app.py
```
> The API server runs at: `http://127.0.0.1:5000`

### 2. Run Automated API Tests
To verify all database tables, authentication, complaints, leave requests, attendance, notices, and notifications:

```bash
python backend/test_api.py
```

### 3. Open the Frontend
Open `frontend/INDEX.HTML` directly in your browser, or serve with any static web server:

- Simply double-click `frontend/INDEX.HTML` in file explorer OR
- Run a local server: `python -m http.server 8080` and visit `http://localhost:8080/frontend/INDEX.HTML`

---

## 📊 Development Flow & Milestone Status

```text
SMART HOSTEL MANAGEMENT - COMPLETE SYSTEM ARCHITECTURE

                     START
                       │
                       ▼
               Project Setup
                       │
                       ▼
               Frontend Created (Student & Parent Portals)
                       │
                       ▼
           ┌─────────────────────┐
           │   Backend Setup     │
           │  Flask + Flask-CORS │
           └─────────────────────┘
                       │
                       ▼
                 app.py Created
                       │
                       ▼
              Flask Server Tested
                       │
                       ▼
           Backend Setup Completed
                       │
                       ▼
           ┌─────────────────────┐
           │ DATABASE CREATION   │
           │  SQLite3 Schema     │
           └─────────────────────┘
                       │
                       ▼
           Database Tables & Fields
                  Initialized
                       │
                       ▼
           ┌─────────────────────┐
           │   BACKEND APIs      │
           │   RESTful Endpoints │
           └─────────────────────┘
                       │
                       ▼
         Backend + Database Integration
                       │
                       ▼
           Frontend + Backend Integration
                       │
                       ▼
                ✅ FINAL PROJECT COMPLETED
```

### Milestone Status:
- ✅ **Frontend (Student & Parent Portals)** - Completed
- ✅ **Backend Setup (Flask + CORS)** - Completed
- ✅ **Database (SQLite3 Schema & Seeding)** - Completed
- ✅ **Backend RESTful APIs (9 Modules)** - Completed
- ✅ **Database Integration & Transactions** - Completed
- ✅ **Frontend-Backend Integration** - Completed
