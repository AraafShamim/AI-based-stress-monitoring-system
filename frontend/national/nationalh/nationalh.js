/* =========================
   राज्य डेटा
========================= */

const states = [

    {
        name: "केरल",
        population: "3.56 करोड़",
        assessed: "31.2 लाख",
        index: 81.6,
        change: "+8.4%",
        status: "healthy"
    },

    {
        name: "तमिलनाडु",
        population: "7.68 करोड़",
        assessed: "42.8 लाख",
        index: 79.8,
        change: "+6.7%",
        status: "healthy"
    },

    {
        name: "कर्नाटक",
        population: "6.91 करोड़",
        assessed: "39.4 लाख",
        index: 78.4,
        change: "+5.9%",
        status: "healthy"
    },

    {
        name: "महाराष्ट्र",
        population: "12.93 करोड़",
        assessed: "68.5 लाख",
        index: 75.2,
        change: "+2.8%",
        status: "watch"
    },

    {
        name: "राजस्थान",
        population: "8.19 करोड़",
        assessed: "40.6 लाख",
        index: 74.8,
        change: "+11.4%",
        status: "healthy"
    },

    {
        name: "गुजरात",
        population: "7.20 करोड़",
        assessed: "37.2 लाख",
        index: 73.6,
        change: "+3.5%",
        status: "healthy"
    },

    {
        name: "दिल्ली",
        population: "2.18 करोड़",
        assessed: "12.7 लाख",
        index: 72.9,
        change: "+2.1%",
        status: "watch"
    },

    {
        name: "पश्चिम बंगाल",
        population: "10.33 करोड़",
        assessed: "41.8 लाख",
        index: 68.7,
        change: "-1.8%",
        status: "watch"
    },

    {
        name: "मध्य प्रदेश",
        population: "8.65 करोड़",
        assessed: "32.5 लाख",
        index: 67.4,
        change: "-2.6%",
        status: "priority"
    },

    {
        name: "उत्तर प्रदेश",
        population: "23.77 करोड़",
        assessed: "91.4 लाख",
        index: 64.8,
        change: "-6.2%",
        status: "priority"
    }

];


/* =========================
   हिंदी STATUS
========================= */

const statusHindi = {

    healthy: "स्वस्थ",

    watch: "निगरानी",

    priority: "प्राथमिकता"

};


/* =========================
   TABLE
========================= */

function loadStates(data = states) {

    const table =
        document.getElementById("stateTable");

    table.innerHTML = "";


    data.forEach(state => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${state.name}
            </td>

            <td>
                ${state.population}
            </td>

            <td>
                ${state.assessed}
            </td>

            <td>
                <strong>
                    ${state.index}
                </strong>
            </td>

            <td class="${
                state.change.startsWith("+")
                ? "positive"
                : "negative"
            }">

                ${state.change}

            </td>

            <td>

                <span class="status-badge ${state.status}">

                    ${statusHindi[state.status]}

                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================
   SEARCH + FILTER
========================= */

function filterStates() {

    const search =
        document
            .getElementById("searchState")
            .value
            .toLowerCase();


    const status =
        document
            .getElementById("statusFilter")
            .value;


    const filtered =
        states.filter(state => {

            const matchesSearch =
                state.name
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                state.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

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


    const points =
        chartData.map(
            (value, index) => {

                const x =
                    index *
                    (
                        svgWidth /
                        (chartData.length - 1)
                    );


                const y =
                    svgHeight -
                    (
                        (value - min) /
                        (max - min)
                    ) *
                    svgHeight;


                return {
                    x,
                    y,
                    value
                };

            }
        );


    const pointString =
        points
            .map(
                p =>
                    `${p.x},${p.y}`
            )
            .join(" ");


    document
        .getElementById("chartLine")
        .setAttribute(
            "points",
            pointString
        );


    const areaPath =

        `M ${points[0].x}
        ${svgHeight}

        L ${points
            .map(
                p =>
                    `${p.x} ${p.y}`
            )
            .join(" L ")}

        L ${
            points[
                points.length - 1
            ].x
        }
        ${svgHeight}

        Z`;


    document
        .getElementById("chartArea")
        .setAttribute(
            "d",
            areaPath
        );


    const dots =
        document.getElementById(
            "chartDots"
        );


    dots.innerHTML = "";


    points.forEach(point => {

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
            "4"
        );


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
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/* =========================
   NAVIGATION
========================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-item"
                    )
                    .forEach(nav => {

                        nav.classList.remove(
                            "active"
                        );

                    });


                item.classList.add(
                    "active"
                );


                showToast(
                    item.textContent.trim()
                );

            }
        );

    });


/* =========================
   YEAR FILTER
========================= */

document
    .getElementById(
        "yearFilter"
    )
    .addEventListener(
        "change",
        function () {

            showToast(
                "डैशबोर्ड " +
                this.value +
                " के लिए अपडेट किया गया"
            );

        }
    );


/* =========================
   INITIALIZE
========================= */

loadStates();

updateChart();