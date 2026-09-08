/* =========================================
   USER DASHBOARD JAVASCRIPT
   MannSetu
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    const languageBtn = document.getElementById("languageBtn");
    const languageDropdown =
        document.getElementById("languageDropdown");

    const profileBtn = document.getElementById("profileBtn");
    const profileDropdown =
        document.getElementById("profileDropdown");

    const checkInBtn =
        document.getElementById("checkInBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    /* =========================================
       SIDEBAR TOGGLE
    ========================================= */

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });
    }

    /* =========================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
    ========================================= */

    document.addEventListener("click", (event) => {

        if (
            sidebar &&
            menuBtn &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            sidebar.classList.remove("active");
        }

    });


    /* =========================================
       LANGUAGE DROPDOWN
    ========================================= */

    if (languageBtn && languageDropdown) {

        languageBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            languageDropdown.classList.toggle("show");

            if (profileDropdown) {
                profileDropdown.classList.remove("show");
            }

        });
    }


    /* =========================================
       PROFILE DROPDOWN
    ========================================= */

    if (profileBtn && profileDropdown) {

        profileBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            profileDropdown.classList.toggle("show");

            if (languageDropdown) {
                languageDropdown.classList.remove("show");
            }

        });
    }


    /* =========================================
       CLOSE DROPDOWNS OUTSIDE
    ========================================= */

    document.addEventListener("click", () => {

        if (languageDropdown) {
            languageDropdown.classList.remove("show");
        }

        if (profileDropdown) {
            profileDropdown.classList.remove("show");
        }

    });


    /* =========================================
       LANGUAGE SELECTION
    ========================================= */

    const languageOptions =
        document.querySelectorAll(".language-option");

    languageOptions.forEach(option => {

        option.addEventListener("click", (event) => {

            event.preventDefault();

            const language =
                option.dataset.language;

            if (language === "english") {
                window.location.href = "dashboard.html";
            }

            if (language === "hindi") {
                window.location.href = "dashboard-hindi.html";
            }

        });

    });


    /* =========================================
       SIDEBAR NAVIGATION
    ========================================= */

    const navLinks =
        document.querySelectorAll(".sidebar a[data-page]");

    navLinks.forEach(link => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

            const page =
                link.dataset.page;

            if (!page) return;

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            window.location.href = page;

        });

    });


    /* =========================================
       CHECK-IN BUTTON
    ========================================= */

    if (checkInBtn) {

        checkInBtn.addEventListener("click", () => {

            showCheckInModal();

        });

    }


    /* =========================================
       MOOD BUTTONS
    ========================================= */

    const moodButtons =
        document.querySelectorAll(".mood-btn");

    moodButtons.forEach(button => {

        button.addEventListener("click", () => {

            moodButtons.forEach(btn => {
                btn.classList.remove("selected");
            });

            button.classList.add("selected");

            const mood =
                button.dataset.mood;

            updateMood(mood);

        });

    });


    /* =========================================
       UPDATE MOOD
    ========================================= */

    function updateMood(mood) {

        const moodText =
            document.getElementById("currentMood");

        const moodDescription =
            document.getElementById("moodDescription");

        if (!moodText) return;

        const moodData = {

            happy: {
                title: "HAPPY",
                description:
                    "You're feeling positive today."
            },

            neutral: {
                title: "NEUTRAL",
                description:
                    "Feeling okay today."
            },

            worried: {
                title: "WORRIED",
                description:
                    "It's okay to take some time for yourself."
            },

            sad: {
                title: "SAD",
                description:
                    "Remember that support is available."
            },

            angry: {
                title: "ANGRY",
                description:
                    "Take a moment to breathe and relax."
            }

        };

        const selected =
            moodData[mood];

        if (!selected) return;

        moodText.textContent =
            selected.title;

        if (moodDescription) {
            moodDescription.textContent =
                selected.description;
        }

    }


    /* =========================================
       CHECK-IN MODAL
    ========================================= */

    function showCheckInModal() {

        const modal =
            document.getElementById("checkInModal");

        if (!modal) {
            alert(
                "How are you feeling today? Your response will help us understand your wellbeing."
            );

            return;
        }

        modal.classList.add("active");

    }


    /* =========================================
       CLOSE CHECK-IN MODAL
    ========================================= */

    const closeModal =
        document.getElementById("closeCheckIn");

    if (closeModal) {

        closeModal.addEventListener("click", () => {

            const modal =
                document.getElementById("checkInModal");

            if (modal) {
                modal.classList.remove("active");
            }

        });

    }


    /* =========================================
       DISTRESS SCORE
    ========================================= */

    function updateDistressScore(score) {

        const scoreElement =
            document.getElementById("distressScore");

        const circle =
            document.querySelector(".progress-circle");

        if (scoreElement) {
            scoreElement.textContent =
                `${score}%`;
        }

        if (circle) {

            circle.style.setProperty(
                "--progress",
                `${score * 3.6}deg`
            );

        }

        updateDistressStatus(score);

    }


    /* =========================================
       DISTRESS STATUS
    ========================================= */

    function updateDistressStatus(score) {

        const status =
            document.getElementById("distressStatus");

        if (!status) return;

        if (score < 30) {

            status.textContent = "LOW";

        } else if (score < 60) {

            status.textContent = "MODERATE";

        } else {

            status.textContent = "HIGH";

        }

    }


    /* =========================================
       AI INSIGHT
    ========================================= */

    function updateAIInsight(score) {

        const insight =
            document.getElementById("aiInsight");

        if (!insight) return;

        if (score < 30) {

            insight.textContent =
                "You're doing well! Continue maintaining healthy routines.";

        } else if (score < 60) {

            insight.textContent =
                "Your wellbeing appears stable. Continue checking in with yourself.";

        } else {

            insight.textContent =
                "You may benefit from additional support. Consider connecting with a counsellor.";

        }

    }


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutBtn) {

        logoutBtn.addEventListener("click", (event) => {

            event.preventDefault();

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (confirmLogout) {

                // Clear login information
                localStorage.removeItem("loggedInUser");
                sessionStorage.clear();

                window.location.href =
                    "../../auth/login.html";
            }

        });

    }


    /* =========================================
       CURRENT DATE
    ========================================= */

    function updateDate() {

        const dateElement =
            document.getElementById("currentDate");

        if (!dateElement) return;

        const today =
            new Date();

        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        };

        dateElement.textContent =
            today.toLocaleDateString(
                "en-US",
                options
            );

    }

    updateDate();


    /* =========================================
       CURRENT TIME
    ========================================= */

    function updateTime() {

        const timeElements =
            document.querySelectorAll(".live-time");

        const now =
            new Date();

        const time =
            now.toLocaleTimeString(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        timeElements.forEach(element => {
            element.textContent = time;
        });

    }

    updateTime();

    setInterval(updateTime, 60000);


    /* =========================================
       CARD ANIMATION
    ========================================= */

    const cards =
        document.querySelectorAll(
            ".dashboard-card, .stat-card, .insight-card"
        );

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(15px)";

        setTimeout(() => {

            card.style.transition =
                "opacity 0.5s ease, transform 0.5s ease";

            card.style.opacity = "1";
            card.style.transform =
                "translateY(0)";

        }, index * 80);

    });


    /* =========================================
       BUTTON RIPPLE EFFECT
    ========================================= */

    const buttons =
        document.querySelectorAll("button");

    buttons.forEach(button => {

        button.addEventListener("click", function (event) {

            const ripple =
                document.createElement("span");

            ripple.classList.add("ripple");

            const rect =
                button.getBoundingClientRect();

            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);

        });

    });


    /* =========================================
       INITIAL DASHBOARD DATA
    ========================================= */

    const initialScore = 0;

    updateDistressScore(initialScore);
    updateAIInsight(initialScore);

});