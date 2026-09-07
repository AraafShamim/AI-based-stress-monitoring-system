document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. TOP-RIGHT DROPDOWNS (Role & Language)
    // ==========================================

    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    // Toggle Role Menu
    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
            if (languageDropdown) languageDropdown.classList.remove('show');
        });
    }

    // Toggle Language Menu
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
            if (menuDropdown) menuDropdown.classList.remove('show');
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        if (menuDropdown) menuDropdown.classList.remove('show');
        if (languageDropdown) languageDropdown.classList.remove('show');
    });

    // Handle Role Navigation (From your dropdown buttons)
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = button.getAttribute('data-url');
            if (targetUrl) {
                // Navigate to selected dashboard/role page
                window.location.href = targetUrl;
            }
        });
    });


    // ==========================================
    // 2. PASSWORD VISIBILITY TOGGLE (Fixing duplicates)
    // ==========================================
    // Query all eyes using the class instead of single ID to handle multiple input fields
    const eyes = document.querySelectorAll('.eye');

    eyes.forEach(eye => {
        eye.addEventListener('click', () => {
            // Find the preceding input field inside the same parent container
            const inputBox = eye.closest('.input-box');
            const passwordInput = inputBox ? inputBox.querySelector('input[type="password"], input[type="text"]') : null;

            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eye.classList.remove('fa-eye');
                    eye.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    eye.classList.remove('fa-eye-slash');
                    eye.classList.add('fa-eye');
                }
            }
        });
    });


    // ==========================================
    // 3. FORM SUBMISSION & VALIDATION
    // ==========================================
    const signupForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect inputs securely based on positioning or unique properties
            const inputs = signupForm.querySelectorAll('input');
            const fullName = inputs[0] ? inputs[0].value.trim() : '';
            const phone = inputs[1] ? inputs[1].value.trim() : '';
            const email = inputs[2] ? inputs[2].value.trim() : '';
            const password = inputs[3] ? inputs[3].value : '';
            const confirmPassword = inputs[4] ? inputs[4].value : '';

            // Basic Validation Checks
            if (!fullName || !phone || !password || !confirmPassword) {
                alert('कृपया सभी आवश्यक फ़ิลद भरें। (Please fill in all mandatory fields.)');
                return;
            }

            if (password.length < 6) {
                alert('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। (Password must be at least 6 characters long.)');
                return;
            }

            if (password !== confirmPassword) {
                alert('पासवर्ड मेल नहीं खा रहे हैं! (Passwords do not match!)');
                return;
            }

            // Mock Success Action
            alert(`स्वागत है ${fullName}! आपका खाता सफलतापूर्वक बन गया है। (Account created successfully!)`);
            
            // Redirect example (e.g., redirecting to user dashboard after signup)
            window.location.href = '../pages/victim-dashboard/dashboard.html';
        });
    }


    // ==========================================
    // 4. GOOGLE SIGNUP SIMULATION
    // ==========================================
    const googleBtn = document.querySelector('.google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google authentication simulation initialized...');
            // Redirect path post-Google signup configuration can go here
        });
    }

});