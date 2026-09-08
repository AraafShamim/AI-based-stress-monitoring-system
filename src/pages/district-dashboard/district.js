/**
 * District Dashboard - MannSetu
 * Functional district dashboard with real backend integration
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
    const profileElements = document.querySelectorAll('.admin-profile h4, .profile-info h4, .top-profile-text strong');
    profileElements.forEach(el => {
        if (user.name) el.textContent = user.name;
    });

    // Load dashboard data
    try {
        const summary = await apiService.getDashboardSummary();
        if (summary) {
            updateDashboardStats(summary);
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }

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

function setupUI() {
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
        });
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const section = item.dataset.section;
            showNotification(`Navigating to ${section}`);
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
            showNotification('Settings are ready to customize');
        });
    }
}

function showNotification(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        const toastText = toast.querySelector('p');
        if (toastText) toastText.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 2800);
    }
}

function updateDate() {
    const dateElements = document.querySelectorAll('.eyebrow, .date-text');
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = today.toLocaleDateString('en-US', options);

    dateElements.forEach(el => {
        el.textContent = dateStr;
    });
}
