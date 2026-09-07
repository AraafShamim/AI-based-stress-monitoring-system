// Password show/hide
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


// Login validation
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

// Inside your login form submit handler/function
const userNameInput = document.getElementById("usernameInput").value; // Get name from input field

// Save the name to browser storage
localStorage.setItem("loggedInUser", userNameInput);

// Redirect to dashboard
window.location.href = "../pages/counsellor-dashboard/counsellor.html";

    // Later you can connect this to your backend
});