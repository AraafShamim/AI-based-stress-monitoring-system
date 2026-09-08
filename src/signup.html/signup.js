/**
 * Signup Page - MannSetu
 * User registration with backend integration
 */

import apiService from '../services/apiService.js';

document.addEventListener('DOMContentLoaded', () => {
    setupUI();
});

function setupUI() {
    // Dropdowns
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
            if (languageDropdown) languageDropdown.classList.remove('show');
        });
    }

    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
            if (menuDropdown) menuDropdown.classList.remove('show');
        });
    }

    document.addEventListener('click', () => {
        if (menuDropdown) menuDropdown.classList.remove('show');
        if (languageDropdown) languageDropdown.classList.remove('show');
    });

    // Language switcher
    const langButtons = languageDropdown?.querySelectorAll('button');
    langButtons?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.innerText.trim();
            if (lang === 'हिन्दी') {
                window.location.href = 'signup-hindi.html';
            }
        });
    });

    // Role selection
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            roleButtons.forEach(b => b.style.color = '#173B4D');
            btn.style.color = '#1688C9';
        });
    });

    // Password visibility
    const eyes = document.querySelectorAll('.eye');
    eyes.forEach(eye => {
        eye.addEventListener('click', () => {
            const inputBox = eye.closest('.input-box');
            const input = inputBox?.querySelector('input[type="password"], input[type="text"]');

            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    eye.classList.remove('fa-eye');
                    eye.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    eye.classList.remove('fa-eye-slash');
                    eye.classList.add('fa-eye');
                }
            }
        });
    });

    // Signup form
    const signupForm = document.getElementById('loginForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Google button
    const googleBtn = document.querySelector('.google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google authentication not yet configured');
        });
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const inputs = document.querySelectorAll('#loginForm input');
    const fullName = inputs[0]?.value.trim();
    const phone = inputs[1]?.value.trim();
    const email = inputs[2]?.value.trim();
    const password = inputs[3]?.value;
    const confirmPassword = inputs[4]?.value;

    // Validation
    if (!fullName || !phone || !password || !confirmPassword) {
        alert('Please fill in all mandatory fields.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
        // Note: Backend may not have a registration endpoint
        // This is a placeholder for future implementation
        alert('Account creation is currently disabled. Please contact support.');

        // When backend registration is ready:
        // const response = await apiService.register({
        //     name: fullName,
        //     email: email,
        //     phone: phone,
        //     password: password
        // });
        //
        // if (response) {
        //     alert('Account created successfully! Please login.');
        //     window.location.href = '../auth/login.html';
        // }
    } catch (error) {
        console.error('Signup error:', error);
        alert(error.message || 'Account creation failed. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
