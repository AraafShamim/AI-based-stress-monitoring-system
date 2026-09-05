/* =========================================================
   MANNSETU COUNSELLOR DASHBOARD JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SIDEBAR NAVIGATION
    ========================= */

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");
        });
    });


    /* =========================
       SEARCH
    ========================= */

    const searchInput = document.querySelector(".search-box input");

    if (searchInput) {
        searchInput.addEventListener("input", () => {

            const searchValue = searchInput.value.toLowerCase().trim();

            const clientRows = document.querySelectorAll(".client-row");

            clientRows.forEach(row => {

                const text = row.textContent.toLowerCase();

                if (text.includes(searchValue)) {
                    row.style.display = "grid";
                } else {
                    row.style.display = "none";
                }
            });
        });
    }


    /* =========================
       VIEW SCHEDULE
    ========================= */

    const scheduleButton = document.querySelector(".schedule-btn");

    if (scheduleButton) {
        scheduleButton.addEventListener("click", () => {
            showMessage(
                "Today's schedule",
                "You have 5 counselling sessions scheduled today."
            );
        });
    }


    /* =========================
       VIEW ALL CLIENTS
    ========================= */

    const viewAll = document.querySelector(".view-link");

    if (viewAll) {
        viewAll.addEventListener("click", (event) => {

            event.preventDefault();

            showMessage(
                "Client Overview",
                "Opening your complete client list..."
            );
        });
    }


    /* =========================
       PRIORITY ALERTS
    ========================= */

    const alertItems = document.querySelectorAll(".priority-alert");

    alertItems.forEach(alert => {

        alert.addEventListener("click", () => {

            const clientName =
                alert.querySelector("strong")?.textContent ||
                "Client";

            showMessage(
                "Priority Alert",
                `Review ${clientName}'s latest update.`
            );
        });

    });


    /* =========================
       REVIEW ALL ALERTS
    ========================= */

    const reviewAlerts =
        document.querySelector(".review-alerts-btn");

    if (reviewAlerts) {

        reviewAlerts.addEventListener("click", () => {

            showMessage(
                "Priority Alerts",
                "Showing all clients that may need attention."
            );

        });
    }


    /* =========================
       PERIOD SELECTOR
    ========================= */

    const periodSelect =
        document.querySelector(".period-select");

    if (periodSelect) {

        periodSelect.addEventListener("change", () => {

            const selected =
                periodSelect.options[
                    periodSelect.selectedIndex
                ].text;

            showMessage(
                "Chart Updated",
                `Showing distress trends for ${selected}.`
            );

        });
    }


    /* =========================
       SESSION BUTTONS
    ========================= */

    const sessionButtons =
        document.querySelectorAll(".session-btn");

    sessionButtons.forEach(button => {

        button.addEventListener("click", () => {

            const session =
                button.closest(".schedule-item");

            const client =
                session?.querySelector("strong")?.textContent ||
                "client";

            showMessage(
                "Session",
                `Opening today's session with ${client}.`
            );

        });

    });


    /* =========================
       APPOINTMENTS
    ========================= */

    const appointments =
        document.querySelector(".all-appointments");

    if (appointments) {

        appointments.addEventListener("click", event => {

            event.preventDefault();

            showMessage(
                "Appointments",
                "Opening all your appointments."
            );

        });

    }


    /* =========================
       QUICK ACTIONS
    ========================= */

    const quickActions =
        document.querySelectorAll(".quick-action");

    quickActions.forEach(action => {

        action.addEventListener("click", () => {

            const actionName =
                action.textContent.trim();

            showMessage(
                "MannSetu",
                `${actionName} selected.`
            );

        });

    });


    /* =========================
       TOP PROFILE
    ========================= */

    const topProfile =
        document.querySelector(".top-profile");

    if (topProfile) {

        topProfile.addEventListener("click", () => {

            showMessage(
                "Counsellor Profile",
                "Profile settings opened."
            );

        });

    }


    /* =========================
       LOGOUT
    ========================= */

    const logout =
        document.querySelector(".logout");

    if (logout) {

        logout.addEventListener("click", event => {

            event.preventDefault();

            const confirmLogout =
                confirm("Are you sure you want to log out?");

            if (confirmLogout) {

                window.location.href = "login.html";

            }

        });

    }


    /* =========================
       MOBILE SIDEBAR
    ========================= */

    const menuButton =
        document.querySelector(".menu-button");

    const sidebar =
        document.querySelector(".sidebar");

    if (menuButton && sidebar) {

        menuButton.addEventListener("click", () => {

            sidebar.classList.toggle("sidebar-open");

        });

    }

});


/* =========================================================
   MESSAGE / TOAST
========================================================= */

function showMessage(title, message) {

    const existing =
        document.querySelector(".mannsetu-toast");

    if (existing) {
        existing.remove();
    }

    const toast =
        document.createElement("div");

    toast.className = "mannsetu-toast";

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid fa-heart-pulse"></i>
        </div>

        <div>
            <strong>${title}</strong>
            <p>${message}</p>
        </div>

        <button class="toast-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    document.body.appendChild(toast);


    /* Close button */

    const close =
        toast.querySelector(".toast-close");

    close.addEventListener("click", () => {
        toast.remove();
    });


    /* Auto remove */

    setTimeout(() => {

        if (toast) {
            toast.remove();
        }

    }, 3500);
}