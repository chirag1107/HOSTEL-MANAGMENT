# RCPIT HOSTEL MANAGEMENT SYSTEM

An integrated, role-based hostel management automation suite engineered for **R. C. Patel Institute of Technology**.

---

## 🏛️ System Architecture & Workflow

```text
========================================================================================
                                RCPIT HOSTEL APP WORK FLOW
========================================================================================

  🎓 STUDENT                  👨‍👩‍👦 PARENT                 🛡️ RECTOR / WARDEN          ⚡ ADMIN
(Pass & Complaints)     (Consent & Attendance)      (Approvals & Roll Call)     (Master Registry)
        \                         /                          /                         /
         \                       /                          /                         /
          \                     /                          /                         /
           +-------------------+--------------------------+-------------------------+
                                              |
                                      [ USER INTERFACE ]
                                    (Kunal - Frontend Lead)
                                              |
                                     (REST API Requests)
                                              |
                                              v
                                     [ BACKEND ENGINE ]
                                    (Bhavesh - Server Logic)
                                              |
                                         (CRUD Ops)
                                              |
                                              v
                                    [ DATABASE STORAGE ]
                                    (Chirag - Database Lead)
                                (Himanshu - Co-Lead / Helper)
                                              |
                                  (Hosting & Live Deployment)
                                              |
                                              v
                                      [ LIVE DEPLOYMENT ]
```

---

## 🔑 Role Separation & Access Control

| Role                   | Access Identifier                     | Special Credentials         | Functional Modules                                                                                   |
| :--------------------- | :------------------------------------ | :-------------------------- | :--------------------------------------------------------------------------------------------------- |
| **🎓 Student**         | Student ID / PRN (e.g. `2026AI042`)   | Student Password            | Gate Pass & Leave Generator, Room Maintenance Tickets, Mess Smart Token & Menu, Fee Status           |
| **👨‍👩‍👦 Parent**          | Registered Mobile / Email             | Ward Student ID + Password  | Ward Real-time In/Out Logs, Parent Digital Consent for Passes, Fee Receipts, Warden Helpline         |
| **🛡️ Rector (Warden)** | Rector Staff ID (e.g. `REC-104`)      | Staff Password + Block Wing | Gate Pass Approval Queue, Night Roll Call / Inspection, Instant Broadcast Notices, Disciplinary Logs |
| **⚡ System Admin**    | Master Admin ID (`admin@rcpit.ac.in`) | Master Password + 2FA PIN   | Room Allocation Matrix, Student Master DB, Mess & AMC Billing, Security Audit Logs & CSV Export      |

---

## 🚀 Key Features

- **Dynamic Role Switcher**: Instant switching between 4 roles with contextual theme palettes and input controls.
- **Glassmorphism Dark UI**: Modern responsive design with smooth animations and ambient lighting.
- **Interactive Control Panels**: Functional tables with instant state management (Approve/Reject passes, Roll-call toggles, Maintenance logging).
- **Direct Demo Access**: One-click demo sign-in for testing any role instantly.
