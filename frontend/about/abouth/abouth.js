// ==========================================
// मनSetu - Hindi About Page JavaScript
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Page loaded successfully
    console.log("मनSetu About Page Loaded");

    // ==========================================
    // FEATURE CARD HOVER
    // ==========================================

    const featureCards = document.querySelectorAll(".feature-card");

    featureCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-5px)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
        });

    });


    // ==========================================
    // STEP ANIMATION
    // ==========================================

    const steps = document.querySelectorAll(".step");

    steps.forEach(function (step, index) {

        step.style.opacity = "0";
        step.style.transform = "translateY(20px)";
        step.style.transition = "all 0.5s ease";

        setTimeout(function () {

            step.style.opacity = "1";
            step.style.transform = "translateY(0)";

        }, 200 + (index * 150));

    });


    // ==========================================
    // ABOUT CARDS ANIMATION
    // ==========================================

    const cards = document.querySelectorAll(
        ".intro-card, .approach-card, .vision, .white-card, .organization, .disclaimer"
    );

    cards.forEach(function (card) {

        card.style.opacity = "0";
        card.style.transform = "translateY(15px)";
        card.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

    });


    setTimeout(function () {

        cards.forEach(function (card, index) {

            setTimeout(function () {

                card.style.opacity = "1";
                card.style.transform = "translateY(0)";

            }, index * 100);

        });

    }, 100);


    // ==========================================
    // VISION QUOTE EFFECT
    // ==========================================

    const quote = document.querySelector(".quote");

    if (quote) {

        quote.addEventListener("mouseenter", function () {

            this.style.transform = "scale(1.02)";
            this.style.transition = "0.3s ease";

        });

        quote.addEventListener("mouseleave", function () {

            this.style.transform = "scale(1)";

        });

    }


    // ==========================================
    // SMOOTH SCROLL
    // ==========================================

    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

});


// ==========================================
// GO TO MAIN DASHBOARD
// ==========================================

function goToDashboard() {

    window.location.href = "index.html";

}


// ==========================================
// DASHBOARD SECTION FUNCTION
// ==========================================

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(function (section) {
        section.style.display = "none";
    });


    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {

        selectedSection.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}