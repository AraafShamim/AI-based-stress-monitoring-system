const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const recoveryContact = document.getElementById("recoveryContact");

forgotPasswordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const contact = recoveryContact.value.trim();
    if (!contact) {
        return;
    }

    alert("If an account matches this information, reset instructions will be sent shortly.");
    window.location.href = "login.html";
});