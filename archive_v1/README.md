# CuraMap — Version 1 (Original Prototype Archive)

This directory preserves the original codebase files from **Version 1 of CuraMap** for reference, academic comparison, and project demonstration.

---

## 📌 What Was Version 1?

**CuraMap Version 1** was a foundational MERN-stack hospital discovery and resource tracker designed with:
1. **Manual Data Entry**: Hospital entries and their resources (available beds, oxygen units, and ambulances) were entered manually through an admin creation form (`AddHospitalForm.jsx`) and saved to MongoDB.
2. **MongoDB Geospatial Queries**: Lookups relied on MongoDB's `$near` 2dsphere index query to find manually registered hospitals near user coordinates.
3. **Static List & Filters**: Hospitals were browsed through a card grid (`HospitalDetails.jsx`) with basic filter dropdowns (general, specialized, clinic) and an open/closed toggle.
4. **General Dashboard**: A basic user dashboard (`Dashboard.jsx`) with static navigation links to add or view hospitals.

---

## 📂 Archived Files in this Folder

| File | Original Location | Description |
| :--- | :--- | :--- |
| `AddHospitalForm.jsx` & `.css` | `client/src/components/` | Manual hospital registration form that posted to the legacy `POST /api/hospitals` endpoint. |
| `Dashboard.jsx` & `.css` | `client/src/components/` | Original general dashboard before role-based dashboards (User, Hospital Admin, Super Admin) were introduced. |
| `HospitalDetails.jsx` & `.css` | `client/src/components/` | Static list of hospitals with basic category and open status filters. |
| `Logout.jsx` | `client/src/components/` | Standalone logout button with browser popup alerts (superseded by modern navbar logout). |
| `EditHospital.css` | `client/src/components/` | Early styling file for hospital editing, orphaned when `EditHospital.jsx` was linked to `AddHospitalForm.css`. |

---

## 🚀 Transition to Version 2

In **Version 2**, CuraMap was upgraded to solve the manual entry bottleneck:
* **Automated Data Pipeline**: Integrates live **OpenStreetMap (OSM) Overpass API** with fallback and enrichment from the **National Government Hospital Directory** (30,274+ verified facilities).
* **Role-Based Governance**: Three distinct user tiers: **Regular User**, **Verified Hospital Administrator**, and **Super Administrator**.
* **Verification Workflow**: Hospital administrators submit official verification requests (`HospitalAdminRequest.jsx`) reviewed by the Super Admin before gaining management rights.
* **Real-Time Resource Updates**: Verified administrators dynamically update real-time bed, ICU, oxygen, ventilator, and ambulance availability.
* **Modern Discovery UI**: Dynamic interactive map with clustering, live distance calculation, radius selection, and directions.
