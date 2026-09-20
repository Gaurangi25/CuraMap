# CuraMap 🏥🗺️
> **Automated Healthcare Facility Discovery & Real-Time Resource Tracking Platform**

CuraMap is a full-stack MERN application that helps users, emergency responders, and patients find nearby healthcare facilities with live availability of critical medical resources—including general beds, ICU beds, oxygen units, ventilators, and ambulances—mapped interactively using Google Maps.

🌐 **Live Demo:** [cura-map.vercel.app](https://cura-map.vercel.app)

---

## 📌 Project Evolution: Version 1 vs Version 2

CuraMap evolved across two major architectural iterations:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CuraMap Ecosystem                       │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │   Version 1 (Original)        │                 │   Version 2 (Current Active)  │
     ├───────────────────────────────┤                 ├───────────────────────────────┤
     │ • Manual Hospital Data Entry  │                 │ • Automated OSM Overpass API  │
     │ • MongoDB $near queries       │                 │ • 30,274+ Gov Directory CSV   │
     │ • Single /admin Add Form      │                 │ • Role-based: User/Hosp/Super │
     │ • Static Hospital List View   │                 │ • Verification & Approval Flow│
     │ • Simple bed/oxygen manual log│                 │ • Real-time resource metrics  │
     │ • Archived in `/archive_v1/`  │                 │ • Dynamic cluster map search  │
     └───────────────────────────────┘                 └───────────────────────────────┘
```

### Version 1 — Original CuraMap
* **Core Concept:** Community-driven hospital directory with manual data entry.
* **Limitations:** Required hospital administrators to manually create and input hospital records via an admin form, which created data bottlenecks and limited real-time accuracy.
* **Archival:** All original Version 1 files (`AddHospitalForm`, `Dashboard`, `HospitalDetails`, `Logout`, `EditHospital.css`) are preserved in [`archive_v1/`](./archive_v1/) for reference, college project demonstration, and historical evaluation.

### Version 2 — Improved & Automated CuraMap (Active)
* **Automated Data Pipeline:** Pulls live facility data directly from **OpenStreetMap (OSM) Overpass API** with automated failover across multiple European and global mirrors.
* **National Directory Enrichment:** Cross-references facilities against **30,274+ records** from the **National Government Hospital Directory** (`server/data/hospital_directory.csv`) using tokenized fuzzy matching to enrich phone numbers, licensed bed capacity, specialties, and emergency verification.
* **Three-Tier Role-Based Governance:**
  1. **Public / Patient (`user`):** Instant geospatial search without mandatory sign-in, live distance calculation (Haversine), radius filtering (2 km to 50 km), and 1-click Google Maps turn-by-turn navigation.
  2. **Hospital Administrator (`hospital_admin`):** Institutional personnel claim their facility via official email/designation. Once approved, they dynamically log real-time availability (Beds, ICU, Oxygen, Ventilators, Ambulances, and Emergency intake status).
  3. **Super Administrator (`super_admin`):** Administrative portal for vetting, approving, or rejecting hospital administrator credential requests.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v7, Context API, CSS3 (Modern Medical Design System) |
| **Mapping & Geo** | Google Maps JavaScript API, `@react-google-maps/api`, `@googlemaps/markerclusterer` |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB Atlas with Mongoose (2dsphere geospatial index) |
| **Authentication** | JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0), bcryptjs |
| **Data Ingestion** | OpenStreetMap Overpass API, `csv-parse` for National Hospital Directory dataset |

---

## 📂 Project Architecture

```
CuraMap/
│
├── archive_v1/                          # Preserved Version 1 prototype files
│   ├── client/                          # Legacy AddHospitalForm, Dashboard, HospitalDetails, etc.
│   └── README.md                        # Documentation of Version 1 architecture
│
├── client/                              # React 18 Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── google.png
│   │   └── index.html
│   └── src/
│       ├── components/                  # Active UI & Page Components
│       │   ├── Header.jsx & .css        # Responsive glassmorphic navbar with theme toggle
│       │   ├── HospitalCard.jsx & .css  # Redesigned hospital card with live metrics
│       │   ├── HospitalMap.jsx & .css   # Interactive Overpass map with clustering
│       │   ├── LandingPage.jsx & .css   # Dual-gateway landing hero
│       │   ├── UserDashboard.jsx        # Public & patient discovery portal
│       │   ├── HospitalAdminDashboard.jsx # Facility availability updater
│       │   ├── SuperAdminDashboard.jsx  # Governance & verification review
│       │   ├── HospitalAdminRequest.jsx # Official institutional claim form
│       │   ├── HospitalProfile.jsx & .css # Detailed facility sheet with directions
│       │   ├── MyHospitals.jsx & .css   # Managed facility listing
│       │   ├── EditHospital.jsx         # Facility profile metadata editor
│       │   ├── Login.jsx & Signup.jsx   # Unified authentication cards
│       │   ├── Auth.css                 # Consolidated modern auth stylesheet
│       │   ├── Dashboard.css            # Unified admin & request dashboard styles
│       │   ├── PrivateRoute.jsx         # Role-based route guard
│       │   └── OAuthHandler.jsx         # Google OAuth JWT callback handler
│       ├── context/
│       │   └── AuthContext.jsx          # Role-aware authentication state
│       ├── App.js                       # Top-level routing
│       └── index.css                    # Design tokens & dark/light mode
│
├── server/                              # Node.js Express Backend
│   ├── config/
│   │   └── passport.js                  # Google OAuth strategy
│   ├── controllers/
│   │   ├── hospitalController.js        # OSM nearby & search handler
│   │   └── hospitalAdminController.js   # Request verification & review logic
│   ├── data/
│   │   └── hospital_directory.csv       # 30,274+ verified government records
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT bearer token validation
│   │   ├── hospitalAdminMiddleware.js   # Hospital admin authorization
│   │   └── superAdminMiddleware.js      # Super admin authorization
│   ├── models/
│   │   ├── Hospital.js                  # Facility & availability schema
│   │   ├── HospitalAdminRequest.js      # Verification claim schema
│   │   └── User.js                      # User credentials & role schema
│   ├── routes/
│   │   ├── auth.js                      # Login, signup, google oauth
│   │   ├── hospitalAdmin.js             # Verification claim routes
│   │   └── hospitals.js                 # Hospital discovery & availability endpoints
│   ├── services/
│   │   ├── osmService.js                # Overpass OSM API caller with failover
│   │   └── governmentHospitalService.js # CSV parsing & fuzzy token matcher
│   └── server.js                        # Express server entry point
│
├── Screenshots/                         # UI Screenshots & demo video
├── README.md                            # Comprehensive project guide
└── info.txt                             # Technical notes
```

---

## 🚀 Key Features

* 📍 **Automated Geospatial Discovery:** Automatically queries nearby medical facilities within a user-selected radius (2, 5, 10, 25, 50 km) based on live device GPS coordinates.
* 🛏️ **Real-Time Resource Metrics:** Visual availability counters for General Beds, ICU Beds, Oxygen Units, Ventilators, and Ambulances.
* 🧭 **Turn-by-Turn Routing:** Direct integration with Google Maps driving directions from user location to the destination facility.
* 🏷️ **Government Directory Verification:** Badges indicating data verified against official National Hospital Directory records.
* 🔐 **Secure Multi-Role Access:** JWT-secured endpoints with role-based routing protecting administrative features.
* 🌓 **Dark / Light Theme:** Persistent user preference with accessible contrast ratios.

---

## 🧪 Local Setup Guide

### 1. Clone Repository
```bash
git clone https://github.com/Gaurangi25/CuraMap.git
cd CuraMap
```

### 2. Configure Backend (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
SESSION_SECRET=your_random_session_secret
```

### 3. Configure Frontend (`client/.env.local`)
Create a `.env.local` file inside the `client/` directory:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 4. Install Dependencies & Start Services

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm start
```

Open `http://localhost:3000` in your browser.

---

## 📸 Screenshots

See all screenshots in the [`Screenshots/`](./Screenshots) folder.

* **Landing Page:** Professional healthcare gateway with role-selection cards
* **Discovery Map:** Interactive clustered markers with side-by-side hospital cards
* **Admin Portal:** Live resource update forms with emergency intake controls
* **Super Admin Portal:** Hospital admin credential review and verification queue

---

## 📄 License
This project is licensed under the ISC License.
