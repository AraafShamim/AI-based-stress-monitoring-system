/* ================= DISTRICT DATA ================= */

const districts = [

    {
        name: "Mumbai",
        citizens: 28960,
        counsellors: 196,
        sessions: 4620,
        distress: 36,
        risk: 58,
        status: "healthy",
        pos: [2, 1]
    },

    {
        name: "Pune",
        citizens: 24710,
        counsellors: 168,
        sessions: 3980,
        distress: 33,
        risk: 31,
        status: "healthy",
        pos: [2, 2]
    },

    {
        name: "Thane",
        citizens: 21340,
        counsellors: 142,
        sessions: 3410,
        distress: 39,
        risk: 52,
        status: "attention",
        pos: [2, 0]
    },

    {
        name: "Nagpur",
        citizens: 18420,
        counsellors: 118,
        sessions: 2980,
        distress: 41,
        risk: 47,
        status: "attention",
        pos: [0, 3]
    },

    {
        name: "Nashik",
        citizens: 14260,
        counsellors: 96,
        sessions: 2210,
        distress: 37,
        risk: 26,
        status: "healthy",
        pos: [1, 1]
    },

    {
        name: "Chandrapur",
        citizens: 6720,
        counsellors: 33,
        sessions: 820,
        distress: 55,
        risk: 44,
        status: "critical",
        pos: [1, 4]
    },

    {
        name: "Nanded",
        citizens: 7320,
        counsellors: 31,
        sessions: 880,
        distress: 57,
        risk: 46,
        status: "critical",
        pos: [3, 4]
    },

    {
        name: "Aurangabad",
        citizens: 12180,
        counsellors: 74,
        sessions: 1860,
        distress: 44,
        risk: 41,
        status: "attention",
        pos: [1, 2]
    },

    {
        name: "Solapur",
        citizens: 9120,
        counsellors: 51,
        sessions: 1180,
        distress: 46,
        risk: 33,
        status: "attention",
        pos: [2, 3]
    },

    {
        name: "Kolhapur",
        citizens: 8760,
        counsellors: 49,
        sessions: 1090,
        distress: 35,
        risk: 17,
        status: "healthy",
        pos: [3, 2]
    },

    {
        name: "Ratnagiri",
        citizens: 4120,
        counsellors: 22,
        sessions: 540,
        distress: 31,
        risk: 9,
        status: "healthy",
        pos: [3, 1]
    },

    {
        name: "Latur",
        citizens: 6540,
        counsellors: 34,
        sessions: 790,
        distress: 43,
        risk: 21,
        status: "attention",
        pos: [3, 3]
    },

    {
        name: "Amravati",
        citizens: 9840,
        counsellors: 62,
        sessions: 1420,
        distress: 34,
        risk: 18,
        status: "healthy",
        pos: [0, 2]
    },

    {
        name: "Gondia",
        citizens: 5210,
        counsellors: 28,
        sessions: 690,
        distress: 52,
        risk: 39,
        status: "critical",
        pos: [0, 4]
    },

    {
        name: "Wardha",
        citizens: 4890,
        counsellors: 24,
        sessions: 610,
        distress: 48,
        risk: 22,
        status: "attention",
        pos: [1, 3]
    }

];


/* ================= CHART DATA ================= */

const chartData = {

    seeking: [
        8200,
        9100,
        10600,
        12200,
        13800,
        15400
    ],

    sessions: [
        12400,
        13800,
        14900,
        16100,
        17300,
        18642
    ],

    distress: [
        46,
        44,
        43,
        41,
        39,
        38
    ]

};


const months = [
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct"
];


/* ================= ALERT DATA ================= */

const alerts = [

    {
        district: "Chandrapur",
        title: "Unusual rise in distress scores",
        detail: "Average distress up 11 points over 2 weeks.",
        severity: "critical",
        time: "2h ago"
    },

    {
        district: "Nanded",
        title: "High-risk cases climbing",
        detail: "46 active high-risk cases, +18% week over week.",
        severity: "critical",
        time: "5h ago"
    },

    {
        district: "Gondia",
        title: "Counsellor shortage detected",
        detail: "Ratio below recommended threshold.",
        severity: "high",
        time: "Yesterday"
    },

    {
        district: "Wardha",
        title: "Drop in service usage",
        detail: "Sessions down 22% this week.",
        severity: "medium",
        time: "Yesterday"
    }

];


/* ================= HELPERS ================= */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    document.querySelectorAll(selector);


