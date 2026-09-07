# 🌿 MannSetu - Frontend

**Smart India Hackathon 2026 (Problem Statement: SIH26094 - Ministry of Social Justice and Empowerment)**

MannSetu is an AI-powered system designed to continuously and remotely monitor the psychological well-being of victims/complainants registered under the SC/ST Prevention of Atrocities Act. It predicts escalating distress early, allowing counsellors and officials to intervene proactively. 

This repository houses the vanilla web frontend, featuring role-based dashboards, data visualization, and seamless bilingual support.

## 🚀 Key Features

* **Role-Based Routing:** Dedicated, isolated dashboards for Victims, Counsellors, District Administrators, State Officials, and National Admins.
* **Dynamic Distress Score (DDS) Visualization:** Interactive charts tracking psychological well-being trends over time using Chart.js.
* **Bilingual Support:** Full English and Hindi (`-hindi.html`) localization across all views with dedicated Devanagari typography.
* **Zero-Friction Entry:** A root-level traffic director automatically routes users to secure authentication.
* **Priority Alert UI:** Visual indicators and high-risk alerts designed for rapid human intervention.

## 🛠 Tech Stack

* **Core:** HTML5, Custom CSS3, Vanilla JavaScript
* **Data Visualization:** Chart.js
* **Typography & Icons:** FontAwesome 6, Google Fonts (Poppins, DM Sans, Manrope, Arya)
* **Deployment:** Vercel / GitHub Pages

## 📂 Directory Architecture

The project follows a clean, component-separated structure designed for easy API integration:

```text
frontend-workspace/
├── index.html                 # Root traffic director (redirects to login)
├── README.md
└── src/
    ├── assets/                # Global images and branding
    │   └── logo1.png
    ├── auth/                  # Authentication UI and logic
    │   ├── login.html
    │   ├── login-hindi.html
    │   ├── login.js
    │   └── style.css
    └── pages/                 # Role-based dashboard modules
        ├── about/
        ├── counsellor-dashboard/
        ├── district-dashboard/
        ├── national/
        ├── state/
        └── victim-dashboard/