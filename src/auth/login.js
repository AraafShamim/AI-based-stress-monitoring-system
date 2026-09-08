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
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pass = password.value.trim();
    const userNameInput = document.getElementById("usernameInput").value.trim();

    if (pass === "") {
        alert("Please enter your password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: userNameInput, password: pass })
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();

        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", data.name);
        localStorage.setItem("userRole", data.role);

        // Redirect based on backend role or selected dashboard
        const role = (data.role || "").toLowerCase();
        const hindiMode = window.location.pathname.includes("hindi");
        if (role === 'counsellor') {
            window.location.href = hindiMode ? "../pages/counsellor-dashboard/counsellor-hindi.html" : "../pages/counsellor-dashboard/counsellor.html";
        } else if (role === 'district') {
            window.location.href = hindiMode ? "../pages/district-dashboard/district-hindi.html" : "../pages/district-dashboard/district.html";
        } else if (role === 'state') {
            window.location.href = hindiMode ? "../pages/state/state-hindi.html" : "../pages/state/state.html";
        } else if (role === 'national' || role === 'admin') {
            window.location.href = hindiMode ? "../pages/national/national-hindi.html" : "../pages/national/national.html";
        } else {
            // Fallback
            window.location.href = targetDashboard;
        }

    } catch (error) {
        alert("Login failed. Please check your email and password.");
        console.error(error);
    }
});