/* =========================
   NATIONAL DATA
========================= */

const states = [
    {
        name: "Kerala",
        population: "3.56 Cr",
        assessed: "31.2 L",
        index: 81.6,
        change: "+8.4%",
        status: "healthy"
    },
    {
        name: "Tamil Nadu",
        population: "7.68 Cr",
        assessed: "42.8 L",
        index: 79.8,
        change: "+6.7%",
        status: "healthy"
    },
    {
        name: "Karnataka",
        population: "6.91 Cr",
        assessed: "39.4 L",
        index: 78.4,
        change: "+5.9%",
        status: "healthy"
    },
    {
        name: "Maharashtra",
        population: "12.93 Cr",
        assessed: "68.5 L",
        index: 75.2,
        change: "+2.8%",
        status: "watch"
    },
    {
        name: "Rajasthan",
        population: "8.19 Cr",
        assessed: "40.6 L",
        index: 74.8,
        change: "+11.4%",
        status: "healthy"
    },
    {
        name: "Gujarat",
        population: "7.20 Cr",
        assessed: "37.2 L",
        index: 73.6,
        change: "+3.5%",
        status: "healthy"
    },
    {
        name: "Delhi",
        population: "2.18 Cr",
        assessed: "12.7 L",
        index: 72.9,
        change: "+2.1%",
        status: "watch"
    },
    {
        name: "West Bengal",
        population: "10.33 Cr",
        assessed: "41.8 L",
        index: 68.7,
        change: "-1.8%",
        status: "watch"
    },
    {
        name: "Madhya Pradesh",
        population: "8.65 Cr",
        assessed: "32.5 L",
        index: 67.4,
        change: "-2.6%",
        status: "priority"
    },
    {
        name: "Uttar Pradesh",
        population: "23.77 Cr",
        assessed: "91.4 L",
        index: 64.8,
        change: "-6.2%",
        status: "priority"
    }
];


/* =========================
   TABLE
========================= */

function loadStates(data = states) {

    const table = document.getElementById("stateTable");

    table.innerHTML = "";

    data.forEach(state => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${state.name}</td>
            <td>${state.population}</td>
            <td>${state.assessed}</td>
            <td><strong>${state.index}</strong></td>
            <td class="${state.change.startsWith("+") ? "positive" : "negative"}">
                ${state.change}
            </td>
            <td>
                <span class="status-badge ${state.status}">
                    ${capitalize(state.status)}
                </span>
            </td>
        `;

        table.appendChild(row);
    });
}


function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}


/* =========================
   SEARCH + FILTER
========================= */

function filterStates() {

    const search =
        document.getElementById("searchState")
        .value
        .toLowerCase();

    const status =
        document.getElementById("statusFilter")
        .value;

    const filtered = states.filter(state => {

        const matchesSearch =
            state.name.toLowerCase().includes(search);

        const matchesStatus =
            status === "all" ||
            state.status === status;

        return matchesSearch && matchesStatus;
    });

    loadStates(filtered);
}


/* =========================
   CHART
========================= */

const chartData = [
    67.2,
    68.1,
    69.0,
    69.7,
    70.4,
    71.1,
    71.8,
    72.0,
    72.8,
    73.1,
    72.9,
    72.4
];


function updateChart() {

    const svgWidth = 700;
    const svgHeight = 220;

    const min = 60;
    const max = 80;

    const points = chartData.map((value, index) => {

        const x =
            index * (svgWidth / (chartData.length - 1));

        const y =
            svgHeight -
            ((value - min) / (max - min)) * svgHeight;

        return {
            x,
            y,
            value
        };
    });


    const pointString =
        points
        .map(p => `${p.x},${p.y}`)
        .join(" ");


    document
        .getElementById("chartLine")
        .setAttribute("points", pointString);


    const areaPath =
        `M ${points[0].x} ${svgHeight}
         L ${points.map(p => `${p.x} ${p.y}`).join(" L ")}
         L ${points[points.length - 1].x} ${svgHeight}
         Z`;

    document
        .getElementById("chartArea")
        .setAttribute("d", areaPath);


    const dots =
        document.getElementById("chartDots");

    dots.innerHTML = "";

    points.forEach(point => {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        circle.setAttribute("r", "4");

        dots.appendChild(circle);
    });
}


/* =========================
   SIDEBAR
========================= */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================
   NAVIGATION
========================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener("click", () => {

            document
                .querySelectorAll(".nav-item")
                .forEach(nav =>
                    nav.classList.remove("active")
                );

            item.classList.add("active");

            showToast(item.textContent.trim());
        });
    });


/* =========================
   YEAR FILTER
========================= */

document
    .getElementById("yearFilter")
    .addEventListener("change", function () {

        showToast(
            "Dashboard updated for " + this.value
        );
    });


/* =========================
   INITIALIZE
========================= */

loadStates();

updateChart();