# RCPIT STUDENT & PARENT HOSTEL MANAGEMENT PORTAL

An integrated, role-based hostel management automation suite engineered for **R. C. Patel Institute of Technology, Shirpur**.

---

## 🏛️ Portal Modules Overview

### 🎓 1. Student Portal (9 Modules)
1. **🔑 Student Login**: PRN / Enrollment ID authentication with 1-Click Demo Login.
2. **👤 Student Profile**: Personal & academic credentials, digital resident ID card, and printable resident slip.
3. **🛏️ Room Details**: Allocated room (`B-304`), roommates directory, and furniture/fixture inventory status.
4. **✍️ Complaint Submit**: Categorized grievance lodging (Electrical, Plumbing, Wi-Fi, Carpentry, Housekeeping, Mess).
5. **📋 Complaint Status**: Real-time ticket tracker with filters (*All, In Progress, Pending, Resolved*) and search.
6. **📅 Attendance & Night Roll Call**: Daily 09:45 PM night roll call logs and monthly attendance statistics.
7. **📝 Leave Request & Gate Pass**: Outing and weekend pass generator with QR code and rector signature.
8. **📢 Hostel Notices**: Administrative circulars, mess feast menus, and curfew rules.
9. **👨‍👩‍👦 Parent Details**: Father/Mother contacts, WhatsApp links, permanent address, and local guardian info.

---

### 👨‍👩‍👦 2. Parent Portal (8 Modules)
1. **🔑 Parent Login**: Registered parent mobile/email and linked ward PRN with instant demo access.
2. **👤 Child Profile**: Institutional resident records and academic status of enrolled ward.
3. **🛏️ Child Room Details**: Ward room overview, roommate directory, and safety inspection status.
4. **📅 Child Attendance**: Daily biometric night roll call records and monthly attendance metrics.
5. **📝 Leave Req. Status**: Real-time pass status with **Parent Digital Consent / Decline** action.
6. **📋 Complaint Status**: Tracking room maintenance tickets raised by the ward.
7. **📢 Hostel Notices**: Official administrative advisories, mess committee notices, and circulars.
8. **🔔 Imp. Notifications**: Automated SMS dispatch logs, main gate exit/entry records, and fee payment receipts.

---

## 🚀 Running Locally

### Frontend:
- **Frontend Path**: `frontend/INDEX.HTML`
- **Local Server URL**: `http://localhost:8080` (or `http://localhost:8080/INDEX.HTML`)

### Backend (Flask):
- **Backend Path**: `backend/app.py`
- Run: `python backend/app.py`

---

## 📊 Development Flow & Current Status

```text
SMART HOSTEL MANAGEMENT - DEVELOPMENT FLOW

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
          │       CHIRAG        │
          └─────────────────────┘
                      │
                      ▼
          Database Tables & Fields
                 Required
                      │
                      ▼
          ┌─────────────────────┐
          │   BACKEND APIs      │
          │      BHAVESH        │
          └─────────────────────┘
                      │
                      ▼
        Backend + Database Integration
                      │
                      ▼
          Frontend + Backend Integration
                      │
                      ▼
               FINAL PROJECT
```

### Current Status:
- ✅ **Frontend (Student & Parent Portals)** - Completed
- ✅ **Backend Initial Setup (Flask)** - Completed
- ⏳ **Database** - In Progress (Chirag)
- ⏳ **Backend APIs** - Will start after database structure
- ⏳ **Database Integration** - Pending
- ⏳ **Frontend-Backend Integration** - Pending
