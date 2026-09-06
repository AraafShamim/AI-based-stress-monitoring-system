document.addEventListener("DOMContentLoaded", () => {

  lucide.createIcons();

  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menuButton");
  const sidebarClose = document.getElementById("sidebarClose");

  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  const search = document.getElementById("clientSearch");
  const emptySearch = document.getElementById("emptySearch");

  const notificationBtn =
    document.getElementById("notificationBtn");

  const notificationPopover =
    document.getElementById("notificationPopover");

  let toastTimer;


  /* =========================
     TOAST
  ========================= */

  function notify(message) {

    toastText.textContent = message;

    toast.hidden = false;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }


  /* =========================
     MOBILE SIDEBAR
  ========================= */

  menuButton.addEventListener("click", () => {
    sidebar.classList.add("sidebar-open");
  });

  sidebarClose.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-open");
  });


  /* =========================
     NAVIGATION
  ========================= */

  document
    .querySelectorAll(".nav-item[data-nav]")
    .forEach(button => {

      button.addEventListener("click", () => {

        document
          .querySelectorAll(".nav-item[data-nav]")
          .forEach(item => {
            item.classList.remove("active");
          });

        button.classList.add("active");

        sidebar.classList.remove("sidebar-open");

        notify(button.dataset.nav + " selected");

      });

    });


  /* =========================
     NOTIFICATIONS
  ========================= */

  notificationBtn.addEventListener("click", event => {

    event.stopPropagation();

    notificationPopover.hidden =
      !notificationPopover.hidden;

  });


  document.addEventListener("click", event => {

    if (!event.target.closest(".notification-wrap")) {
      notificationPopover.hidden = true;
    }

  });


  document
    .getElementById("markRead")
    .addEventListener("click", () => {

      notificationPopover.hidden = true;

      notify("Notifications marked as read.");

    });


  /* =========================
     CLIENT SEARCH
  ========================= */

  search.addEventListener("input", () => {

    const term =
      search.value.trim().toLowerCase();

    let visible = 0;

    document
      .querySelectorAll("#clientTable tr")
      .forEach(row => {

        const client =
          row.dataset.client.toLowerCase();

        const matches =
          client.includes(term);

        row.style.display =
          matches ? "" : "none";

        if (matches) {
          visible++;
        }

      });


    emptySearch.hidden =
      visible !== 0;

    if (visible === 0) {

      emptySearch.textContent =
        `No clients match “${search.value}”.`;

    }

  });


  /* =========================
     CLIENT VIEW
  ========================= */

  document
    .querySelectorAll(".client-view")
    .forEach(button => {

      button.addEventListener("click", event => {

        const client =
          event.currentTarget
            .closest("tr")
            .dataset.client;

        notify(`Opening ${client}'s profile`);

      });

    });


  /* =========================
     PANEL ACTIONS
  ========================= */

  document
    .querySelectorAll(".notify-action")
    .forEach(button => {

      button.addEventListener("click", () => {

        notify("Opening requested information");

      });

    });


  /* =========================
     ALERT REVIEW
  ========================= */

  document
    .querySelectorAll(".review-button")
    .forEach(button => {

      button.addEventListener("click", () => {

        const title =
          button
            .closest(".alert-item")
            .querySelector("strong")
            .textContent;

        notify(`Reviewing ${title}`);

      });

    });


  /* =========================
     SCHEDULE
  ========================= */

  document
    .querySelectorAll(".schedule-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        const name =
          button
            .closest(".schedule-item")
            .querySelector(".schedule-person strong")
            .textContent;

        notify(`Starting session with ${name}`);

      });

    });


  /* =========================
     QUICK ACTIONS
  ========================= */

  document
    .querySelectorAll(".quick-actions button")
    .forEach(button => {

      button.addEventListener("click", () => {

        const text =
          button.querySelector("span:nth-of-type(2)");

        if (text) {
          notify(`${text.textContent} opened`);
        }

      });

    });


  /* =========================
     CALL CLIENT
  ========================= */

  document
    .getElementById("callClient")
    .addEventListener("click", () => {

      notify("Connecting you to Client C");

    });


  /* =========================
     SETTINGS
  ========================= */

  document
    .getElementById("settingsBtn")
    .addEventListener("click", () => {

      notify("Settings are ready to customize.");

    });


  /* =========================
     LOGOUT
  ========================= */

  document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

      notify("Logout confirmation sent.");

    });


  /* =========================
     TREND PERIOD TABS
  ========================= */

  document
    .querySelectorAll(".period-tabs button")
    .forEach(button => {

      button.addEventListener("click", () => {

        document
          .querySelectorAll(".period-tabs button")
          .forEach(item => {
            item.classList.remove("selected");
          });

        button.classList.add("selected");

        document
          .getElementById("trendChart")
          .setAttribute(
            "aria-label",
            `Distress trend over ${button.dataset.period}`
          );

        notify(
          `Showing ${button.dataset.period} trend`
        );

      });

    });

});