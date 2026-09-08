/**
 * Login page JavaScript - MannSetu
 * Handles authentication and role-based navigation
 */

import apiService from '../services/apiService.js';

// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eye');

// Default target dashboard
let targetDashboard = '../pages/counsellor-dashboard/counsellor.html';

// ==================== DROPDOWN LOGIC ====================

function toggleMenu() {
    menuDropdown.classList.toggle('show');
    languageDropdown.classList.remove('show');
}

function toggleLanguage() {
    languageDropdown.classList.toggle('show');
    menuDropdown.classList.remove('show');
}

function closeAllDropdowns() {
    menuDropdown.classList.remove('show');
    languageDropdown.classList.remove('show');
}

// Event Listeners for Dropdowns
if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
}

if (languageBtn && languageDropdown) {
    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLanguage();
    });
}

document.addEventListener('click', () => {
    closeAllDropdowns();
});

// Prevent closing when clicking inside
if (menuDropdown) {
    menuDropdown.addEventListener('click', (e) => e.stopPropagation());
}
if (languageDropdown) {
    languageDropdown.addEventListener('click', (e) => e.stopPropagation());
}

// ==================== LANGUAGE SWITCHER ====================

function setupLanguageSwitcher() {
    const langButtons = languageDropdown.querySelectorAll('button');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.innerText.trim();
            if (lang === 'हिन्दी') {
                window.location.href = 'login-hindi.html';
            } else if (lang === 'English') {
                window.location.href = 'login.html';
            }
        });
    });
}

// ==================== ROLE SELECTION ====================

function setupRoleSelection() {
    const roleButtons = document.querySelectorAll('.role-btn');
    const welcomeText = document.getElementById('welcomeText');

    roleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Highlight selected role
            roleButtons.forEach(b => b.style.color = '#173B4D');
            btn.style.color = '#1688C9';

            // Set the destination URL
            targetDashboard = btn.getAttribute('data-url');

            // Update the greeting text
            const roleName = btn.innerText.trim();
            const isHindi = window.location.pathname.includes('hindi');

            if (isHindi) {
                welcomeText.innerText = roleName + ' के रूप में लॉगिन करें';
            } else {
                welcomeText.innerText = 'Login as ' + roleName;
            }

            closeAllDropdowns();
        });
    });
}

// ==================== PASSWORD VISIBILITY ====================

function setupPasswordVisibility() {
    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    }
}

// ==================== FORM SUBMISSION ====================

function setupLoginForm() {
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (emailInput.value.trim() || usernameInput.value.trim()).toLowerCase();
        const password = passwordInput.value.trim();

        // Validation
        if (!email || !password) {
            alert('Please enter both email/phone and password.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const response = await apiService.login(email, password);

            if (!response) {
                throw new Error('Invalid response from server');
            }

            // Get user data
            const user = apiService.getUser();
            const role = (user.role || 'user').toLowerCase();
            const isHindi = window.location.pathname.includes('hindi');

            // Redirect based on role
            let redirectUrl;
            switch (role) {
                case 'counsellor':
                    redirectUrl = isHindi ? '../pages/counsellor-dashboard/counsellor-hindi.html' : '../pages/counsellor-dashboard/counsellor.html';
                    break;
                case 'district':
                case 'district_admin':
                    redirectUrl = isHindi ? '../pages/district-dashboard/district-hindi.html' : '../pages/district-dashboard/district.html';
                    break;
                case 'state':
                case 'state_admin':
                    redirectUrl = isHindi ? '../pages/state/state-hindi.html' : '../pages/state/state.html';
                    break;
                case 'national':
                case 'national_admin':
                case 'admin':
                    redirectUrl = isHindi ? '../pages/national/national-hindi.html' : '../pages/national/national.html';
                    break;
                default:
                    redirectUrl = targetDashboard;
            }

            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please check your credentials.');
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// ==================== INITIALIZATION ====================

function init() {
    setupLanguageSwitcher();
    setupRoleSelection();
    setupPasswordVisibility();
    setupLoginForm();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
