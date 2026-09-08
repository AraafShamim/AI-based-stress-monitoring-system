// Shared API utility to enforce auth and fetch dashboard data
async function checkAuthAndFetchDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../../auth/login.html";
        return;
    }

    // Set user name from localStorage to remove frontend default mock names
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        // Attempt to find profile name elements and update them
        const profileElements = document.querySelectorAll('.counsellor-profile strong, .admin-profile h4, .top-profile-text strong, .profile-info h4');
        profileElements.forEach(el => el.innerText = loggedInUser);
    }

    try {
        const res = await fetch("http://localhost:8080/api/v1/dashboard/summary", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = "../../auth/login.html";
            return;
        }

        if (res.ok) {
            const data = await res.json();
            // Update common stats if they exist on the page
            updateStatElement("totalClients", data.total_monitored_victims || 0);
            updateStatElement("activeClients", data.total_monitored_victims || 0); // Placeholder logic
            updateStatElement("highRisk", data.high_risk_cases || 0);
            updateStatElement("criticalRisk", data.critical_cases || 0);
            updateStatElement("moderateRisk", data.moderate_risk_cases || 0);
            updateStatElement("lowRisk", data.low_risk_cases || 0);
        }
    } catch (err) {
        console.error("Dashboard fetch failed:", err);
    }
}

function updateStatElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value;
    }
}

document.addEventListener("DOMContentLoaded", checkAuthAndFetchDashboard);
