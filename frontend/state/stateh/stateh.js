/* ================= PAGE NAVIGATION ================= */

function showSection(sectionId, clickedItem) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    if (clickedItem) {
        clickedItem.classList.add("active");
    }

    const titles = {
        dashboard: "राज्य डैशबोर्ड",
        population: "जनसंख्या विश्लेषण",
        district: "जिला विश्लेषण",
        services: "मानसिक स्वास्थ्य सेवाएँ",
        reports: "रिपोर्ट"
    };

    document.getElementById("pageTitle").innerText =
        titles[sectionId] || "राज्य डैशबोर्ड";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= STATE SELECTOR ================= */

function changeState() {

    const state = document.getElementById("stateSelect").value;

    alert(
        "आपने " + state + " राज्य चुना है।\n\n" +
        "डैशबोर्ड का डेटा अब " + state + " के अनुसार प्रदर्शित किया जाएगा।"
    );
}


/* ================= TREND CHART ================= */

const trendCanvas = document.getElementById("trendChart");

const trendChart = new Chart(trendCanvas, {

    type: "line",

    data: {

        labels: [
            "सितंबर",
            "अक्टूबर",
            "नवंबर",
            "दिसंबर",
            "जनवरी",
            "फरवरी",
            "मार्च",
            "अप्रैल",
            "मई",
            "जून",
            "जुलाई",
            "अगस्त"
        ],

        datasets: [

            {
                label: "मानसिक स्वास्थ्य मामले",

                data: [
                    52000,
                    54800,
                    57200,
                    60100,
                    63400,
                    66800,
                    70200,
                    73500,
                    76800,
                    80500,
                    84200,
                    87800
                ],

                borderWidth: 3,
                tension: 0.4,
                fill: true
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            }

        },

        scales: {

            y: {
                beginAtZero: false,
                grid: {
                    color: "#edf1f5"
                },

                ticks: {
                    font: {
                        family: "Noto Sans Devanagari"
                    }
                }
            },

            x: {

                grid: {
                    display: false
                },

                ticks: {
                    font: {
                        family: "Noto Sans Devanagari"
                    }
                }

            }

        }

    }

});


/* ================= RISK CHART ================= */

const riskCanvas = document.getElementById("riskChart");

const riskChart = new Chart(riskCanvas, {

    type: "doughnut",

    data: {

        labels: [
            "कम जोखिम",
            "मध्यम जोखिम",
            "उच्च जोखिम"
        ],

        datasets: [

            {
                data: [54, 31, 15],

                borderWidth: 0,

                cutout: "72%"
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            }

        }

    }

});


/* ================= TREND FILTER ================= */

function updateTrendChart() {

    const filter =
        document.getElementById("trendFilter").value;

    let data;

    if (filter === "high") {

        data = [
            7100,
            7400,
            7700,
            7900,
            8300,
            8600,
            9000,
            9400,
            9800,
            10100,
            10500,
            10800
        ];

        trendChart.data.datasets[0].label =
            "उच्च जोखिम वाले मामले";

    }

    else if (filter === "services") {

        data = [
            32000,
            34500,
            36000,
            38400,
            41000,
            43500,
            46000,
            48900,
            51500,
            54200,
            57300,
            60400
        ];

        trendChart.data.datasets[0].label =
            "सेवा उपयोग";

    }

    else {

        data = [
            52000,
            54800,
            57200,
            60100,
            63400,
            66800,
            70200,
            73500,
            76800,
            80500,
            84200,
            87800
        ];

        trendChart.data.datasets[0].label =
            "मानसिक स्वास्थ्य मामले";

    }

    trendChart.data.datasets[0].data = data;

    trendChart.update();
}


/* ================= DISTRICT SEARCH ================= */

function searchDistrict() {

    const input =
        document.getElementById("districtSearch")
            .value
            .toLowerCase();

    const rows =
        document.querySelectorAll("#districtTable tbody tr");

    rows.forEach(row => {

        const district =
            row.cells[1].innerText.toLowerCase();

        if (district.includes(input)) {
            row.style.display = "";
        }

        else {
            row.style.display = "none";
        }

    });

}


/* ================= REPORT DOWNLOAD ================= */

function downloadReport() {

    const reportText = `
मनसेतु - राज्य मानसिक स्वास्थ्य रिपोर्ट
========================================

रिपोर्ट वर्ष: 2026

कुल लाभार्थी: 12.4 लाख
सेवा प्राप्त करने वाले: 8.7 लाख
उच्च जोखिम वाले मामले: 1.86 लाख
मानसिक स्वास्थ्य केंद्र: 1,248

जिला-वार स्थिति:

लखनऊ - 18,420 मामले
कानपुर नगर - 15,680 मामले
प्रयागराज - 13,940 मामले
वाराणसी - 12,360 मामले
आगरा - 10,820 मामले

यह रिपोर्ट मनसेतु डैशबोर्ड से तैयार की गई है।
`;

    const blob =
        new Blob([reportText], {
            type: "text/plain;charset=utf-8"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "MannSetu-State-Report.txt";

    link.click();

    URL.revokeObjectURL(url);
}


/* ================= TABLE EXPORT ================= */

function exportData() {

    const rows =
        document.querySelectorAll("#districtTable tr");

    let csv = [];

    rows.forEach(row => {

        const cols =
            row.querySelectorAll("th, td");

        let rowData = [];

        cols.forEach(col => {

            rowData.push(
                `"${col.innerText.replace(/"/g, '""')}"`
            );

        });

        csv.push(rowData.join(","));

    });

    const blob =
        new Blob(
            [csv.join("\n")],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "MannSetu-District-Data.csv";

    link.click();

    URL.revokeObjectURL(url);
}


/* ================= NOTIFICATION ================= */

document
    .querySelector(".notification")
    .addEventListener("click", function () {

        alert(
            "🔔 महत्वपूर्ण सूचनाएँ\n\n" +
            "• 12 जिलों में विशेषज्ञों की आवश्यकता है।\n" +
            "• उच्च जोखिम वाले मामलों में 6.4% वृद्धि हुई है।\n" +
            "• 5 जिलों में टेली-परामर्श सेवा शुरू हुई है।"
        );

    });