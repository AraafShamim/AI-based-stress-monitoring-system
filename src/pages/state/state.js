/**
 * State Dashboard - MannSetu
 * Functional state dashboard with real backend integration
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
    const adminCard = document.querySelector('.admin-card strong');
    if (adminCard && user.name) {
        adminCard.textContent = user.name;
    }

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

    updateElement('totalVictims', data.total_monitored_victims || 0);
    updateElement('highRisk', data.high_risk_cases || 0);
    updateElement('criticalRisk', data.critical_cases || 0);
    updateElement('moderateRisk', data.moderate_risk_cases || 0);
    updateElement('lowRisk', data.low_risk_cases || 0);
}

function setupUI() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const page = item.dataset.page;
            showNotification(`Navigating to ${page}`);
        });
    });

    // Logout button
    const logoutBtn = document.querySelector('.logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                apiService.logout();
                window.location.href = '../../auth/login.html';
            }
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 4px; z-index: 10000;';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2800);
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
