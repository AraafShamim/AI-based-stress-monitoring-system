// =========================================
// Dropdown Menu Logic
// =========================================
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');

// Toggle role menu
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the window click event from firing instantly
    menuDropdown.classList.toggle('show');
    languageDropdown.classList.remove('show'); // Closes the other menu if open
});

// Toggle language menu
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('show');
    menuDropdown.classList.remove('show'); 
});

// Close dropdowns when clicking anywhere else on the screen
window.addEventListener('click', () => {
    menuDropdown.classList.remove('show');
    languageDropdown.classList.remove('show');
});

// =========================================
// Password Show/Hide Logic
// =========================================
const password = document.getElementById("password");
const eye = document.getElementById("eye");

eye.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        eye.classList.remove("fa-eye");
        eye.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        eye.classList.remove("fa-eye-slash");
        eye.classList.add("fa-eye");
    }
});

// =========================================
// Login Validation & Redirect
// =========================================
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = password.value.trim();

    if (email === "" || pass === "") {
        alert("Please enter your email and password.");
        return;
    }

    if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("Welcome to MannSetu! 🌿");

    // Save the name to browser storage
    const userNameInput = document.getElementById("usernameInput").value; 
    localStorage.setItem("loggedInUser", userNameInput);

    // Hardcoded redirect (To be replaced with Spring Boot fetch call later)
    window.location.href = "../pages/victim-dashboard/dashboard.html";
});