/**
 * RCPIT HOSTEL PORTAL - STUDENT & PARENTS MANAGEMENT SYSTEM
 * High-performance, reactive client controller with real-time feedback & dual role portals
 */

// ==========================================================================
// 1. GLOBAL STATE & MASTER DATA
// ==========================================================================

const APP_STATE = {
    currentRole: 'student', // 'student' | 'parent'
    activeStudentSection: 'section-overview',
    activeParentSection: 'parent-section-overview',
    currentUser: {
        name: 'Rohit Sharma',
        prn: '2026AI042',
        room: 'B-304',
        bed: '02',
        dept: 'B.Tech AI & Data Science (Yr 3)',
        email: 'rohit.sharma@rcpit.ac.in',
        phone: '+91 98765 43210',
        parentName: 'Mr. Rajesh Sharma',
        parentPhone: '+91 94231 99880'
    },
    complaints: [
        {
            id: 'TCK-309',
            category: 'Electrical',
            title: 'Ceiling Fan Speed Regulator Issue',
            room: 'Room B-304 (Bed 2)',
            priority: 'Medium',
            status: 'In Progress',
            date: 'Today, 10:15 AM',
            description: 'Fan is operating only at speed 5. Knob cannot decrease speed. Please repair regulator.',
            assignedTo: 'Mr. Kailash (Electrician)',
            technicianPhone: '+91 98220 54321',
            scheduledTime: 'Today, 04:30 PM'
        },
        {
            id: 'TCK-294',
            category: 'Plumbing',
            title: 'Bathroom Washbasin Tap Dripping',
            room: 'Room B-304',
            priority: 'Low',
            status: 'Resolved',
            date: '10 Aug 2026',
            description: 'Continuous water drip in washbasin tap causing wastage.',
            assignedTo: 'Mr. Santosh (Plumber)',
            resolvedDate: '11 Aug 2026, 03:00 PM'
        },
        {
            id: 'TCK-281',
            category: 'Internet / Wi-Fi',
            title: 'Wi-Fi Access Point Frequent Disconnects',
            room: 'Hostel Block B (3rd Floor)',
            priority: 'High',
            status: 'Resolved',
            date: '02 Aug 2026',
            description: 'Speed drops below 1 Mbps and drops frequent ping packets.',
            assignedTo: 'Campus IT Network Team',
            resolvedDate: '02 Aug 2026, 06:15 PM'
        }
    ],
    passes: [
        {
            id: 'RCPIT-GP-8842',
            type: 'Local Evening Outing (Market)',
            destination: 'Shirpur Market / Book Depot',
            from: '16 Aug 2026, 05:30 PM',
            to: '16 Aug 2026, 09:30 PM',
            reason: 'Purchase engineering drawing sheets & reference books.',
            status: 'Approved',
            approvedBy: 'Dr. V. K. Patil (Chief Rector)',
            active: true
        },
        {
            id: 'RCPIT-GP-8711',
            type: 'Weekend Home Visit',
            destination: 'Nashik (Flat 402, Gangapur Road)',
            from: '08 Aug 2026, 05:00 PM',
            to: '10 Aug 2026, 08:00 PM',
            reason: 'Sister birthday function and family gathering.',
            status: 'Completed',
            approvedBy: 'Dr. V. K. Patil (Chief Rector)',
            active: false
        }
    ],
    attendanceData: [
        { date: '16 Aug 2026 (Today)', time: 'Scheduled 09:45 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Pending Tonight', remarks: 'Roll call scheduled' },
        { date: '15 Aug 2026 (Sat)', time: '09:48 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Present', remarks: 'In-Room Verified' },
        { date: '14 Aug 2026 (Fri)', time: '09:46 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Present', remarks: 'In-Room Verified' },
        { date: '13 Aug 2026 (Thu)', time: '09:50 PM', mode: 'Biometric Handheld', warden: 'Prof. R. M. Deore', status: 'Present', remarks: 'In-Room Verified' },
        { date: '12 Aug 2026 (Wed)', time: '09:44 PM', mode: 'Biometric Handheld', warden: 'Prof. R. M. Deore', status: 'Present', remarks: 'In-Room Verified' },
        { date: '11 Aug 2026 (Tue)', time: '09:47 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Present', remarks: 'In-Room Verified' },
        { date: '10 Aug 2026 (Mon)', time: '09:45 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Present', remarks: 'Returned from Home' },
        { date: '09 Aug 2026 (Sun)', time: '--:--', mode: 'Official Gate Pass', warden: 'Dr. V. K. Patil', status: 'On Leave', remarks: 'Weekend Home Leave #8711' },
        { date: '08 Aug 2026 (Sat)', time: '09:52 PM', mode: 'Biometric Handheld', warden: 'Dr. V. K. Patil', status: 'Present', remarks: 'In-Room Verified' },
        { date: '07 Aug 2026 (Fri)', time: '09:46 PM', mode: 'Biometric Handheld', warden: 'Prof. R. M. Deore', status: 'Present', remarks: 'In-Room Verified' }
    ],
    notices: [
        {
            id: 'NTC-801',
            title: 'Hostel Night Roll Call Timings Strict Compliance',
            category: 'urgent',
            catLabel: 'URGENT NOTICE',
            date: '16 Aug 2026, 04:30 PM',
            body: 'All resident students of Block A, B & C must strictly report inside their allotted rooms by 09:45 PM for biometric roll call. Unexcused absence will trigger automated SMS alerts to registered parent contacts.',
            author: 'Chief Rector Office, RCPIT'
        },
        {
            id: 'NTC-798',
            title: 'Sunday Special Feast Dinner Menu - Mess Wing B',
            category: 'mess',
            catLabel: 'MESS COMMITTEE',
            date: '15 Aug 2026',
            body: 'Special Dinner Feast scheduled for this Sunday from 07:30 PM to 09:45 PM. Menu includes Paneer Butter Masala, Gulab Jamun, Jeera Rice, and Sweet Kheer.',
            author: 'Hostel Mess & Dining Committee'
        },
        {
            id: 'NTC-789',
            title: 'Mandatory Digital Gate Pass via Portal for Evening Outings',
            category: 'general',
            catLabel: 'GENERAL CIRCULAR',
            date: '12 Aug 2026',
            body: 'All local outing requests must be lodged via the Hostel Portal 1 hour before departure. Security guards at Gate 1 & 2 will scan QR passes on student smartphones before allowing exit.',
            author: 'Campus Security & Rectorate'
        },
        {
            id: 'NTC-775',
            title: 'Annual Room Inventory & Electrical Fixture Audit',
            category: 'general',
            catLabel: 'ADMINISTRATION',
            date: '05 Aug 2026',
            body: 'Annual inspection for fans, lights, tables, and study cots is currently underway. Please submit repair tickets via your student portal for any faulty regulators or taps.',
            author: 'Hostel Maintenance Dept'
        }
    ]
};


