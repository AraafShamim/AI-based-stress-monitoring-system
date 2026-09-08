document.addEventListener("DOMContentLoaded", function () {

    /* ================= NAVIGATION ================= */

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            navItems.forEach(function (nav) {
                nav.classList.remove("active");
            });

            this.classList.add("active");

            const section = this.querySelector("span").textContent;

            console.log("Selected:", section);

        });

    });


    /* ================= SEARCH ================= */

    const searchInput = document.querySelector(".search input");

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const query = this.value.toLowerCase();

            const cards = document.querySelectorAll(".feature-card");

            cards.forEach(function (card) {

                const text = card.textContent.toLowerCase();

                if (text.includes(query)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }

            });

        });

    }


    /* ================= NOTIFICATION ================= */

    const notification = document.querySelector(".notification");

    if (notification) {

        notification.addEventListener("click", function () {

            alert(
                "You have no new notifications."
            );

        });

    }


    /* ================= FEATURE CARD HOVER ================= */

    const cards = document.querySelectorAll(".feature-card");

    cards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            this.style.cursor = "pointer";

        });

    });


    /* ================= ORGANIZATION CARD ================= */

    const organization = document.querySelector(".organization");

    if (organization) {

        organization.addEventListener("click", function () {

            console.log(
                "Ministry of Social Justice and Empowerment (MoSJE)"
            );

        });

    }

});