const fmt = number =>
    number.toLocaleString("en-IN");


const statusText = {

    healthy: "Healthy",

    attention: "Needs Attention",

    critical: "Critical"

};


/* ================= TOAST ================= */

function toast(message) {

    const element = $("#toast");

    element.textContent = message;

    element.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        element.classList.remove("show");

    }, 2200);

}


/* ================= DATE ================= */

function setDate() {

    $("#date").textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

}


/* ================= CHART ================= */

function drawChart(metric = "seeking") {

    const svg = $("#mainChart");

    const data = chartData[metric];

    const W = 900;

    const H = 290;

    const padding = {

        left: 45,

        right: 15,

        top: 18,

        bottom: 34

    };


    const max = Math.max(...data);

    const min = Math.min(...data);

    const range = (max - min) || 1;


    const points = data.map(
        (value, index) => {

            return [

                padding.left +
                index *
                (W - padding.left - padding.right)
                /
                (data.length - 1),

                padding.top +
                (max - value)
                /
                range *
                (H - padding.top - padding.bottom)

            ];

        }
    );


    let output = `

        <defs>

            <linearGradient
                id="areaFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1">

                <stop
                    offset="0%"
                    stop-color="#168b69"
                    stop-opacity=".18"/>

                <stop
                    offset="100%"
                    stop-color="#168b69"
                    stop-opacity="0"/>

            </linearGradient>

        </defs>

    `;


    /* GRID LINES */

    for (let i = 0; i < 5; i++) {

        const y =
            padding.top +
            i *
            (H - padding.top - padding.bottom)
            / 4;


        output += `

            <line
                class="gridline"
                x1="${padding.left}"
                x2="${W - padding.right}"
                y1="${y}"
                y2="${y}"
            />

        `;

    }


    /* MONTHS */

    months.forEach((month, index) => {

        const x =
            padding.left +
            index *
            (W - padding.left - padding.right)
            /
            (months.length - 1);


        output += `

            <text
                class="axis"
                x="${x}"
                y="${H - 8}"
                text-anchor="middle">

                ${month}

            </text>

        `;

    });


    /* LINE */

    const linePath =
        points
            .map(
                (point, index) => {

                    return (
                        index === 0
                            ? "M"
                            : "L"
                    )
                    +
                    point[0]
                    +
                    " "
                    +
                    point[1];

                }
            )
            .join(" ");


    /* AREA */

    const areaPath =

        `M${points[0][0]} ${H - padding.bottom}
        ${points.map(
            point =>
                `L${point[0]} ${point[1]}`
        ).join(" ")}
        L${points[points.length - 1][0]}
        ${H - padding.bottom}
        Z`;


    output += `

        <path
            class="area"
            d="${areaPath}"
        />

        <path
            class="line"
            d="${linePath}"
        />

    `;


    /* POINTS */

    points.forEach((point, index) => {

        output += `

            <circle
                class="point"
                cx="${point[0]}"
                cy="${point[1]}"
                r="4">

                <title>

                    ${months[index]}:
                    ${fmt(data[index])}

                </title>

            </circle>

        `;

    });


    svg.innerHTML = output;

}


/* ================= DISTRICTS ================= */

function renderDistricts() {

    const grid = $("#districtGrid");

    const occupied = new Map(

        districts.map(
            district => [
                district.pos.join("-"),
                district
            ]
        )

    );


    grid.innerHTML = "";


    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 5; col++) {

            const district =
                occupied.get(
                    `${row}-${col}`
                );


            const button =
                document.createElement("button");


            button.className =
                district
                    ? `district ${district.status}`
                    : "district empty";


            button.textContent =
                district
                    ? district.name
                    : "";


            if (district) {

                button.addEventListener(
                    "click",
                    () => showDistrict(district)
                );

            }


            grid.appendChild(button);

        }

    }

}


/* ================= DISTRICT DETAILS ================= */

function showDistrict(district) {

    $("#districtDetail").innerHTML = `

        <strong>${district.name}</strong>

        · ${fmt(district.citizens)} citizens

        · ${district.counsellors} counsellors

        · ${fmt(district.sessions)} sessions

        · Distress
        <strong>${district.distress}/100</strong>

        ·

        <span class="status ${district.status}">

            ${statusText[district.status]}

        </span>

    `;

}


/* ================= ALERTS ================= */