// ==========================================================================
// 2. DOM INITIALIZATION & EVENT LISTENERS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initAuthTabs();
    initAuthForms();
    initSidebarNavigation();
    initComplaintSystem();
    initLeaveSystem();
    initNoticesFiltering();
    initParentConsentActions();
    
    // Initial Render
    renderAllComplaints();
    renderAllPasses();
    renderAttendanceTables();
    renderNotices('all');
});


// ==========================================================================
// 3. LIVE CLOCK CONTROLLER
// ==========================================================================

function initLiveClock() {
    function updateClocks() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        document.querySelectorAll('.live-clock-target').forEach(el => {
            el.textContent = timeStr;
        });
    }
    updateClocks();
    setInterval(updateClocks, 1000);
}


// ==========================================================================
// 4. AUTHENTICATION & ROLE SWITCHER (STUDENT / PARENTS)
// ==========================================================================

function initAuthTabs() {
    const btnStudent = document.getElementById('role-btn-student');
    const btnParent = document.getElementById('role-btn-parent');
    
    if (btnStudent && btnParent) {
        btnStudent.addEventListener('click', () => setAuthRole('student'));
        btnParent.addEventListener('click', () => setAuthRole('parent'));
    }

    // Demo Buttons
    const demoStudentBtn = document.getElementById('btn-demo-student');
    const demoParentBtn = document.getElementById('btn-demo-parent');

    if (demoStudentBtn) {
        demoStudentBtn.addEventListener('click', () => {
            setAuthRole('student');
            loginToPortal('student');
        });
    }

    if (demoParentBtn) {
        demoParentBtn.addEventListener('click', () => {
            setAuthRole('parent');
            loginToPortal('parent');
        });
    }
}

