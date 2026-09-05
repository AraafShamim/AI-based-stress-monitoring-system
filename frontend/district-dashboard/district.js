/* =========================================
   MANNSETU DISTRICT DASHBOARD
   Frontend JavaScript
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */

const sidebar = document.getElementById("sidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const languageBtn = document.getElementById("languageBtn");
const languageDropdown = document.getElementById("languageDropdown");

const notificationBtn = document.getElementById("notificationBtn");
const notificationDropdown =
    document.getElementById("notificationDropdown");

const profileBtn = document.getElementById("profileBtn");
const profileDropdown =
    document.getElementById("profileDropdown");

const logoutBtn = document.getElementById("logoutBtn");
const profileLogout = document.getElementById("profileLogout");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const closeToast = document.getElementById("closeToast");


/* =========================================
   CURRENT DATE
========================================= */

const currentDate = document.getElementById("currentDate");

if (currentDate) {

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener("click", function () {

        sidebar.classList.toggle("open");

    });
}


/* =========================================
   SIDEBAR NAVIGATION
========================================= */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        this.classList.add("active");

        const section = this.dataset.section;

        if (section && section !== "dashboard") {

            showToast(
                "Navigation",
                `${this.querySelector("span").textContent} section selected.`
            );

        }

        if (window.innerWidth <= 900) {
            sidebar.classList.remove("open");
        }

    });

});


/* =========================================
   DROPDOWN FUNCTION
========================================= */

function closeAllDropdowns() {

    languageDropdown.classList.remove("show");

    notificationDropdown.classList.remove("show");

    profileDropdown.classList.remove("show");
}


/* =========================================
   LANGUAGE
========================================= */

languageBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    notificationDropdown.classList.remove("show");
    profileDropdown.classList.remove("show");

    languageDropdown.classList.toggle("show");

});


const languageOptions =
    languageDropdown.querySelectorAll("button");

languageOptions.forEach(option => {

    option.addEventListener("click", function () {

        showToast(
            "Language",
            `${this.textContent} selected.`
        );

        languageDropdown.classList.remove("show");

    });

});


/* =========================================
   NOTIFICATIONS
========================================= */

notificationBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    languageDropdown.classList.remove("show");
    profileDropdown.classList.remove("show");

    notificationDropdown.classList.toggle("show");

});


/* =========================================
   PROFILE
========================================= */

profileBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    languageDropdown.classList.remove("show");
    notificationDropdown.classList.remove("show");

    profileDropdown.classList.toggle("show");

});


/* =========================================
   OUTSIDE CLICK
========================================= */

document.addEventListener("click", function () {

    closeAllDropdowns();

});


document
    .querySelectorAll(".dropdown-wrapper")
    .forEach(wrapper => {

        wrapper.addEventListener("click", function (event) {

            event.stopPropagation();

        });

    });


/* =========================================
   SEARCH
========================================= */

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const searchValue =
            this.value.toLowerCase().trim();

        if (searchValue === "") {
            return;
        }

        const allText =
            document.body.innerText.toLowerCase();

        if (allText.includes(searchValue)) {

            showToast(
                "Search",
                `Information found for "${this.value}".`
            );

        } else {

            showToast(
                "Search",
                `No matching information found.`
            );

        }

    });

}


/* =========================================
   DISTRESS TREND CHART
========================================= */

const trendPath =
    document.getElementById("trendPath");

const areaPath =
    document.getElementById("areaPath");

const chartPoints =
    document.getElementById("chartPoints");

const xAxis =
    document.getElementById("xAxis");

const averageScore =
    document.getElementById("averageScore");


const chartData = {

    "6": {
        labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun"
        ],

        values: [
            34,
            38,
            41,
            37,
            44,
            40
        ]
    },

    "7": {
        labels: [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ],

        values: [
            39,
            42,
            44,
            40,
            37,
            35,
            34
        ]
    },

    "30": {
        labels: [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4"
        ],

        values: [
            46,
            43,
            41,
            40
        ]
    },

    "12": {
        labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],

        values: [
            42,
            45,
            47,
            43,
            41,
            44,
            40,
            39,
            42,
            38,
            37,
            40
        ]
    }

};


