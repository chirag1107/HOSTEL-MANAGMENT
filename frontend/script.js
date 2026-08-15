// Hostel Management System - Interactive Role & Access Controller (RCPIT)

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const portalContainer = document.getElementById('portal-container');
    const authCard = document.getElementById('auth-card');
    const authForm = document.getElementById('auth-form');
    
    const roleBtns = document.querySelectorAll('.role-tab-btn');
    const portalSubtitle = document.getElementById('portal-subtitle');
    const portalBadge = document.getElementById('portal-badge');
    const securityNote = document.getElementById('security-note');
    const securityNoteText = document.getElementById('security-note-text');
    
    // Dynamic Input Groups
    const nameGroup = document.getElementById('name-group');
    const nameLabel = document.getElementById('name-label');
    const nameInput = document.getElementById('fullname');
    
    const primaryIdLabel = document.getElementById('primary-id-label');
    const primaryIdInput = document.getElementById('primary-id');
    const primaryIdInfo = document.getElementById('primary-id-info');
    
    const parentExtraGroup = document.getElementById('parent-extra-group');
    const rectorExtraGroup = document.getElementById('rector-extra-group');
    const adminExtraGroup = document.getElementById('admin-extra-group');
    
    const signinOptions = document.getElementById('signin-options');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    
    const signupPrompt = document.getElementById('signup-prompt');
    const toggleLink = document.getElementById('toggle-link');
    const toggleText = document.getElementById('toggle-text');
    const demoAccessBtn = document.getElementById('demo-access-btn');

    // Dashboard Elements
    const dashboardContainer = document.getElementById('dashboard-container');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userRoleTag = document.getElementById('user-role-tag');
    const btnSignout = document.getElementById('btn-signout');
    
    // Dashboard Role Views
    const studentDash = document.getElementById('student-dashboard-view');
    const parentDash = document.getElementById('parent-dashboard-view');
    const rectorDash = document.getElementById('rector-dashboard-view');
    const adminDash = document.getElementById('admin-dashboard-view');
    
    // State
    let currentRole = 'student';
    let isRegistering = false;

    // Preset Fallback Demo Data
    const demoProfiles = {
        student: { id: '2026AI042', name: 'Rohit Sharma', block: 'B-Block (Boys)', room: 'B-304' },
        parent: { id: 'parent.sharma@gmail.com', name: 'Mr. Rajesh Sharma', ward: 'Rohit Sharma (2026AI042)' },
        rector: { id: 'REC-104', name: 'Dr. V. K. Patil (Hostel Warden)', block: 'B-Block (Boys Senior)' },
        admin: { id: 'admin@rcpit.ac.in', name: 'Chief Campus Administrator', role: 'Super Admin' }
    };

    // Role Switching
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.getAttribute('data-role');
            
            // Switch body theme attribute
            body.setAttribute('data-active-theme', currentRole);
            
            if (currentRole === 'rector' || currentRole === 'admin') {
                isRegistering = false;
            }
            
            updateFormUI();
        });
    });

    // Toggle Sign In vs Register (Student & Parent)
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isRegistering = !isRegistering;
        updateFormUI();
    });

    // Quick Demo Direct Login Button
    demoAccessBtn.addEventListener('click', () => {
        launchDashboard(currentRole, true);
    });

    // Form Submit Handler
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        launchDashboard(currentRole, false);
    });

    // Sign Out Handler
    btnSignout.addEventListener('click', () => {
        dashboardContainer.style.display = 'none';
        authCard.style.display = 'block';
        portalContainer.classList.remove('dashboard-active');
        showToast('Signed out successfully. Welcome back to RCPIT Portal!', 'info');
    });

    // Update Auth Form UI
    function updateFormUI() {
        parentExtraGroup.style.display = 'none';
        rectorExtraGroup.style.display = 'none';
        adminExtraGroup.style.display = 'none';

        if (currentRole === 'student') {
            portalBadge.textContent = 'Student Portal';
            portalSubtitle.textContent = isRegistering ? 'Student Registration Portal' : 'Student Access Portal';
            securityNote.style.display = 'none';
            signupPrompt.style.display = 'block';
            
            primaryIdLabel.textContent = 'Student ID / Enrollment No.';
            primaryIdInfo.textContent = 'e.g. 2026AI001';
            primaryIdInput.placeholder = 'Enter PRN or Student ID (e.g. 2026AI042)';

            if (isRegistering) {
                nameGroup.style.display = 'block';
                nameLabel.textContent = 'Student Full Name';
                nameInput.placeholder = 'Enter your official full name';
                signinOptions.style.display = 'none';
                submitBtnText.textContent = 'Register Student Account';
                toggleText.textContent = 'Already registered?';
                toggleLink.textContent = 'Sign In';
            } else {
                nameGroup.style.display = 'none';
                signinOptions.style.display = 'flex';
                submitBtnText.textContent = 'Sign In as Student';
                toggleText.textContent = "Don't have an account?";
                toggleLink.textContent = 'Create Account';
            }

        } else if (currentRole === 'parent') {
            portalBadge.textContent = 'Parent Portal';
            portalSubtitle.textContent = isRegistering ? 'Parent Account Registration' : 'Parent Access Portal';
            securityNote.style.display = 'none';
            signupPrompt.style.display = 'block';
            parentExtraGroup.style.display = 'block';
            
            primaryIdLabel.textContent = 'Registered Mobile / Email';
            primaryIdInfo.textContent = 'OTP / Alerts registered';
            primaryIdInput.placeholder = 'e.g. parent@domain.com or 9876543210';

            if (isRegistering) {
                nameGroup.style.display = 'block';
                nameLabel.textContent = 'Parent / Guardian Full Name';
                nameInput.placeholder = 'Enter Parent full name';
                signinOptions.style.display = 'none';
                submitBtnText.textContent = 'Register Parent Account';
                toggleText.textContent = 'Already registered?';
                toggleLink.textContent = 'Sign In';
            } else {
                nameGroup.style.display = 'none';
                signinOptions.style.display = 'flex';
                submitBtnText.textContent = 'Sign In as Parent';
                toggleText.textContent = "Don't have an account?";
                toggleLink.textContent = 'Register Ward Parent';
            }

        } else if (currentRole === 'rector') {
            portalBadge.textContent = 'Rector & Warden Portal';
            portalSubtitle.textContent = 'Hostel Administration & Night Roll Call';
            securityNote.style.display = 'flex';
            securityNoteText.innerHTML = '<strong>Staff Notice:</strong> Rector and warden accounts are provisioned by college administration.';
            signupPrompt.style.display = 'none';
            nameGroup.style.display = 'none';
            signinOptions.style.display = 'flex';
            rectorExtraGroup.style.display = 'block';

            primaryIdLabel.textContent = 'Rector / Staff Employee ID';
            primaryIdInfo.textContent = 'Staff Code';
            primaryIdInput.placeholder = 'e.g. REC-104';
            submitBtnText.textContent = 'Sign In to Rector Panel';

        } else if (currentRole === 'admin') {
            portalBadge.textContent = 'System Admin Console';
            portalSubtitle.textContent = 'Central Hostel Control & Master Records';
            securityNote.style.display = 'flex';
            securityNoteText.innerHTML = '<strong>Restricted Access:</strong> Requires master encryption key and verified admin clearance.';
            signupPrompt.style.display = 'none';
            nameGroup.style.display = 'none';
            signinOptions.style.display = 'flex';
            adminExtraGroup.style.display = 'block';

            primaryIdLabel.textContent = 'Master Admin Username / Email';
            primaryIdInfo.textContent = 'Level-1 Superadmin';
            primaryIdInput.placeholder = 'e.g. admin@rcpit.ac.in';
            submitBtnText.textContent = 'Authenticate Master Admin';
        }
    }

    // Launch Role Dashboard
    function launchDashboard(role, isDemo = false) {
        authCard.style.display = 'none';
        portalContainer.classList.add('dashboard-active');
        dashboardContainer.style.display = 'block';

        studentDash.style.display = 'none';
        parentDash.style.display = 'none';
        rectorDash.style.display = 'none';
        adminDash.style.display = 'none';

        const customName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : null;
        const customId = primaryIdInput && primaryIdInput.value.trim() ? primaryIdInput.value.trim() : null;
        const defaultProfile = demoProfiles[role];

        const displayName = customName || (customId ? `User (${customId})` : defaultProfile.name);
        
        userAvatar.textContent = displayName.charAt(0).toUpperCase();
        userName.textContent = displayName;
        userRoleTag.textContent = role.toUpperCase();

        if (role === 'student') {
            studentDash.style.display = 'block';
            showToast(`Welcome back, ${displayName}! (Room B-304)`, 'success');
        } else if (role === 'parent') {
            parentDash.style.display = 'block';
            showToast(`Connected to Ward: ${defaultProfile.ward}`, 'success');
        } else if (role === 'rector') {
            rectorDash.style.display = 'block';
            showToast(`Warden Console: ${defaultProfile.block} Active`, 'success');
        } else if (role === 'admin') {
            adminDash.style.display = 'block';
            showToast('Master Admin Console Authorized & Ready', 'success');
        }
    }

    // Initialize all role actions
    setupStudentActions();
    setupParentActions();
    setupRectorActions();
    setupAdminActions();

    // Helper: Toast Notifications
    function showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'success' ? '✅' : (type === 'danger' ? '⚠️' : 'ℹ️');
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // =========================================================================
    // 1. STUDENT ACTIONS
    // =========================================================================
    function setupStudentActions() {
        const passForm = document.getElementById('student-pass-form');
        if (passForm) {
            passForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const passType = document.getElementById('pass-type').value;
                const passDate = document.getElementById('pass-date').value;
                const reason = document.getElementById('pass-reason').value.trim();
                
                showToast(`Gate Pass request for "${passType}" submitted to Rector & Parent!`, 'success');
                passForm.reset();
            });
        }

        const complaintForm = document.getElementById('student-complaint-form');
        if (complaintForm) {
            complaintForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
                showToast(`Complaint lodged successfully! Ticket #${ticketId} (Priority: Active)`, 'success');
                complaintForm.reset();
            });
        }
    }

    // =========================================================================
    // 2. PARENT ACTIONS
    // =========================================================================
    function setupParentActions() {
        const approveLeaveBtn = document.getElementById('parent-approve-leave-btn');
        const rejectLeaveBtn = document.getElementById('parent-reject-leave-btn');
        const parentStatusBadge = document.getElementById('parent-leave-status');

        if (approveLeaveBtn && parentStatusBadge) {
            approveLeaveBtn.addEventListener('click', () => {
                parentStatusBadge.className = 'status-pill approved';
                parentStatusBadge.textContent = 'Consent Approved by Parent ✓';
                approveLeaveBtn.style.display = 'none';
                if (rejectLeaveBtn) rejectLeaveBtn.style.display = 'none';
                showToast('Parent consent digitally signed & forwarded to Warden!', 'success');
            });
        }

        if (rejectLeaveBtn && parentStatusBadge) {
            rejectLeaveBtn.addEventListener('click', () => {
                parentStatusBadge.className = 'status-pill rejected';
                parentStatusBadge.textContent = 'Declined by Parent ✕';
                approveLeaveBtn.style.display = 'none';
                rejectLeaveBtn.style.display = 'none';
                showToast('Leave request declined.', 'danger');
            });
        }
    }

    // =========================================================================
    // 3. RECTOR ACTIONS
    // =========================================================================
    function setupRectorActions() {
        // Table Approve/Reject Buttons
        document.querySelectorAll('.rector-approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const studentName = row.cells[0].querySelector('strong').textContent.trim();
                const statusPill = row.querySelector('.status-pill');
                statusPill.className = 'status-pill approved';
                statusPill.textContent = 'Gate Pass Issued';
                e.target.parentElement.innerHTML = '<span style="color:#10b981; font-size:0.75rem; font-weight:700;">Approved QR ✓</span>';
                showToast(`Gate Pass QR generated and transmitted to ${studentName}`, 'success');
            });
        });

        document.querySelectorAll('.rector-reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const studentName = row.cells[0].querySelector('strong').textContent.trim();
                const statusPill = row.querySelector('.status-pill');
                statusPill.className = 'status-pill rejected';
                statusPill.textContent = 'Rejected';
                e.target.parentElement.innerHTML = '<span style="color:#ef4444; font-size:0.75rem; font-weight:700;">Rejected ✕</span>';
                showToast(`Leave rejected for ${studentName}`, 'danger');
            });
        });

        // Night Attendance Quick Check
        document.querySelectorAll('.roll-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                const statusPill = row.querySelector('.status-pill');
                const studentName = row.cells[1].textContent.trim();

                if (statusPill.classList.contains('present')) {
                    statusPill.className = 'status-pill absent';
                    statusPill.textContent = 'Absent / Unaccounted';
                    btn.textContent = 'Mark Present';
                    showToast(`${studentName} marked absent for night inspection`, 'danger');
                } else {
                    statusPill.className = 'status-pill present';
                    statusPill.textContent = 'Present in Room';
                    btn.textContent = 'Mark Absent';
                    showToast(`${studentName} marked present`, 'success');
                }
            });
        });

        // Broadcast Notice Form
        const noticeForm = document.getElementById('rector-notice-form');
        if (noticeForm) {
            noticeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('notice-title-input').value.trim();
                const target = document.getElementById('notice-target').value;
                const textarea = noticeForm.querySelector('textarea');
                const content = textarea ? textarea.value.trim() : '';

                if (!title) return;

                // Prepend to student notice lists
                const noticeList = document.querySelector('.notice-list');
                if (noticeList) {
                    const newItem = document.createElement('div');
                    newItem.className = 'notice-item';
                    newItem.style.animation = 'fadeIn 0.3s ease';
                    newItem.innerHTML = `
                        <div class="notice-meta">
                            <span>Warden Office • ${target}</span>
                            <span>Just Now</span>
                        </div>
                        <div class="notice-title">${title}</div>
                        <div class="notice-body">${content || 'Important hostel notice for all residents.'}</div>
                    `;
                    noticeList.insertBefore(newItem, noticeList.firstChild);
                }

                showToast(`Broadcast published to ${target}: "${title}"`, 'success');
                noticeForm.reset();
            });
        }
    }

    // =========================================================================
    // 4. ADMIN ACTIONS (MODALS, REGISTRY & EXPORT)
    // =========================================================================
    function setupAdminActions() {
        const addStudentBtn = document.getElementById('admin-add-student-btn');
        const allocateModal = document.getElementById('allocate-modal');
        const closeModalBtn = document.getElementById('close-allocate-modal');
        const cancelModalBtn = document.getElementById('cancel-allocate-btn');
        const allocateForm = document.getElementById('allocate-student-form');
        const studentTableBody = document.getElementById('admin-student-table-body');

        // Open Modal
        if (addStudentBtn && allocateModal) {
            addStudentBtn.addEventListener('click', () => {
                allocateModal.classList.add('active');
                const fullNameField = document.getElementById('alloc-fullname');
                if (fullNameField) fullNameField.focus();
            });
        }

        // Close Modal Handlers
        const closeModal = () => {
            if (allocateModal) allocateModal.classList.remove('active');
        };

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
        
        if (allocateModal) {
            allocateModal.addEventListener('click', (e) => {
                if (e.target === allocateModal) closeModal();
            });
        }

        // Handle Allocate Form Submission
        if (allocateForm) {
            allocateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('alloc-fullname').value.trim() || 'Yash Patil';
                const prn = document.getElementById('alloc-prn').value.trim() || '2026AI089';
                const dept = document.getElementById('alloc-dept').value;
                const year = document.getElementById('alloc-year').value;
                const block = document.getElementById('alloc-block').value;
                const room = document.getElementById('alloc-room').value.trim() || 'Room 312';
                const fee = document.getElementById('alloc-fee').value;

                // Create new row
                if (studentTableBody) {
                    const newRow = document.createElement('tr');
                    newRow.style.animation = 'fadeIn 0.4s ease';
                    newRow.style.background = 'rgba(139, 92, 246, 0.15)';
                    
                    const feeClass = fee.includes('Paid') ? 'paid' : (fee.includes('Due') ? 'unpaid' : 'pending');
                    
                    newRow.innerHTML = `
                        <td><strong>${prn}</strong></td>
                        <td>${name}</td>
                        <td>${dept} (${year})</td>
                        <td>${block} (${room})</td>
                        <td><span class="status-pill ${feeClass}">${fee}</span></td>
                        <td><button type="button" class="btn-action-sm">Edit</button></td>
                    `;
                    
                    studentTableBody.insertBefore(newRow, studentTableBody.firstChild);
                }

                allocateForm.reset();
                closeModal();
                showToast(`Student ${name} (${prn}) successfully allocated to ${block} (${room})!`, 'success');
            });
        }

        // Master CSV Export Simulation
        const exportReportBtn = document.getElementById('admin-export-report-btn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => {
                const csvData = "PRN,Name,Department,Block,Room,FeeStatus\n"
                    + "2026AI042,Rohit Sharma,B.Tech AI & DS,B-Block,Room 304,Paid\n"
                    + "2026CS019,Priya Mahajan,B.Tech Comp,C-Block,Room 108,Paid\n"
                    + "2026ME005,Kiran Chaudhari,B.Tech Mech,A-Block,Room 201,Due\n"
                    + "2026IT077,Tanmay Sonawane,B.Tech IT,B-Block,Room 115,Paid\n";
                
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'RCPIT_Hostel_Master_Registry_2026.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showToast('Master Hostel Registry exported: RCPIT_Hostel_Master_Registry_2026.csv', 'success');
            });
        }
    }

    // Initialize Default State
    updateFormUI();
});