function setAuthRole(role) {
    APP_STATE.currentRole = role;
    document.body.setAttribute('data-theme', role);

    const btnStudent = document.getElementById('role-btn-student');
    const btnParent = document.getElementById('role-btn-parent');
    const groupStudentPrn = document.getElementById('group-student-prn');
    const groupParentId = document.getElementById('group-parent-id');
    const groupParentWard = document.getElementById('group-parent-ward');
    const tagBadge = document.getElementById('portal-tag-badge');
    const tagText = document.getElementById('portal-tag-text');
    const btnSubmit = document.getElementById('btn-login-submit');
    const btnText = document.getElementById('btn-login-text');
    const authSubtitle = document.getElementById('auth-subtitle');

    if (role === 'student') {
        btnStudent?.classList.add('active');
        btnParent?.classList.remove('active');
        
        if (groupStudentPrn) groupStudentPrn.style.display = 'flex';
        if (groupParentId) groupParentId.style.display = 'none';
        if (groupParentWard) groupParentWard.style.display = 'none';

        if (tagBadge) tagBadge.classList.remove('parent-mode');
        if (tagText) tagText.textContent = 'Student Hostel Portal';
        if (btnSubmit) btnSubmit.classList.remove('parent-submit');
        if (btnText) btnText.textContent = 'Sign In to Student Portal';
        if (authSubtitle) authSubtitle.textContent = 'Enter your student credentials to access hostel resident services.';
    } else {
        btnParent?.classList.add('active');
        btnStudent?.classList.remove('active');
        
        if (groupStudentPrn) groupStudentPrn.style.display = 'none';
        if (groupParentId) groupParentId.style.display = 'flex';
        if (groupParentWard) groupParentWard.style.display = 'flex';

        if (tagBadge) tagBadge.classList.add('parent-mode');
        if (tagText) tagText.textContent = 'Parent Monitoring Portal';
        if (btnSubmit) btnSubmit.classList.add('parent-submit');
        if (btnText) btnText.textContent = 'Sign In to Parent Portal';
        if (authSubtitle) authSubtitle.textContent = 'Enter your registered parent mobile number & ward PRN to monitor your child.';
    }
}

function initAuthForms() {
    const loginForm = document.getElementById('portal-login-form');
    const togglePwBtn = document.getElementById('toggle-pw-btn');
    const pwInput = document.getElementById('input-password');

    if (togglePwBtn && pwInput) {
        togglePwBtn.addEventListener('click', () => {
            const isPassword = pwInput.type === 'password';
            pwInput.type = isPassword ? 'text' : 'password';
            togglePwBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginToPortal(APP_STATE.currentRole);
        });
    }
}

function loginToPortal(role) {
    const authView = document.getElementById('auth-view');
    const studentView = document.getElementById('student-dashboard-view');
    const parentView = document.getElementById('parent-dashboard-view');

    authView.style.display = 'none';

    if (role === 'student') {
        document.body.setAttribute('data-theme', 'student');
        if (studentView) studentView.style.display = 'flex';
        if (parentView) parentView.style.display = 'none';
        switchStudentSection('section-overview');
        showToast('Welcome back, Rohit Sharma! Logged in as Student.', 'success');
    } else {
        document.body.setAttribute('data-theme', 'parent');
        if (studentView) studentView.style.display = 'none';
        if (parentView) parentView.style.display = 'flex';
        switchParentSection('parent-section-overview');
        showToast('Welcome Mr. Rajesh Sharma! Accessing Ward Portal.', 'success');
    }
}

function signOutToAuth() {
    const authView = document.getElementById('auth-view');
    const studentView = document.getElementById('student-dashboard-view');
    const parentView = document.getElementById('parent-dashboard-view');

    if (studentView) studentView.style.display = 'none';
    if (parentView) parentView.style.display = 'none';
    if (authView) authView.style.display = 'flex';

    showToast('Signed out successfully.', 'info');
}


// ==========================================================================
// 5. SIDEBAR NAVIGATION & ROUTING
// ==========================================================================

function initSidebarNavigation() {
    // Student Sidebar Links
    document.querySelectorAll('.student-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) switchStudentSection(target);
        });
    });

    // Parent Sidebar Links
    document.querySelectorAll('.parent-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) switchParentSection(target);
        });
    });

    // Mobile Sidebar Toggles
    const studentToggle = document.getElementById('sidebar-toggle-btn-student');
    const parentToggle = document.getElementById('sidebar-toggle-btn-parent');
    const studentSidebar = document.getElementById('student-sidebar');
    const parentSidebar = document.getElementById('parent-sidebar');

    if (studentToggle && studentSidebar) {
        studentToggle.addEventListener('click', () => {
            studentSidebar.classList.toggle('open');
        });
    }

    if (parentToggle && parentSidebar) {
        parentToggle.addEventListener('click', () => {
            parentSidebar.classList.toggle('open');
        });
    }
}

