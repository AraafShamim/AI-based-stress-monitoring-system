/**
 * Counsellor Dashboard - MannSetu
 * Functional counsellor dashboard with real backend integration
 */

import apiService from '../../services/apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    setupUI();
});

async function initializePage() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/login.html';
        return;
    }

    // Load user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update profile with real user data
    const profileElements = document.querySelectorAll('.counsellor-profile strong, .profile-info h4');
    profileElements.forEach(el => {
        if (user.name) el.textContent = user.name;
    });

    // Load dashboard data
    try {
        const summary = await apiService.getDashboardSummary();
        if (summary) {
            updateDashboardStats(summary);
            loadAlerts();
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }

    // Update date
    updateDate();
}

function updateDashboardStats(data) {
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateElement('totalClients', data.total_monitored_victims || 0);
    updateElement('activeClients', data.total_monitored_victims || 0);
    updateElement('highRisk', data.high_risk_cases || 0);
    updateElement('criticalRisk', data.critical_cases || 0);
    updateElement('moderateRisk', data.moderate_risk_cases || 0);
    updateElement('lowRisk', data.low_risk_cases || 0);
}

async function loadAlerts() {
    try {
        const alertsData = await apiService.getAlerts('OPEN', 0, 10);

        const container = document.getElementById('openAlertsContainer');
        if (!container) return;

        const alerts = alertsData.content || [];
        container.innerHTML = '';

        if (alerts.length === 0) {
            container.innerHTML = '<p style="padding: 1rem; color: var(--text-2);">No open priority alerts at this time.</p>';
            return;
        }

        alerts.forEach(alert => {
            const riskColor = alert.victim?.currentRiskTier === 'CRITICAL' ? '#FF6B6B' : '#FFA500';
            const alertHtml = `
                <div class="alert-item" style="border-left: 4px solid ${riskColor};">
                    <div class="alert-icon"><i data-lucide="alert-triangle"></i></div>
                    <div class="alert-copy">
                        <strong>${alert.thresholdCrossed || 'High Risk Alert'}</strong>
                        <span>Victim: ${alert.victim?.id?.substring(0, 8) || 'Unknown'}... · ${alert.victim?.currentRiskTier || 'UNKNOWN'} Risk</span>
                        <small>${new Date(alert.createdAt).toLocaleString()}</small>
                    </div>
                    <button class="review-button" onclick="ackAlert('${alert.id}')">Ack</button>
                </div>`;
            container.innerHTML += alertHtml;
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
    }
}

window.ackAlert = async function(alertId) {
    try {
        await apiService.acknowledgeAlert(alertId, 'ACKNOWLEDGED', 'Acknowledged via Dashboard');
        alert('Alert acknowledged successfully!');
        loadAlerts(); // Refresh
    } catch (error) {
        console.error('Failed to acknowledge alert:', error);
        alert('Failed to acknowledge alert.');
    }
};

function setupUI() {
    // Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Sidebar toggle
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    if (menuButton && sidebar) {
        menuButton.addEventListener('click', () => {
            sidebar.classList.add('sidebar-open');
        });
    }

    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
        });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item[data-nav]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sidebar.classList.remove('sidebar-open');

            // Show toast notification
            const navName = item.dataset.nav;
            showToast(`${navName} selected`);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                apiService.logout();
                window.location.href = '../../auth/login.html';
            }
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showToast('Settings ready to customize');
        });
    }

    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPopover = document.getElementById('notificationPopover');

    if (notificationBtn && notificationPopover) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPopover.hidden = !notificationPopover.hidden;
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-wrap')) {
                notificationPopover.hidden = true;
            }
        });

        const markRead = document.getElementById('markRead');
        if (markRead) {
            markRead.addEventListener('click', () => {
                notificationPopover.hidden = true;
                showToast('Notifications marked as read');
            });
        }
    }

    // Client search
    const clientSearch = document.getElementById('clientSearch');
    const clientTable = document.getElementById('clientTable');

    if (clientSearch && clientTable) {
        clientSearch.addEventListener('input', () => {
            const term = clientSearch.value.trim().toLowerCase();
            const rows = clientTable.querySelectorAll('tr');

            rows.forEach(row => {
                const client = row.dataset.client?.toLowerCase() || '';
                const matches = client.includes(term);
                row.style.display = matches ? '' : 'none';
            });
        });
    }

    // Client view buttons
    const clientViewBtns = document.querySelectorAll('.client-view');
    clientViewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.currentTarget.closest('tr');
            const client = row?.dataset.client || 'Client';
            showToast(`Opening ${client}'s profile`);
        });
    });

    // Period tabs for trends
    const periodTabs = document.querySelectorAll('.period-tabs button');
    periodTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            periodTabs.forEach(t => t.classList.remove('selected'));
            tab.classList.add('selected');
            showToast(`Showing ${tab.dataset.period} trend`);
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');

    if (toast && toastText) {
        toastText.textContent = message;
        toast.hidden = false;

        setTimeout(() => {
            toast.hidden = true;
        }, 2800);
    }
}

function updateDate() {
    const dateElement = document.querySelector('.eyebrow');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}
