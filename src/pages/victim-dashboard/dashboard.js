/* =========================================================
   MANNSETU - USER DASHBOARD JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DATA
    ===================================================== */


    const moodData = {
        happy: {
            name: "HAPPY",
            emoji: "😄",
            description: "Feeling positive and energetic",
            distress: 20
        },

        calm: {
            name: "CALM",
            emoji: "😊",
            description: "Feeling better today",
            distress: 30
        },

        neutral: {
            name: "NEUTRAL",
            emoji: "😐",
            description: "Feeling okay today",
            distress: 42
        },

        anxious: {
            name: "ANXIOUS",
            emoji: "😟",
            description: "Feeling a little worried",
            distress: 65
        },

        sad: {
            name: "SAD",
            emoji: "😔",
            description: "Having a difficult day",
            distress: 75
        },

        stressed: {
            name: "STRESSED",
            emoji: "😣",
            description: "Feeling overwhelmed",
            distress: 85
        }
    };


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const moodCard = document.querySelector(".mood-card");
    const moodIcon = document.querySelector(".mood-icon");
    const moodTitle = document.querySelector(".mood-content h4");
    const moodDescription = document.querySelector(".mood-content p");

    const scoreCircle = document.querySelector(".score-circle span");
    const scoreHeading = document.querySelector(".score-info h4");
    const scoreDescription = document.querySelector(".score-info p");

    const checkinList = document.querySelector(".checkin-list");

    const insightHeading = document.querySelector(".insight-content h4");
    const insightText = document.querySelector(".insight-content p");

    const viewButton = document.querySelector(".view-button");

    const startChatButton = document.querySelector(".chat-button");

    const emergencyButton = document.querySelector(".emergency-card button");

    const notificationButton =
        document.querySelector(".notification");

    const searchButton =
        document.querySelector(".top-controls .top-button");

    const menuButton =
        document.querySelector(".menu-button");


    /* =====================================================
       LOAD SAVED DATA
       ===================================================== */

    let savedMood = localStorage.getItem("mannsetuMood");

    if (!savedMood || !moodData[savedMood]) {
        savedMood = "calm";
    }

    updateMood(savedMood);


    /* =====================================================
       MOOD UPDATE
       ===================================================== */

    function updateMood(mood) {

        const data = moodData[mood];

        if (!data) return;

        /* Update mood card */

        if (moodIcon) {
            moodIcon.textContent = data.emoji;
        }

        if (moodTitle) {
            moodTitle.textContent = data.name;
        }

        if (moodDescription) {
            moodDescription.textContent = data.description;
        }


        /* Update distress score */

        updateDistressScore(data.distress);


        /* Save */

        localStorage.setItem("mannsetuMood", mood);


        /* Update AI insight */

        updateAIInsight(data.distress);


        /* Add check-in */

        addCheckin(data);


        /* Update chart */

        updateChart(data.distress);
    }


    /* =====================================================
       DISTRESS SCORE
       ===================================================== */

    function updateDistressScore(score) {

        if (!scoreCircle) return;

        scoreCircle.textContent = `${score}%`;


        let level;
        let description;

        if (score <= 25) {

            level = "LOW";
            description =
                "Your wellbeing appears positive.";

        } else if (score <= 50) {

            level = "MODERATE";
            description =
                "Your current wellbeing appears stable.";

        } else if (score <= 70) {

            level = "ELEVATED";
            description =
                "You may benefit from taking some time to relax.";

        } else {

            level = "HIGH";
            description =
                "You may need additional emotional support.";
        }


        if (scoreHeading) {
            scoreHeading.textContent = level;
        }

        if (scoreDescription) {
            scoreDescription.textContent = description;
        }


        /* Circle progress */

        const circle = document.querySelector(".score-circle");

        if (circle) {

            circle.style.setProperty(
                "--score",
                `${score * 3.6}deg`
            );
        }
    }


    /* =====================================================
       AI INSIGHTS
       ===================================================== */

    function updateAIInsight(score) {

        if (!insightHeading || !insightText) return;


        if (score <= 30) {

            insightHeading.textContent =
                "You're doing great!";

            insightText.textContent =
                "Your current mood indicates positive wellbeing. Keep maintaining activities that make you feel good.";

        } else if (score <= 50) {

            insightHeading.textContent =
                "You're doing better!";

            insightText.textContent =
                "Your wellbeing appears stable. Continue checking in with yourself and maintaining healthy routines.";

        } else if (score <= 70) {

            insightHeading.textContent =
                "Take a little time for yourself.";

            insightText.textContent =
                "Your distress level is somewhat elevated. Consider taking a short break, relaxing, or talking to someone you trust.";

        } else {

            insightHeading.textContent =
                "You may need some support.";

            insightText.textContent =
                "Your distress level is high. Consider speaking with a counsellor or someone you trust.";
        }
    }


    /* =====================================================
       MOOD SELECTION
       ===================================================== */

    if (moodCard) {

        moodCard.style.cursor = "pointer";

        moodCard.addEventListener("click", () => {

            showMoodSelector();

        });
    }


    function showMoodSelector() {

        /* Prevent multiple popups */

        if (document.querySelector(".mood-popup")) return;


        const popup = document.createElement("div");

        popup.className = "mood-popup";


        popup.innerHTML = `

            <div class="mood-popup-content">

                <button class="close-mood-popup">
                    ×
                </button>

                <h3>How are you feeling?</h3>

                <p>Select your current mood</p>

                <div class="mood-options">

                    <button data-mood="happy">
                        😄
                        <span>Happy</span>
                    </button>

                    <button data-mood="calm">
                        😊
                        <span>Calm</span>
                    </button>

                    <button data-mood="neutral">
                        😐
                        <span>Neutral</span>
                    </button>

                    <button data-mood="anxious">
                        😟
                        <span>Anxious</span>
                    </button>

                    <button data-mood="sad">
                        😔
                        <span>Sad</span>
                    </button>

                    <button data-mood="stressed">
                        😣
                        <span>Stressed</span>
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(popup);


        /* Mood buttons */

        popup.querySelectorAll("[data-mood]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const selectedMood =
                        button.dataset.mood;

                    updateMood(selectedMood);

                    popup.remove();

                    showToast(
                        "Mood updated successfully 💚"
                    );
                });
            });


        /* Close */

        popup.querySelector(".close-mood-popup")
            .addEventListener("click", () => {

                popup.remove();

            });


        popup.addEventListener("click", event => {

            if (event.target === popup) {
                popup.remove();
            }

        });
    }


    /* =====================================================
       RECENT CHECK-IN
       ===================================================== */

    function addCheckin(data) {

        if (!checkinList) return;


        const now = new Date();

        const time = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });


        const existingToday =
            checkinList.querySelector(".checkin");

        /*
         * Don't keep adding duplicate entries when
         * dashboard loads.
         */

        if (
            existingToday &&
            existingToday.querySelector("strong")?.textContent === "Today"
        ) {
            return;
        }


        const checkin = document.createElement("div");

        checkin.className = "checkin";


        let moodClass = data.name.toLowerCase();


        checkin.innerHTML = `

            <div>

                <strong>Today</strong>

                <span>${time}</span>

            </div>

            <span class="mood ${moodClass}">
                ${data.emoji} ${capitalize(data.name)}
            </span>
        `;


        checkinList.prepend(checkin);


        /* Save */

        saveCheckin(data, time);
    }


    function saveCheckin(data, time) {

        const checkins =
            JSON.parse(
                localStorage.getItem("mannsetuCheckins")
            ) || [];


        checkins.unshift({

            mood: data.name,

            emoji: data.emoji,

            distress: data.distress,

            time: time,

            date: new Date().toLocaleDateString()
        });


        /*
         * Keep only the latest 7
         */

        if (checkins.length > 7) {
            checkins.pop();
        }


        localStorage.setItem(
            "mannsetuCheckins",
            JSON.stringify(checkins)
        );
    }


    /* =====================================================
       CHART
       ===================================================== */

    function updateChart(currentScore) {

        const dots =
            document.querySelectorAll(".chart-line span");

        if (!dots.length) return;


        let history =
            JSON.parse(
                localStorage.getItem("mannsetuChart")
            ) || [];


        history.push(currentScore);


        if (history.length > 7) {
            history.shift();
        }


        localStorage.setItem(
            "mannsetuChart",
            JSON.stringify(history)
        );


        /*
         * Convert score to chart position
         */

        dots.forEach((dot, index) => {

            if (history[index] !== undefined) {

                const score = history[index];

                const position =
                    100 - score;

                dot.style.bottom =
                    `${Math.max(5, position)}%`;

                dot.style.opacity = "1";

            } else {

                dot.style.opacity = "0.3";

            }

        });
    }


    /* =====================================================
       VIEW DETAILS
       ===================================================== */

    if (viewButton) {

        viewButton.addEventListener("click", () => {

            const history =
                JSON.parse(
                    localStorage.getItem("mannsetuChart")
                ) || [];


            const average =
                history.length
                    ? Math.round(
                        history.reduce(
                            (a, b) => a + b,
                            0
                        ) / history.length
                    )
                    : 42;


            showModal(
                "Your Wellbeing Details",
                `
                    <div class="details-box">

                        <h4>Weekly Overview</h4>

                        <p>
                            Average distress:
                            <strong>${average}%</strong>
                        </p>

                        <p>
                            Check-ins recorded:
                            <strong>${history.length}</strong>
                        </p>

                        <p>
                            Keep checking in regularly
                            to understand your wellbeing
                            patterns.
                        </p>

                    </div>
                `
            );

        });
    }


    /* =====================================================
       RECOMMENDATIONS
       ===================================================== */

    const recommendations =
        document.querySelectorAll(".recommendation");


    recommendations.forEach(button => {

        button.addEventListener("click", () => {

            const text =
                button.querySelector("span")?.textContent
                || "Activity";


            if (text.includes("Breathing")) {

                startBreathingExercise();

            } else if (text.includes("Relaxation")) {

                showModal(
                    "Relaxation Activity",
                    `
                        <p>
                            Take a moment to slow down.
                        </p>

                        <p>
                            Close your eyes, relax your
                            shoulders and take 5 slow breaths.
                        </p>
                    `
                );

            } else if (text.includes("Counsellor")) {

                openCounsellorChat();

            }

        });

    });


    /* =====================================================
       BREATHING EXERCISE
       ===================================================== */

    function startBreathingExercise() {

        showModal(
            "Breathing Exercise",
            `
                <div class="breathing-exercise">

                    <div class="breathing-circle">
                        Breathe
                    </div>

                    <p>
                        Follow the circle and breathe slowly.
                    </p>

                </div>
            `
        );


        const circle =
            document.querySelector(".breathing-circle");


        if (circle) {

            circle.style.animation =
                "breathing 8s infinite ease-in-out";
        }
    }


    /* =====================================================
       COUNSELLOR CHAT
       ===================================================== */

    if (startChatButton) {

        startChatButton.addEventListener("click", () => {

            openCounsellorChat();

        });
    }


    function openCounsellorChat() {

        showModal(
            "Counsellor Support",
            `
                <div class="chat-box">

                    <p>
                        👋 Hello! Your counsellor is
                        available to talk.
                    </p>

                    <textarea
                        class="chat-input"
                        placeholder="Write something..."
                    ></textarea>

                    <button class="send-chat">
                        Send Message
                    </button>

                </div>
            `
        );


        const sendButton =
            document.querySelector(".send-chat");


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                () => {

                    const input =
                        document.querySelector(
                            ".chat-input"
                        );


                    if (!input.value.trim()) {

                        showToast(
                            "Please write a message first."
                        );

                        return;
                    }


                    input.value = "";


                    showToast(
                        "Message sent successfully 💚"
                    );
                }
            );
        }
    }


    /* =====================================================
       EMERGENCY HELP
       ===================================================== */

    if (emergencyButton) {

        emergencyButton.addEventListener(
            "click",
            () => {

                showModal(
                    "Emergency Support",
                    `
                        <div class="emergency-support">

                            <p>
                                If you feel that you are
                                in immediate danger or
                                unable to keep yourself safe,
                                please contact local emergency
                                services or someone you trust.
                            </p>

                            <button
                                class="support-close">
                                I understand
                            </button>

                        </div>
                    `
                );


                const closeButton =
                    document.querySelector(
                        ".support-close"
                    );


                if (closeButton) {

                    closeButton.addEventListener(
                        "click",
                        () => {

                            document
                                .querySelector(".dashboard-modal")
                                ?.remove();

                        }
                    );
                }

            }
        );
    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                showModal(
                    "Notifications",
                    `
                        <div class="notification-list">

                            <div class="notification-item">
                                🧠
                                <span>
                                    Your wellbeing check-in
                                    is ready.
                                </span>
                            </div>

                            <div class="notification-item">
                                💚
                                <span>
                                    Remember to take a
                                    short break today.
                                </span>
                            </div>

                            <div class="notification-item">
                                ✨
                                <span>
                                    New wellbeing insights
                                    are available.
                                </span>
                            </div>

                        </div>
                    `
                );


                /*
                 * Remove notification dot
                 */

                const dot =
                    document.querySelector(
                        ".notification-dot"
                    );


                if (dot) {
                    dot.style.display = "none";
                }

            }
        );
    }


    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                const search =
                    prompt(
                        "What would you like to find?"
                    );


                if (!search) return;


                const cards =
                    document.querySelectorAll(
                        ".dashboard-card"
                    );


                let found = false;


                cards.forEach(card => {

                    if (
                        card.textContent
                            .toLowerCase()
                            .includes(search.toLowerCase())
                    ) {

                        card.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });


                        card.style.transform =
                            "scale(1.02)";


                        setTimeout(() => {

                            card.style.transform = "";

                        }, 1000);


                        found = true;

                    }

                });


                if (!found) {

                    showToast(
                        "No matching section found."
                    );

                }

            }
        );
    }


    /* =====================================================
       SIDEBAR NAVIGATION
       ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );


    navItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();


            navItems.forEach(nav => {

                nav.classList.remove("active");

            });


            item.classList.add("active");


            const sectionName =
                item.querySelector("span")
                    ?.textContent.trim();


            if (
                sectionName &&
                sectionName !== "Dashboard"
            ) {

                showToast(
                    `${sectionName} selected`
                );
            }

        });

    });


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutButton =
        document.querySelector(".logout");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const confirmed =
                    confirm(
                        "Are you sure you want to log out?"
                    );


                if (confirmed) {

                    localStorage.removeItem(
                        "mannsetuMood"
                    );

                    showToast(
                        "Logged out successfully."
                    );

                }

            }
        );
    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.querySelector(".sidebar");


                if (sidebar) {

                    sidebar.classList.toggle(
                        "mobile-open"
                    );

                }

            }
        );
    }


    /* =====================================================
       MODAL
       ===================================================== */

    function showModal(title, content) {

        document
            .querySelector(".dashboard-modal")
            ?.remove();


        const modal =
            document.createElement("div");


        modal.className =
            "dashboard-modal";


        modal.innerHTML = `

            <div class="modal-content">

                <button class="modal-close">
                    ×
                </button>

                <h3>${title}</h3>

                <div class="modal-body">
                    ${content}
                </div>

            </div>
        `;


        document.body.appendChild(modal);


        modal.querySelector(".modal-close")
            .addEventListener(
                "click",
                () => modal.remove()
            );


        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    modal.remove();
                }

            }
        );
    }


    /* =====================================================
       TOAST MESSAGE
       ===================================================== */

    function showToast(message) {

        document
            .querySelector(".mannsetu-toast")
            ?.remove();


        const toast =
            document.createElement("div");


        toast.className =
            "mannsetu-toast";


        toast.textContent = message;


        document.body.appendChild(toast);


        setTimeout(() => {

            toast.classList.add("show");

        }, 10);


        setTimeout(() => {

            toast.classList.remove("show");


            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 2500);
    }


    /* =====================================================
       HELPER
       ===================================================== */

    function capitalize(text) {

        return text.charAt(0).toUpperCase()
            + text.slice(1).toLowerCase();

    }


    /* =====================================================
       BASIC DYNAMIC CSS
       This allows the JS-created popups/modals to work
       without changing your dashboard.css.
       ===================================================== */

    const dynamicStyle =
        document.createElement("style");


    dynamicStyle.textContent = `

        .mood-popup,
        .dashboard-modal {

            position: fixed;
            inset: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(0,0,0,0.45);

            z-index: 9999;

            padding: 20px;

        }


        .mood-popup-content,
        .modal-content {

            position: relative;

            width: min(500px, 95%);

            background: white;

            border-radius: 20px;

            padding: 30px;

            box-shadow:
                0 20px 50px rgba(0,0,0,0.2);

            animation:
                popupIn 0.25s ease;

        }


        .mood-popup-content h3,
        .modal-content h3 {

            margin-bottom: 8px;

        }


        .mood-popup-content p {

            margin-bottom: 20px;

            opacity: 0.7;

        }


        .mood-options {

            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 12px;

        }


        .mood-options button {

            border: none;

            background: #f4f7f8;

            border-radius: 15px;

            padding: 15px 8px;

            cursor: pointer;

            font-size: 28px;

            transition: 0.2s;

        }


        .mood-options button:hover {

            transform: translateY(-4px);

            background: #e7f5f0;

        }


        .mood-options span {

            display: block;

            font-size: 13px;

            margin-top: 5px;

        }


        .close-mood-popup,
        .modal-close {

            position: absolute;

            right: 15px;
            top: 12px;

            border: none;

            background: none;

            font-size: 25px;

            cursor: pointer;

        }


        .modal-body {

            margin-top: 20px;

            line-height: 1.7;

        }


        .notification-item {

            display: flex;

            gap: 12px;

            padding: 14px 0;

            border-bottom:
                1px solid #eee;

        }


        .chat-input {

            width: 100%;

            min-height: 100px;

            resize: vertical;

            padding: 12px;

            border-radius: 10px;

            border: 1px solid #ddd;

            margin: 15px 0;

            font-family: inherit;

        }


        .send-chat {

            border: none;

            padding: 10px 18px;

            border-radius: 10px;

            cursor: pointer;

        }


        .breathing-circle {

            width: 120px;

            height: 120px;

            border-radius: 50%;

            margin: 20px auto;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #dff3ed;

        }


        @keyframes breathing {

            0%, 100% {
                transform: scale(0.8);
            }

            50% {
                transform: scale(1.15);
            }

        }


        .mannsetu-toast {

            position: fixed;

            bottom: 25px;

            left: 50%;

            transform:
                translate(-50%, 20px);

            background: #1f3d38;

            color: white;

            padding: 12px 20px;

            border-radius: 30px;

            opacity: 0;

            transition: 0.3s;

            z-index: 10000;

            font-size: 14px;

        }


        .mannsetu-toast.show {

            opacity: 1;

            transform:
                translate(-50%, 0);

        }


        @keyframes popupIn {

            from {

                opacity: 0;

                transform:
                    translateY(15px)
                    scale(0.97);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        @media (max-width: 768px) {

            .mood-options {

                grid-template-columns:
                    repeat(2, 1fr);

            }

            .sidebar.mobile-open {

                transform: translateX(0);

            }

        }

    `;


    document.head.appendChild(dynamicStyle);


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    console.log(
        "MannSetu Dashboard initialized successfully 💚"
    );

});