function switchStudentSection(sectionId) {
    APP_STATE.activeStudentSection = sectionId;

    // Update active nav button
    document.querySelectorAll('.student-nav').forEach(btn => {
        if (btn.getAttribute('data-target') === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show target section
    document.querySelectorAll('.student-section').forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    // Close mobile sidebar if open
    document.getElementById('student-sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchParentSection(sectionId) {
    APP_STATE.activeParentSection = sectionId;

    // Update active nav button
    document.querySelectorAll('.parent-nav').forEach(btn => {
        if (btn.getAttribute('data-target') === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show target section
    document.querySelectorAll('.parent-section').forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    // Close mobile sidebar if open
    document.getElementById('parent-sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================================================
// 6. COMPLAINTS SYSTEM (SUBMIT, STATUS, FILTERS)
// ==========================================================================

function initComplaintSystem() {
    const form = document.getElementById('complaint-submission-form');
    const fileDropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('complaint-file');
    const filePreviewName = document.getElementById('file-preview-name');

    if (fileDropzone && fileInput) {
        fileDropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                filePreviewName.style.display = 'inline-block';
                filePreviewName.textContent = `📷 Attached: ${fileInput.files[0].name}`;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const category = document.getElementById('complaint-category').value;
            const priority = document.getElementById('complaint-priority').value;
            const room = document.getElementById('complaint-room').value;
            const title = document.getElementById('complaint-title').value;
            const description = document.getElementById('complaint-description').value;

            const newTicket = {
                id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
                category,
                priority,
                room,
                title,
                description,
                status: 'In Progress',
                date: 'Just Now',
                assignedTo: 'Maintenance Dispatch Desk',
                scheduledTime: 'Inspection scheduled within 4 hours'
            };

            APP_STATE.complaints.unshift(newTicket);
            renderAllComplaints();

            form.reset();
            if (filePreviewName) filePreviewName.style.display = 'none';

            showToast(`Complaint #${newTicket.id} lodged successfully!`, 'success');
            switchStudentSection('section-complaint-status');
        });
    }

    // Filter Buttons
    document.querySelectorAll('.student-cfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.student-cfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStudentComplaints(btn.getAttribute('data-filter'));
        });
    });

    document.querySelectorAll('.parent-cfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.parent-cfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderParentComplaints(btn.getAttribute('data-filter'));
        });
    });

    // Search Box
    const searchInput = document.getElementById('search-complaints');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            renderStudentComplaints('all', query);
        });
    }
}

function renderAllComplaints() {
    renderStudentComplaints('all');
    renderParentComplaints('all');

    // Update Counts
    const all = APP_STATE.complaints.length;
    const inprog = APP_STATE.complaints.filter(c => c.status === 'In Progress').length;
    const resolved = APP_STATE.complaints.filter(c => c.status === 'Resolved').length;

    const countAll = document.getElementById('count-all');
    const countInprog = document.getElementById('count-inprogress');
    const countResolved = document.getElementById('count-resolved');
    const countBadge = document.getElementById('badge-complaints-count');

    if (countAll) countAll.textContent = all;
    if (countInprog) countInprog.textContent = inprog;
    if (countResolved) countResolved.textContent = resolved;
    if (countBadge) countBadge.textContent = inprog;
}

function renderStudentComplaints(filter = 'all', searchQuery = '') {
    const container = document.getElementById('complaints-container');
    if (!container) return;

    let list = APP_STATE.complaints;
    if (filter !== 'all') {
        list = list.filter(c => c.status === filter);
    }
    if (searchQuery) {
        list = list.filter(c => c.title.toLowerCase().includes(searchQuery) || c.id.toLowerCase().includes(searchQuery) || c.category.toLowerCase().includes(searchQuery));
    }

    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:2rem; text-align:center; color:var(--text-muted);">No complaint records found for this filter.</div>`;
        return;
    }

    container.innerHTML = list.map(c => `
        <div class="complaint-ticket-card">
            <div class="complaint-card-top">
                <div>
                    <div class="complaint-id-row">
                        <span class="complaint-id">#${c.id}</span>
                        <span class="complaint-category-pill">${c.category}</span>
                        <span class="priority-tag ${c.priority.toLowerCase()}">${c.priority} Priority</span>
                    </div>
                    <h3>${c.title}</h3>
                </div>
                <span class="status-pill ${c.status === 'Resolved' ? 'active-approved' : 'pending'}">
                    ${c.status === 'Resolved' ? '✓ RESOLVED' : '⚙️ IN PROGRESS'}
                </span>
            </div>
            <p class="complaint-desc">${c.description}</p>
            <div class="complaint-card-meta">
                <div class="meta-field">
                    <label>Location</label>
                    <span>${c.room}</span>
                </div>
                <div class="meta-field">
                    <label>Assigned Staff</label>
                    <span>${c.assignedTo || 'Technician Assigned'}</span>
                </div>
                <div class="meta-field">
                    <label>Lodged On</label>
                    <span>${c.date}</span>
                </div>
            </div>
            <div class="complaint-card-footer">
                <span class="timeline-note">${c.status === 'Resolved' ? `Resolved on ${c.resolvedDate || '11 Aug 2026'}` : `Expected Resolution: ${c.scheduledTime || 'Within 24 hours'}`}</span>
            </div>
        </div>
    `).join('');
}