function createSmoothPath(values) {

    const width = 700;

    const height = 250;

    const padding = 15;

    const max = 80;

    const min = 0;

    const step =
        (width - padding * 2) /
        (values.length - 1);


    const points = values.map((value, index) => {

        const x =
            padding + index * step;

        const y =
            height -
            ((value - min) /
            (max - min)) *
            height;

        return {
            x,
            y
        };

    });


    let path =
        `M ${points[0].x} ${points[0].y}`;


    for (let i = 0; i < points.length - 1; i++) {

        const current = points[i];

        const next = points[i + 1];

        const controlX =
            (current.x + next.x) / 2;

        path +=
            ` C ${controlX} ${current.y},
               ${controlX} ${next.y},
               ${next.x} ${next.y}`;

    }

    return {
        path,
        points
    };

}


function updateTrendChart(filter = "6") {

    const data = chartData[filter];

    if (!data) return;


    const result =
        createSmoothPath(data.values);


    trendPath.setAttribute(
        "d",
        result.path
    );


    /* Area below line */

    const lastPoint =
        result.points[result.points.length - 1];

    const firstPoint =
        result.points[0];

    const areaD =
        result.path +
        ` L ${lastPoint.x} 250` +
        ` L ${firstPoint.x} 250 Z`;

    areaPath.setAttribute(
        "d",
        areaD
    );


    /* Points */

    chartPoints.innerHTML = "";

    result.points.forEach(point => {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "cx",
            point.x
        );

        circle.setAttribute(
            "cy",
            point.y
        );

        circle.setAttribute(
            "r",
            "5"
        );

        circle.setAttribute(
            "fill",
            "#ffffff"
        );

        circle.setAttribute(
            "stroke",
            "#1688C9"
        );

        circle.setAttribute(
            "stroke-width",
            "3"
        );

        chartPoints.appendChild(circle);

    });


    /* X-axis labels */

    xAxis.innerHTML = "";

    data.labels.forEach(label => {

        const span =
            document.createElement("span");

        span.textContent = label;

        xAxis.appendChild(span);

    });


    /* Average */

    const average =
        Math.round(
            data.values.reduce(
                (sum, value) => sum + value,
                0
            ) / data.values.length
        );

    averageScore.textContent =
        `${average}%`;

}


/* Initial chart */

updateTrendChart("6");


/* Filter */

const trendFilter =
    document.getElementById("trendFilter");

trendFilter.addEventListener("change", function () {

    updateTrendChart(this.value);

    showToast(
        "Trend Updated",
        `Showing ${this.options[this.selectedIndex].text}.`
    );

});


/* =========================================
   AREA ANALYTICS
========================================= */

const viewAreasBtn =
    document.getElementById("viewAreasBtn");

viewAreasBtn.addEventListener("click", function () {

    showToast(
        "Area Analytics",
        "Opening complete area-wise analysis."
    );

});


/* =========================================
   RISK ALERTS
========================================= */

const reviewButtons =
    document.querySelectorAll(".review-btn");

reviewButtons.forEach(button => {

    button.addEventListener("click", function () {

        const alertTitle =
            this
            .closest(".alert-item")
            .querySelector("strong")
            .textContent;

        showToast(
            "Alert Review",
            `Reviewing: ${alertTitle}`
        );

    });

});


const reviewAlertsBtn =
    document.getElementById("reviewAlertsBtn");

reviewAlertsBtn.addEventListener("click", function () {

    showToast(
        "Risk Alerts",
        "Opening all active district alerts."
    );

});


/* =========================================
   COUNSELLORS
========================================= */

const viewCounsellorsBtn =
    document.getElementById("viewCounsellorsBtn");

viewCounsellorsBtn.addEventListener("click", function () {

    showToast(
        "Counsellors",
        "Opening counsellor management."
    );

});


const assignCasesBtn =
    document.getElementById("assignCasesBtn");

assignCasesBtn.addEventListener("click", function () {

    showToast(
        "Case Assignment",
        "Opening pending case assignments."
    );

});


/* =========================================
   COUNSELLING ACTIVITY
========================================= */