function renderAlerts() {

    $("#alerts").innerHTML =

        alerts.map(alert => `

            <div class="alert">

                <div
                    class="alert-icon ${alert.severity}">

                    ${
                        alert.severity === "critical"
                            ? "▲"
                            : "!"
                    }

                </div>


                <div>

                    <h4>

                        ${alert.title}
                        · ${alert.district}

                    </h4>


                    <p>
                        ${alert.detail}
                    </p>


                    <time>
                        ${alert.time}
                    </time>

                </div>

            </div>

        `).join("");

}


/* ================= TABLE ================= */

let filter = "all";


function renderTable() {

    const search =
        $("#districtSearch")
            .value
            .trim()
            .toLowerCase();


    const rows =
        districts.filter(
            district =>

                (
                    filter === "all" ||
                    district.status === filter
                )

                &&

                district.name
                    .toLowerCase()
                    .includes(search)

        );


    $("#districtRows").innerHTML =

        rows.map(district => `

            <tr>

                <td>
                    ${district.name}
                </td>

                <td>
                    ${fmt(district.citizens)}
                </td>

                <td>
                    ${district.counsellors}
                </td>

                <td>
                    ${fmt(district.sessions)}
                </td>

                <td>
                    ${district.distress}/100
                </td>

                <td>
                    ${district.risk}
                </td>

                <td>

                    <span
                        class="status ${district.status}">

                        <i
                            class="dot ${district.status}">
                        </i>

                        ${statusText[district.status]}

                    </span>

                </td>

            </tr>

        `).join("");

}


/* ================= MOBILE MENU ================= */

function openMenu() {

    $("#sidebar")
        .classList
        .add("open");

    $("#overlay")
        .classList
        .add("show");

}


function closeMenu() {

    $("#sidebar")
        .classList
        .remove("open");

    $("#overlay")
        .classList
        .remove("show");

}


/* ================= INITIALIZE ================= */

setDate();

drawChart();

renderDistricts();

renderAlerts();

renderTable();


/* ================= CHART BUTTONS ================= */

$$(".chart-tab").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            $$(".chart-tab")
                .forEach(
                    item =>
                        item.classList.remove("active")
                );


            button.classList.add("active");


            drawChart(
                button.dataset.metric
            );

        }
    );

});


/* ================= TABLE FILTER ================= */

$$(".pill").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            $$(".pill")
                .forEach(
                    item =>
                        item.classList.remove("active")
                );


            button.classList.add("active");


            filter =
                button.dataset.filter;


            renderTable();

        }
    );

});


/* SEARCH */

$("#districtSearch")
    .addEventListener(
        "input",
        renderTable
    );


$("#globalSearch")
    .addEventListener(
        "input",
        event => {

            $("#districtSearch").value =
                event.target.value;


            filter = "all";


            $$(".pill")
                .forEach(
                    item =>
                        item.classList.toggle(
                            "active",
                            item.dataset.filter === "all"
                        )
                );


            renderTable();

        }
    );


/* ================= SIDEBAR NAVIGATION ================= */

$$(".nav-item[data-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $$(".nav-item[data-page]")
                    .forEach(
                        item =>
                            item.classList.remove("active")
                    );


                button.classList.add("active");


                $("#pageTitle").textContent =
                    button.dataset.page;


                toast(
                    `${button.dataset.page} selected`
                );


                closeMenu();

            }
        );

    });


/* ================= OTHER BUTTONS ================= */

$("#stateSelect")
    .addEventListener(
        "change",
        event => {

            toast(
                `Showing ${event.target.value} overview`
            );

        }
    );


$("#rangeSelect")
    .addEventListener(
        "change",
        event => {

            toast(
                `Date range: ${event.target.value}`
            );

        }
    );


$("#reportButton")
    .addEventListener(
        "click",
        () => {

            toast("Reports section opened");

        }
    );


$("#viewAlerts")
    .addEventListener(
        "click",
        () => {

            toast("Showing all priority alerts");

        }
    );


$("#notification")
    .addEventListener(
        "click",
        () => {

            toast("You have 4 priority alerts");

        }
    );


$("#logout")
    .addEventListener(
        "click",
        () => {

            toast("Logout action triggered");

        }
    );


/* ================= MOBILE ================= */

$("#openSidebar")
    .addEventListener(
        "click",
        openMenu
    );


$("#closeSidebar")
    .addEventListener(
        "click",
        closeMenu
    );


$("#overlay")
    .addEventListener(
        "click",
        closeMenu
    );


window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 1050) {

            closeMenu();

        }

    }
);