function renderParentComplaints(filter = 'all') {
    const container = document.getElementById('parent-complaints-container');
    if (!container) return;

    let list = APP_STATE.complaints;
    if (filter !== 'all') {
        list = list.filter(c => c.status === filter);
    }

    container.innerHTML = list.map(c => `
        <div class="complaint-ticket-card" style="border-left: 3px solid #10b981;">
            <div class="complaint-card-top">
                <div>
                    <div class="complaint-id-row">
                        <span class="complaint-id" style="color:#10b981;">#${c.id}</span>
                        <span class="complaint-category-pill">${c.category}</span>
                    </div>
                    <h3>${c.title}</h3>
                </div>
                <span class="status-pill ${c.status === 'Resolved' ? 'active-approved' : 'pending'}">
                    ${c.status === 'Resolved' ? '✓ RESOLVED' : '⚙️ IN PROGRESS'}
                </span>
            </div>
            <p class="complaint-desc">${c.description}</p>
            <div class="complaint-card-meta">
                <div class="meta-field">
                    <label>Room Fixture</label>
                    <span>${c.room}</span>
                </div>
                <div class="meta-field">
                    <label>Assigned Staff</label>
                    <span>${c.assignedTo || 'Maintenance Desk'}</span>
                </div>
                <div class="meta-field">
                    <label>Reported On</label>
                    <span>${c.date}</span>
                </div>
            </div>
        </div>
    `).join('');
}


// ==========================================================================
// 7. LEAVE REQUEST & GATE PASSES
// ==========================================================================

function initLeaveSystem() {
    const leaveForm = document.getElementById('leave-request-form');

    if (leaveForm) {
        // Set default dates
        const now = new Date();
        const returnDate = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours later

        const formatIso = (d) => {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const fromInput = document.getElementById('leave-from-date');
        const toInput = document.getElementById('leave-to-date');

        if (fromInput) fromInput.value = formatIso(now);
        if (toInput) toInput.value = formatIso(returnDate);

        leaveForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const type = document.getElementById('leave-type').value;
            const destination = document.getElementById('leave-destination').value;
            const reason = document.getElementById('leave-reason').value;

            const newPass = {
                id: `RCPIT-GP-${Math.floor(1000 + Math.random() * 9000)}`,
                type,
                destination,
                from: 'Today, 05:30 PM',
                to: 'Today, 09:30 PM',
                reason,
                status: 'Approved',
                approvedBy: 'Dr. V. K. Patil (Chief Rector)',
                active: true
            };

            APP_STATE.passes.unshift(newPass);
            renderAllPasses();
            showToast(`Leave pass #${newPass.id} submitted & approved!`, 'success');
        });
    }
}

function renderAllPasses() {
    const studentContainer = document.getElementById('passes-container');
    const parentContainer = document.getElementById('parent-passes-container');

    const html = APP_STATE.passes.map(p => `
        <div class="pass-card ${p.status === 'Approved' ? 'approved' : ''}">
            <div class="pass-card-head">
                <span class="pass-id">#${p.id}</span>
                <span class="pass-badge ${p.status.toLowerCase()}">${p.status.toUpperCase()}</span>
            </div>
            <h4>${p.type}</h4>
            <div class="pass-meta-grid">
                <div>
                    <span class="p-lbl">Destination</span>
                    <span class="p-val">${p.destination}</span>
                </div>
                <div>
                    <span class="p-lbl">Valid Return Time</span>
                    <span class="p-val" style="color:var(--accent-rose); font-weight:700;">${p.to}</span>
                </div>
                <div>
                    <span class="p-lbl">Authorized By</span>
                    <span class="p-val">${p.approvedBy}</span>
                </div>
                <div>
                    <span class="p-lbl">Security Scan</span>
                    <span class="p-val" style="color:var(--accent-emerald);">QR Verified</span>
                </div>
            </div>
            <p class="pass-sub"><strong>Reason:</strong> ${p.reason}</p>
        </div>
    `).join('');

    if (studentContainer) studentContainer.innerHTML = html;
    if (parentContainer) parentContainer.innerHTML = html;
}


