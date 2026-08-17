/**
 * RCPIT HOSTEL PORTAL - STUDENT & PARENTS MANAGEMENT SYSTEM
 * Dynamic, reactive frontend controller connected to Flask REST API & SQLite Database
 */

// ==========================================================================
// 1. API CONFIGURATION & CLIENT SERVICE
// ==========================================================================

const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:5000/api',
    IS_CONNECTED: false
};

/**
 * Robust API helper with JSON handling and graceful offline fallback.
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
            throw new Error(errData.message || `Request failed with status ${response.status}`);
        }
        API_CONFIG.IS_CONNECTED = true;
        updateServerStatusIndicator(true);
        return await response.json();
    } catch (error) {
        console.warn(`[API] Connection warning on ${endpoint}:`, error.message);
        API_CONFIG.IS_CONNECTED = false;
        updateServerStatusIndicator(false);
        return { success: false, offline: true, error: error.message };
    }
}

function updateServerStatusIndicator(isOnline) {
    document.querySelectorAll('.status-indicator').forEach(ind => {
        if (isOnline) {
            ind.classList.remove('offline');
            ind.classList.add('online');
        } else {
            ind.classList.remove('online');
            ind.classList.add('offline');
        }
    });
}


// ==========================================================================
// 2. GLOBAL STATE & MASTER DATA
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
        parentPhone: '9423199880'
    },
    studentProfile: null,
    parentProfile: null,
    complaints: [],
    passes: [],
    attendanceData: [],
    attendanceStats: null,
    notices: [],
    parentNotifications: []
};


// ==========================================================================
// 3. DOM INITIALIZATION & LIFECYCLE
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    initLiveClock();
    initAuthTabs();
    initAuthForms();
    initSidebarNavigation();
    initComplaintSystem();
    initLeaveSystem();
    initNoticesFiltering();
    initParentConsentActions();

    // Check backend health and load initial data
    await checkBackendHealth();
    await loadInitialData();
});

async function checkBackendHealth() {
    const health = await apiCall('/health');
    if (health && health.success) {
        console.log('[System] Backend API & SQLite connected successfully.');
    } else {
        console.log('[System] Backend running in local/fallback mode.');
    }
}

async function loadInitialData() {
    await Promise.all([
        fetchStudentProfile('2026AI042'),
        fetchComplaints(),
        fetchPasses('2026AI042'),
        fetchAttendance('2026AI042'),
        fetchNotices('all'),
        fetchParentNotifications('9423199880')
    ]);
}


// ==========================================================================
// 4. LIVE CLOCK CONTROLLER
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
// 5. AUTHENTICATION & ROLE SWITCHER (STUDENT / PARENTS)
// ==========================================================================

function initAuthTabs() {
    const btnStudent = document.getElementById('role-btn-student');
    const btnParent = document.getElementById('role-btn-parent');

    if (btnStudent && btnParent) {
        btnStudent.addEventListener('click', () => setAuthRole('student'));
        btnParent.addEventListener('click', () => setAuthRole('parent'));
    }

    // Demo Login Buttons
    const demoStudentBtn = document.getElementById('btn-demo-student');
    const demoParentBtn = document.getElementById('btn-demo-parent');

    if (demoStudentBtn) {
        demoStudentBtn.addEventListener('click', async () => {
            setAuthRole('student');
            await handleLogin('student', '2026AI042', 'hostel123');
        });
    }

    if (demoParentBtn) {
        demoParentBtn.addEventListener('click', async () => {
            setAuthRole('parent');
            await handleLogin('parent', '9423199880', 'hostel123', '2026AI042');
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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('input-password')?.value || '';

            if (APP_STATE.currentRole === 'student') {
                const prn = document.getElementById('input-student-prn')?.value || '2026AI042';
                await handleLogin('student', prn, password);
            } else {
                const parentId = document.getElementById('input-parent-id')?.value || '9423199880';
                const wardPrn = document.getElementById('input-parent-ward')?.value || '2026AI042';
                await handleLogin('parent', parentId, password, wardPrn);
            }
        });
    }
}

async function handleLogin(role, identifier, password, wardPrn = '') {
    const alertBox = document.getElementById('auth-alert');
    const alertText = document.getElementById('auth-alert-text');
    const btnSubmit = document.getElementById('btn-login-submit');

    if (btnSubmit) {
        btnSubmit.style.opacity = '0.7';
        btnSubmit.style.pointerEvents = 'none';
    }

    const payload = {
        role,
        password,
        prn: role === 'student' ? identifier : wardPrn,
        parentId: role === 'parent' ? identifier : '',
        wardPrn: wardPrn
    };

    const res = await apiCall('/auth/login', 'POST', payload);

    if (btnSubmit) {
        btnSubmit.style.opacity = '1';
        btnSubmit.style.pointerEvents = 'auto';
    }

    if (res && res.success) {
        if (alertBox) alertBox.style.display = 'none';

        if (role === 'student') {
            APP_STATE.currentUser = { ...APP_STATE.currentUser, ...res.user };
            await fetchStudentProfile(res.user.prn);
            await fetchComplaints(res.user.prn);
            await fetchPasses(res.user.prn);
            await fetchAttendance(res.user.prn);
            loginToPortal('student');
        } else {
            APP_STATE.currentUser = { ...APP_STATE.currentUser, ...res.user };
            await fetchWardProfile(res.user.parent_phone, res.user.linked_ward_prn || wardPrn);
            await fetchComplaints(res.user.linked_ward_prn || wardPrn);
            await fetchPasses(res.user.linked_ward_prn || wardPrn);
            await fetchParentNotifications(res.user.parent_phone);
            loginToPortal('parent');
        }
    } else {
        // If offline fallback mode
        if (alertBox && alertText) {
            alertText.textContent = res.message || 'Login failed. Please check your credentials.';
            alertBox.style.display = 'flex';
        }
        // If demo fallback allowed:
        if (password === 'hostel123' || !res.error) {
            loginToPortal(role);
        } else {
            showToast(res.message || 'Invalid Credentials', 'warn');
        }
    }
}

function loginToPortal(role) {
    const authView = document.getElementById('auth-view');
    const studentView = document.getElementById('student-dashboard-view');
    const parentView = document.getElementById('parent-dashboard-view');

    if (authView) authView.style.display = 'none';

    if (role === 'student') {
        document.body.setAttribute('data-theme', 'student');
        if (studentView) studentView.style.display = 'flex';
        if (parentView) parentView.style.display = 'none';
        switchStudentSection('section-overview');
        showToast(`Welcome back, ${APP_STATE.currentUser.name || 'Student'}! Logged in to Student Portal.`, 'success');
    } else {
        document.body.setAttribute('data-theme', 'parent');
        if (studentView) studentView.style.display = 'none';
        if (parentView) parentView.style.display = 'flex';
        switchParentSection('parent-section-overview');
        showToast(`Welcome ${APP_STATE.currentUser.parent_name || 'Parent'}! Accessing Ward Portal.`, 'success');
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
// 6. SIDEBAR NAVIGATION & ROUTING
// ==========================================================================

function initSidebarNavigation() {
    // Student Navigation Links
    document.querySelectorAll('.student-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) switchStudentSection(target);
        });
    });

    // Parent Navigation Links
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

    document.querySelectorAll('.student-nav').forEach(btn => {
        if (btn.getAttribute('data-target') === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.student-section').forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    document.getElementById('student-sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchParentSection(sectionId) {
    APP_STATE.activeParentSection = sectionId;

    document.querySelectorAll('.parent-nav').forEach(btn => {
        if (btn.getAttribute('data-target') === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.parent-section').forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    document.getElementById('parent-sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================================================
// 7. DATA FETCHING SERVICES (STUDENT & PARENT PROFILES)
// ==========================================================================

async function fetchStudentProfile(prn = '2026AI042') {
    const res = await apiCall(`/student/profile?prn=${encodeURIComponent(prn)}`);
    if (res && res.success) {
        APP_STATE.studentProfile = res;
        renderStudentProfileData(res);
    }
}

async function fetchWardProfile(parentPhone = '9423199880', wardPrn = '2026AI042') {
    const res = await apiCall(`/parent/ward-profile?parentPhone=${encodeURIComponent(parentPhone)}&wardPrn=${encodeURIComponent(wardPrn)}`);
    if (res && res.success) {
        APP_STATE.parentProfile = res;
        renderParentProfileData(res);
    }
}

function renderStudentProfileData(data) {
    const s = data.student || {};
    const r = data.room || {};
    const p = data.parent || {};

    // Header User Profile Info
    document.querySelectorAll('.user-meta-name').forEach(el => {
        if (!el.closest('.parent-user-menu')) el.textContent = s.name || 'Rohit Sharma';
    });
    document.querySelectorAll('.user-meta-role').forEach(el => {
        if (!el.closest('.parent-user-menu')) el.textContent = `PRN: ${s.prn || '2026AI042'} • Room ${s.room_number || 'B-304'}`;
    });

    // Render Roommates in Section Room
    if (data.roommates && data.roommates.length > 0) {
        const roommatesContainer = document.querySelector('#section-room .roommates-list');
        if (roommatesContainer) {
            roommatesContainer.innerHTML = data.roommates.map(rm => `
                <div class="roommate-card ${rm.prn === s.prn ? 'current-user' : ''}">
                    <div class="roommate-avatar ${rm.prn === s.prn ? 'self' : ''}">${getInitials(rm.name)}</div>
                    <div class="roommate-info">
                        <div class="roommate-name-row">
                            <h4>${rm.name} ${rm.prn === s.prn ? '<span class="self-tag">(You)</span>' : ''}</h4>
                            <span class="bed-pill">${rm.bed_number}</span>
                        </div>
                        <p>PRN: ${rm.prn} • ${rm.department}</p>
                        <div class="roommate-contact">
                            <span>📞 ${rm.phone}</span>
                            <span>📍 Hometown: ${rm.hometown}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Room Inventory
    if (data.inventory && data.inventory.length > 0) {
        const inventoryGrid = document.querySelector('#section-room .inventory-grid');
        if (inventoryGrid) {
            inventoryGrid.innerHTML = data.inventory.map(inv => `
                <div class="inventory-item">
                    <span class="inv-icon">${inv.icon || '📦'}</span>
                    <div class="inv-info">
                        <strong>${inv.item_name}</strong>
                        <span>${inv.item_tag}</span>
                    </div>
                    <span class="inv-status ${inv.condition_class || 'good'}">${inv.status}</span>
                </div>
            `).join('');
        }
    }
}

function renderParentProfileData(data) {
    const ward = data.ward || {};
    const parent = data.parent || {};

    // Header Parent Profile
    const parentNameEl = document.querySelector('.parent-user-menu .user-meta-name');
    if (parentNameEl) parentNameEl.textContent = parent.parent_name || 'Mr. Rajesh Sharma';

    // Roommates list in parent portal
    if (data.roommates && data.roommates.length > 0) {
        const parentRoommates = document.querySelector('#parent-section-room .roommates-list');
        if (parentRoommates) {
            parentRoommates.innerHTML = data.roommates.map(rm => `
                <div class="roommate-card ${rm.prn === ward.prn ? 'current-user parent-user-card' : ''}">
                    <div class="roommate-avatar ${rm.prn === ward.prn ? 'self' : ''}" style="${rm.prn === ward.prn ? 'background:#10b981;' : ''}">${getInitials(rm.name)}</div>
                    <div class="roommate-info">
                        <div class="roommate-name-row">
                            <h4>${rm.name} ${rm.prn === ward.prn ? '<span class="self-tag" style="color:#10b981;">(Your Child)</span>' : ''}</h4>
                            <span class="bed-pill">${rm.bed_number}</span>
                        </div>
                        <p>PRN: ${rm.prn} • ${rm.department}</p>
                        <div class="roommate-contact">
                            <span>📞 ${rm.phone}</span>
                            <span>📍 Hometown: ${rm.hometown}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

function getInitials(name) {
    if (!name) return 'RS';
    const clean = name.replace('(You)', '').replace('Mr.', '').replace('Mrs.', '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
}


// ==========================================================================
// 8. COMPLAINTS SYSTEM (SUBMIT, STATUS, FILTERS)
// ==========================================================================

async function fetchComplaints(prn = '', filter = 'all', search = '') {
    const query = new URLSearchParams();
    if (prn) query.append('prn', prn);
    if (filter && filter !== 'all') query.append('status', filter);
    if (search) query.append('search', search);

    const res = await apiCall(`/complaints?${query.toString()}`);
    if (res && res.success) {
        APP_STATE.complaints = res.complaints;
        renderComplaintsList(res.complaints, filter);
        updateComplaintBadges(res.counts);
    } else {
        renderStudentComplaints(filter, search);
        renderParentComplaints(filter);
    }
}

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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const category = document.getElementById('complaint-category').value;
            const priority = document.getElementById('complaint-priority').value;
            const room = document.getElementById('complaint-room').value;
            const title = document.getElementById('complaint-title').value;
            const description = document.getElementById('complaint-description').value;

            const payload = {
                prn: APP_STATE.currentUser.prn || '2026AI042',
                category,
                priority,
                room,
                title,
                description
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>⏳ Submitting Ticket...</span>';
            }

            const res = await apiCall('/complaints', 'POST', payload);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>🛠️ Lodge Maintenance Complaint</span>';
            }

            if (res && res.success) {
                showToast(`Complaint #${res.complaint.id} lodged successfully!`, 'success');
                form.reset();
                if (filePreviewName) filePreviewName.style.display = 'none';
                await fetchComplaints(APP_STATE.currentUser.prn);
                switchStudentSection('section-complaint-status');
            } else {
                showToast(res.message || 'Failed to lodge complaint', 'warn');
            }
        });
    }

    // Filter Buttons (Student)
    document.querySelectorAll('.student-cfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.student-cfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            fetchComplaints(APP_STATE.currentUser.prn, filter);
        });
    });

    // Filter Buttons (Parent)
    document.querySelectorAll('.parent-cfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.parent-cfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            fetchComplaints(APP_STATE.currentUser.prn, filter);
        });
    });

    // Search Box
    const searchInput = document.getElementById('search-complaints');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = e.target.value.trim();
                fetchComplaints(APP_STATE.currentUser.prn, 'all', query);
            }, 300);
        });
    }
}

function updateComplaintBadges(counts) {
    if (!counts) return;
    const countAll = document.getElementById('count-all');
    const countInprog = document.getElementById('count-inprogress');
    const countPending = document.getElementById('count-pending');
    const countResolved = document.getElementById('count-resolved');
    const countBadge = document.getElementById('badge-complaints-count');
    const overviewComplaintVal = document.getElementById('overview-complaint-val');

    if (countAll) countAll.textContent = counts.all || 0;
    if (countInprog) countInprog.textContent = counts.inProgress || 0;
    if (countPending) countPending.textContent = counts.pending || 0;
    if (countResolved) countResolved.textContent = counts.resolved || 0;
    if (countBadge) countBadge.textContent = counts.inProgress || 0;
    if (overviewComplaintVal) overviewComplaintVal.textContent = `${counts.inProgress || 0} In Progress`;
}

function renderComplaintsList(list, filter = 'all') {
    const studentContainer = document.getElementById('complaints-container');
    const parentContainer = document.getElementById('parent-complaints-container');

    if (!list || list.length === 0) {
        const emptyHtml = `<div class="empty-state" style="padding:2.5rem; text-align:center; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-subtle);">No complaint records found for this filter.</div>`;
        if (studentContainer) studentContainer.innerHTML = emptyHtml;
        if (parentContainer) parentContainer.innerHTML = emptyHtml;
        return;
    }

    if (studentContainer) {
        studentContainer.innerHTML = list.map(c => `
            <div class="complaint-ticket-card">
                <div class="complaint-card-top">
                    <div>
                        <div class="complaint-id-row">
                            <span class="complaint-id">#${c.id}</span>
                            <span class="complaint-category-pill">${c.category}</span>
                            <span class="priority-tag ${(c.priority || 'medium').toLowerCase()}">${c.priority} Priority</span>
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
                        <span>${c.assigned_to || c.assignedTo || 'Technician Assigned'}</span>
                    </div>
                    <div class="meta-field">
                        <label>Lodged On</label>
                        <span>${c.lodged_date || c.date || 'Today'}</span>
                    </div>
                </div>
                <div class="complaint-card-footer">
                    <span class="timeline-note">${c.status === 'Resolved' ? `Resolved on ${c.resolved_date || c.resolvedDate || 'Today'}` : `Expected Resolution: ${c.scheduled_time || c.scheduledTime || 'Within 24 hours'}`}</span>
                </div>
            </div>
        `).join('');
    }

    if (parentContainer) {
        parentContainer.innerHTML = list.map(c => `
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
                        <span>${c.assigned_to || c.assignedTo || 'Maintenance Desk'}</span>
                    </div>
                    <div class="meta-field">
                        <label>Reported On</label>
                        <span>${c.lodged_date || c.date || 'Today'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}


// ==========================================================================
// 9. LEAVE REQUEST & GATE PASSES (STUDENT & PARENT CONSENT)
// ==========================================================================

async function fetchPasses(prn = '2026AI042') {
    const res = await apiCall(`/passes?prn=${encodeURIComponent(prn)}`);
    if (res && res.success) {
        APP_STATE.passes = res.passes;
        renderAllPasses(res.passes);
        updatePendingConsentBanner(res.pendingConsentPasses);
    }
}

function initLeaveSystem() {
    const leaveForm = document.getElementById('leave-request-form');

    if (leaveForm) {
        const now = new Date();
        const returnDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);

        const formatIso = (d) => {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const fromInput = document.getElementById('leave-from-date');
        const toInput = document.getElementById('leave-to-date');

        if (fromInput) fromInput.value = formatIso(now);
        if (toInput) toInput.value = formatIso(returnDate);

        leaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const type = document.getElementById('leave-type').value;
            const destination = document.getElementById('leave-destination').value;
            const reason = document.getElementById('leave-reason').value;

            const fromVal = fromInput ? new Date(fromInput.value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today, 05:30 PM';
            const toVal = toInput ? new Date(toInput.value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today, 09:30 PM';

            const payload = {
                prn: APP_STATE.currentUser.prn || '2026AI042',
                type,
                destination,
                from: fromVal,
                to: toVal,
                reason
            };

            const submitBtn = leaveForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>⏳ Submitting Application...</span>';
            }

            const res = await apiCall('/passes', 'POST', payload);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>🚀 Submit Leave Application to Rector</span>';
            }

            if (res && res.success) {
                showToast(`Leave pass #${res.pass.id} submitted! Status: ${res.pass.status}`, 'success');
                leaveForm.reset();
                await fetchPasses(APP_STATE.currentUser.prn);
            } else {
                showToast(res.message || 'Failed to submit leave request', 'warn');
            }
        });
    }
}

function renderAllPasses(passes) {
    const studentContainer = document.getElementById('passes-container');
    const parentContainer = document.getElementById('parent-passes-container');

    if (!passes || passes.length === 0) {
        const emptyHtml = `<div style="padding:2rem; text-align:center; color:var(--text-muted);">No pass records found.</div>`;
        if (studentContainer) studentContainer.innerHTML = emptyHtml;
        if (parentContainer) parentContainer.innerHTML = emptyHtml;
        return;
    }

    const html = passes.map(p => `
        <div class="pass-card ${p.status === 'Approved' ? 'approved' : p.status.includes('Pending') ? 'pending-card' : ''}">
            <div class="pass-card-head">
                <span class="pass-id">#${p.id}</span>
                <span class="pass-badge ${(p.status || 'pending').toLowerCase().replace(/\s+/g, '-')}">${p.status.toUpperCase()}</span>
            </div>
            <h4>${p.type}</h4>
            <div class="pass-meta-grid">
                <div>
                    <span class="p-lbl">Destination</span>
                    <span class="p-val">${p.destination}</span>
                </div>
                <div>
                    <span class="p-lbl">Valid Return Time</span>
                    <span class="p-val" style="color:var(--accent-rose); font-weight:700;">${p.to_date || p.to}</span>
                </div>
                <div>
                    <span class="p-lbl">Authorized By</span>
                    <span class="p-val">${p.approved_by || p.approvedBy || 'Pending'}</span>
                </div>
                <div>
                    <span class="p-lbl">Parent Consent</span>
                    <span class="p-val" style="color:${p.parent_consent_status === 'Granted' ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${p.parent_consent_status || 'Pending'}</span>
                </div>
            </div>
            <p class="pass-sub"><strong>Reason:</strong> ${p.reason}</p>
        </div>
    `).join('');

    if (studentContainer) studentContainer.innerHTML = html;
    if (parentContainer) parentContainer.innerHTML = html;
}

function updatePendingConsentBanner(pendingPasses) {
    const consentBox = document.getElementById('parent-consent-box');
    const consentStatusBadge = document.getElementById('consent-status-badge');
    const consentActionBtns = document.getElementById('consent-action-buttons');

    if (!pendingPasses || pendingPasses.length === 0) {
        if (consentStatusBadge) {
            consentStatusBadge.className = 'status-pill active-approved';
            consentStatusBadge.textContent = '✓ ALL CONSENTS UP-TO-DATE';
        }
        if (consentActionBtns) {
            consentActionBtns.innerHTML = `
                <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); padding:0.6rem 1rem; border-radius:var(--radius-md); color:#10b981; font-weight:600; font-size:0.85rem;">
                    ✓ No pending leave requests requiring parent digital consent at this time.
                </div>
            `;
        }
    }
}

function initParentConsentActions() {
    const btnApprove = document.getElementById('btn-parent-consent-approve');
    const btnReject = document.getElementById('btn-parent-consent-reject');
    const badge = document.getElementById('consent-status-badge');
    const actionBtns = document.getElementById('consent-action-buttons');

    if (btnApprove) {
        btnApprove.addEventListener('click', async () => {
            btnApprove.disabled = true;
            btnApprove.textContent = 'Recording Consent...';

            const res = await apiCall('/passes/RCPIT-GP-8905/parent-consent', 'POST', {
                action: 'approve',
                parentPhone: '9423199880'
            });

            btnApprove.disabled = false;

            if (res && res.success) {
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
                await fetchPasses(APP_STATE.currentUser.prn);
                await fetchParentNotifications('9423199880');
            } else {
                showToast(res.message || 'Consent updated', 'info');
            }
        });
    }

    if (btnReject) {
        btnReject.addEventListener('click', async () => {
            const res = await apiCall('/passes/RCPIT-GP-8905/parent-consent', 'POST', {
                action: 'reject',
                parentPhone: '9423199880'
            });

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
            await fetchPasses(APP_STATE.currentUser.prn);
        });
    }
}


// ==========================================================================
// 10. ATTENDANCE & NIGHT ROLL CALL
// ==========================================================================

async function fetchAttendance(prn = '2026AI042') {
    const res = await apiCall(`/attendance?prn=${encodeURIComponent(prn)}`);
    if (res && res.success) {
        APP_STATE.attendanceData = res.attendance;
        APP_STATE.attendanceStats = res.stats;
        renderAttendanceTables(res.attendance);
    }
}

function renderAttendanceTables(records) {
    const studentTbody = document.getElementById('student-attendance-tbody');
    const parentTbody = document.getElementById('parent-attendance-tbody');

    if (!records || records.length === 0) return;

    const html = records.map(row => `
        <tr>
            <td><strong>${row.date}</strong></td>
            <td>${row.inspection_time || row.time}</td>
            <td><span style="font-family:var(--font-mono); font-size:0.75rem;">${row.verification_mode || row.mode}</span></td>
            <td>${row.warden}</td>
            <td>
                <span class="status-pill ${row.status === 'Present' ? 'present' : row.status === 'On Leave' ? 'on-leave' : 'pending'}">
                    ${row.status}
                </span>
            </td>
            <td>${row.remarks || 'Verified'}</td>
        </tr>
    `).join('');

    if (studentTbody) studentTbody.innerHTML = html;
    if (parentTbody) parentTbody.innerHTML = html;
}


// ==========================================================================
// 11. NOTICES & ANNOUNCEMENTS
// ==========================================================================

async function fetchNotices(category = 'all') {
    const res = await apiCall(`/notices?category=${encodeURIComponent(category)}`);
    if (res && res.success) {
        APP_STATE.notices = res.notices;
        renderNotices(res.notices);
    }
}

function initNoticesFiltering() {
    document.querySelectorAll('.student-nfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.student-nfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-notice-cat');
            fetchNotices(cat);
        });
    });

    document.querySelectorAll('.parent-nfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.parent-nfilter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-notice-cat');
            fetchNotices(cat);
        });
    });
}

function renderNotices(list) {
    const studentContainer = document.getElementById('student-notices-container');
    const parentContainer = document.getElementById('parent-notices-container');

    if (!list || list.length === 0) return;

    const html = list.map(n => `
        <div class="notice-detail-card ${n.category === 'urgent' ? 'urgent' : ''}">
            <div class="notice-badge-row">
                <span class="badge-${n.category}">${n.cat_label || n.catLabel || 'NOTICE'}</span>
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
// 12. PARENT NOTIFICATIONS & ALERTS FEED
// ==========================================================================

async function fetchParentNotifications(parentPhone = '9423199880') {
    const res = await apiCall(`/parent/notifications?parentPhone=${encodeURIComponent(parentPhone)}`);
    if (res && res.success) {
        APP_STATE.parentNotifications = res.notifications;
        renderParentNotifications(res.notifications);

        const badge = document.getElementById('parent-notif-badge');
        if (badge) badge.textContent = res.unreadCount || res.notifications.length;
    }
}

function renderParentNotifications(notifications) {
    const feed = document.getElementById('parent-alerts-feed');
    if (!feed || !notifications || notifications.length === 0) return;

    feed.innerHTML = notifications.map(notif => `
        <div class="notice-detail-card urgent" style="border-left-color: ${notif.border_color || '#38bdf8'};">
            <div class="notice-badge-row">
                <span class="badge-general" style="background:rgba(56,189,248,0.18); color:${notif.border_color || '#38bdf8'};">🔔 ${notif.type.toUpperCase()}</span>
                <span class="notice-time-pill">${notif.time_tag}</span>
            </div>
            <h3>${notif.title}</h3>
            <p class="notice-body-full">${notif.message}</p>
            <div class="notice-card-footer">
                <span>Dispatch: <strong>${notif.dispatch_info || 'Automated Portal Dispatch'}</strong></span>
                <span>Officer: <strong>${notif.officer || 'Hostel Rector'}</strong></span>
            </div>
        </div>
    `).join('');
}


// ==========================================================================
// 13. TOAST NOTIFICATION UTILITY
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