const sessionFilter =
    document.getElementById("sessionFilter");

sessionFilter.addEventListener("change", function () {

    showToast(
        "Activity Updated",
        `Showing ${this.value.toLowerCase()} counselling activity.`
    );

});


/* =========================================
   RESOURCES
========================================= */

const manageResourcesBtn =
    document.getElementById("manageResourcesBtn");

manageResourcesBtn.addEventListener("click", function () {

    showToast(
        "Resources",
        "Opening district resource management."
    );

});


/* =========================================
   REPORTS
========================================= */

const weeklyReportBtn =
    document.getElementById("weeklyReportBtn");

const monthlyReportBtn =
    document.getElementById("monthlyReportBtn");

const analyticsBtn =
    document.getElementById("analyticsBtn");

const downloadReportBtn =
    document.getElementById("downloadReportBtn");


weeklyReportBtn.addEventListener("click", function () {

    showToast(
        "Weekly Report",
        "Weekly district report is being prepared."
    );

});


monthlyReportBtn.addEventListener("click", function () {

    showToast(
        "Monthly Report",
        "Monthly district report is being prepared."
    );

});


analyticsBtn.addEventListener("click", function () {

    showToast(
        "Analytics",
        "Opening detailed district analytics."
    );

});


downloadReportBtn.addEventListener("click", function () {

    downloadReport();

});


/* =========================================
   REPORT DOWNLOAD
========================================= */

function downloadReport() {

    const reportContent = `
MANNSETU - DISTRICT WELLBEING REPORT
====================================

Generated: ${new Date().toLocaleString("en-IN")}

DISTRICT OVERVIEW
-----------------
Total Registered Users: 12,450
Active Users: 8,920
Users Under Monitoring: 1,240
High-Risk Cases: 327
Counselling Sessions: 1,240
Emergency Cases: 12


AREA-WISE WELLBEING
-------------------
Block A: 28% - Low
Block B: 46% - Moderate
Block C: 72% - High
Block D: 39% - Moderate
Block E: 31% - Low


COUNSELLOR OVERVIEW
-------------------
Total Counsellors: 31
Available: 18
Currently Engaged: 9
Offline: 4
Pending Cases: 27


SUPPORT RESOURCES
-----------------
Counselling Centres: 8
Mental Health Professionals: 42
Emergency Facilities: 5
Available Capacity: 68%


IMPORTANT NOTE
--------------
This report contains aggregated district-level
information for monitoring and administrative
decision support.

AI-generated insights are pattern-based and should
not be treated as medical diagnosis.
`;


    const blob =
        new Blob(
            [reportContent],
            { type: "text/plain" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "MannSetu_District_Report.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    showToast(
        "Report Downloaded",
        "District report has been downloaded."
    );

}


/* =========================================
   SETTINGS
========================================= */

const settingsBtn =
    document.getElementById("settingsBtn");

const profileSettings =
    document.getElementById("profileSettings");

function openSettings() {

    showToast(
        "Settings",
        "Opening administrator settings."
    );

}

settingsBtn.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        openSettings();

    }
);

profileSettings.addEventListener(
    "click",
    openSettings
);


/* =========================================
   LOGOUT
========================================= */

function logout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );

    if (confirmLogout) {

        showToast(
            "Logged Out",
            "You have been logged out successfully."
        );

        /*
         * Later your backend team can replace
         * this with the real logout API.
         */

        setTimeout(() => {

            // Example:
            // window.location.href = "login.html";

        }, 1200);

    }

}


logoutBtn.addEventListener(
    "click",
    logout
);

profileLogout.addEventListener(
    "click",
    logout
);


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(title, message) {

    toastTitle.textContent = title;

    toastMessage.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


closeToast.addEventListener(
    "click",
    function () {

        toast.classList.remove("show");

    }
);


/* =========================================
   CLOSE SIDEBAR ON OUTSIDE CLICK
========================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            window.innerWidth <= 900 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !mobileMenuBtn.contains(event.target)
        ) {

            sidebar.classList.remove("open");

        }

    }
);


/* =========================================
   INITIAL MESSAGE
========================================= */

console.log(
    "MannSetu District Dashboard loaded successfully."
);