// ==========================================================================
// 8. PARENT DIGITAL CONSENT ACTIONS
// ==========================================================================

function initParentConsentActions() {
    const btnApprove = document.getElementById('btn-parent-consent-approve');
    const btnReject = document.getElementById('btn-parent-consent-reject');
    const badge = document.getElementById('consent-status-badge');
    const actionBtns = document.getElementById('consent-action-buttons');

    if (btnApprove) {
        btnApprove.addEventListener('click', () => {
            if (badge) {
                badge.className = 'status-pill active-approved';
                badge.textContent = '✓ PARENT CONSENT GRANTED';
            }
            if (actionBtns) {
                actionBtns.innerHTML = `
                    <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:0.6rem 1rem; border-radius:var(--radius-md); color:#10b981; font-weight:700; font-size:0.85rem;">
                        ✓ Digital parent consent recorded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}. Pass forwarded to Rector for gate pass generation.
                    </div>
                `;
            }
            showToast('Digital parent consent granted for weekend leave!', 'success');
        });
    }

    if (btnReject) {
        btnReject.addEventListener('click', () => {
            if (badge) {
                badge.className = 'status-pill absent';
                badge.textContent = '✕ CONSENT DECLINED BY PARENT';
            }
            if (actionBtns) {
                actionBtns.innerHTML = `
                    <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:0.6rem 1rem; border-radius:var(--radius-md); color:#fca5a5; font-weight:700; font-size:0.85rem;">
                        ✕ Leave request declined. Notification sent to student Rohit Sharma.
                    </div>
                `;
            }
            showToast('Leave request declined.', 'warn');
        });
    }
}


// ==========================================================================
// 9. ATTENDANCE TABLES
// ==========================================================================

function renderAttendanceTables() {
    const studentTbody = document.getElementById('student-attendance-tbody');
    const parentTbody = document.getElementById('parent-attendance-tbody');

    const html = APP_STATE.attendanceData.map(row => `
        <tr>
            <td><strong>${row.date}</strong></td>
            <td>${row.time}</td>
            <td><span style="font-family:var(--font-mono); font-size:0.75rem;">${row.mode}</span></td>
            <td>${row.warden}</td>
            <td>
                <span class="status-pill ${row.status === 'Present' ? 'present' : row.status === 'On Leave' ? 'on-leave' : 'pending'}">
                    ${row.status}
                </span>
            </td>
            <td>${row.remarks}</td>
        </tr>
    `).join('');

    if (studentTbody) studentTbody.innerHTML = html;
    if (parentTbody) parentTbody.innerHTML = html;
}


// ==========================================================================
// 10. NOTICES & ALERTS
// ==========================================================================

function initNoticesFiltering() {
    document.querySelectorAll('.student-nfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.student-nfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNotices(btn.getAttribute('data-notice-cat'));
        });
    });

    document.querySelectorAll('.parent-nfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.parent-nfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNotices(btn.getAttribute('data-notice-cat'));
        });
    });
}

function renderNotices(category = 'all') {
    const studentContainer = document.getElementById('student-notices-container');
    const parentContainer = document.getElementById('parent-notices-container');

    let list = APP_STATE.notices;
    if (category !== 'all') {
        list = list.filter(n => n.category === category);
    }

    const html = list.map(n => `
        <div class="notice-detail-card ${n.category === 'urgent' ? 'urgent' : ''}">
            <div class="notice-badge-row">
                <span class="badge-${n.category}">${n.catLabel}</span>
                <span class="notice-time-pill">${n.date}</span>
            </div>
            <h3>${n.title}</h3>
            <p class="notice-body-full">${n.body}</p>
            <div class="notice-card-footer">
                <span class="authority-tag">Issued by: <strong>${n.author}</strong></span>
                <span>ID: ${n.id}</span>
            </div>
        </div>
    `).join('');

    if (studentContainer) studentContainer.innerHTML = html;
    if (parentContainer) parentContainer.innerHTML = html;
}


// ==========================================================================
// 11. TOAST NOTIFICATION UTILITY
// ==========================================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warn') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
