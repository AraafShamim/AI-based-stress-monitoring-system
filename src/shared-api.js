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
        const profileElements = document.querySelectorAll('.counsellor-profile strong, .admin-profile h4, .top-profile-text strong, .profile-info h4, #victimProfileName');
        profileElements.forEach(el => el.innerText = loggedInUser);

        // Update welcome header for victim dashboard
        const welcomeHeader = document.getElementById("victimWelcomeHeader");
        if (welcomeHeader) {
            const firstName = loggedInUser.split(' ')[0];
            welcomeHeader.innerHTML = `Good morning, ${firstName}!<span class="sparkle">✦</span>`;
        }
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

async function fetchCounsellorAlerts() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (role !== "COUNSELLOR") return;

    const container = document.getElementById("openAlertsContainer");
    if (!container) return;

    try {
        const res = await fetch("http://localhost:8080/api/v1/alerts", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            const alerts = data.content;
            container.innerHTML = "";

            if (alerts.length === 0) {
                container.innerHTML = `<p style="padding: 1rem; color: var(--text-2);">No open priority alerts at this time.</p>`;
                return;
            }

            alerts.forEach(alert => {
                const alertHtml = `
                <div class="alert-item">
                    <div class="alert-icon"><i data-lucide="alert-triangle"></i></div>
                    <div class="alert-copy">
                        <strong>${alert.thresholdCrossed}</strong>
                        <span>Victim ID: ${alert.victim.id.substring(0,8)}... · ${alert.victim.currentRiskTier} Risk</span>
                        <small>Just Now</small>
                    </div>
                    <button class="review-button" onclick="ackAlert('${alert.id}')">Ack</button>
                </div>`;
                container.innerHTML += alertHtml;
            });
            
            if(window.lucide) {
                lucide.createIcons();
            }
        }
    } catch (e) {
        console.error("Alerts fetch failed", e);
    }
}

window.ackAlert = async function(alertId) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`http://localhost:8080/api/v1/alerts/${alertId}/ack`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "ACKNOWLEDGED", outcomeNotes: "Acknowledged via Dashboard" })
        });
        if (res.ok) {
            alert("Alert acknowledged successfully!");
            fetchCounsellorAlerts(); // Refresh
        } else {
            alert("Failed to acknowledge alert.");
        }
    } catch (e) {
        console.error(e);
    }
};

// Add toDOMContentLoaded
document.addEventListener("DOMContentLoaded", fetchCounsellorAlerts);
