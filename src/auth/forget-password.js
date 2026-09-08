/**
 * Forget Password - MannSetu
 * Password recovery functionality
 */

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const recoveryContact = document.getElementById('recoveryContact');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const contact = recoveryContact.value.trim();
        if (!contact) {
            alert('Please enter your phone number or email.');
            return;
        }

        // Validate input
        const isEmail = contact.includes('@');
        const isPhone = /^\d{10,15}$/.test(contact);

        if (!isEmail && !isPhone) {
            alert('Please enter a valid email or phone number.');
            return;
        }

        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call - backend endpoint doesn't exist yet
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('If an account matches this information, reset instructions will be sent shortly.');
            window.location.href = 'login.html';
        } catch (error) {
            alert('Failed to send reset instructions. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
