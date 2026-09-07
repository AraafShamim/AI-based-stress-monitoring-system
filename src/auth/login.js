// === DROPDOWN LOGIC ===
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const languageBtn = document.getElementById("languageBtn");
const languageDropdown = document.getElementById("languageDropdown");

// Toggle Menu
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("show");
    languageDropdown.classList.remove("show");
});

// Toggle Language
languageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle("show");
    menuDropdown.classList.remove("show");
});

// Close dropdowns when clicking outside
document.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
    languageDropdown.classList.remove("show");
});

// Prevent closing when clicking inside dropdowns
menuDropdown.addEventListener("click", (e) => e.stopPropagation());
languageDropdown.addEventListener("click", (e) => e.stopPropagation());

// === LANGUAGE SWITCHER ===
const langButtons = languageDropdown.querySelectorAll("button");
langButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const lang = e.target.innerText.trim();
        if (lang === "हिन्दी") {
            window.location.href = "login-hindi.html";
        } else if (lang === "English") {
            window.location.href = "login.html";
        }
    });
});

// === ROLE SELECTION ===
let targetDashboard = "../pages/counsellor-dashboard/counsellor.html"; // Default
const roleButtons = document.querySelectorAll(".role-btn");
const welcomeText = document.getElementById("welcomeText");

roleButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Highlight selected role
        roleButtons.forEach(b => b.style.color = "#173B4D");
        btn.style.color = "#1688C9";

        // Set the destination URL
        targetDashboard = btn.getAttribute("data-url");

        // Update the greeting text to show the selected role
        const roleName = btn.innerText.trim();
        if (window.location.pathname.includes("hindi")) {
            welcomeText.innerText = roleName + " के रूप में लॉगिन करें";
        } else {
            welcomeText.innerText = "Login as " + roleName;
        }

        menuDropdown.classList.remove("show");
    });
});

// === LOGIN FORM SUBMISSION ===
const loginForm = document.getElementById("loginForm");
const password = document.getElementById("password");
const eye = document.getElementById("eye");

// Password show/hide
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

// Form Submit
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const pass = password.value.trim();
    const userNameInput = document.getElementById("usernameInput").value;

    if (pass === "") {
        alert("Please enter your password.");
        return;
    }

    // Save name and route to the correct dashboard
    localStorage.setItem("loggedInUser", userNameInput);

    window.location.href = targetDashboard;

    window.location.href = "../pages/victim-dashboard/dashboard.html";
});