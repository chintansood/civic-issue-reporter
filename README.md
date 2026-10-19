# CivicScan — AI-Powered Civic Issue Intelligence

CivicScan is an enterprise-grade full-stack web application designed for municipal corporations to detect, route, and resolve civic infrastructure issues (such as road damage/potholes, garbage accumulation, and waterlogging) using real-time AI computer vision.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 / modern Next.js with TypeScript, Tailwind CSS, Lucide icons, Recharts
- **Backend:** FastAPI (Python 3.14)
- **Database:** PostgreSQL with SQLAlchemy ORM (with SQLite fallback)
- **Machine Learning:** YOLOv8 neural network loaded from `ml/weights/best.pt`
- **Auth:** JWT authentication with secure httpOnly cookies & bearer tokens
- **Maps:** Leaflet.js (`react-leaflet`) with severity-colorized pin markers
- **File Storage:** Local disk (`uploads/` directory) served via static mount

---

## 🚀 Complete User Flows

### 1. Citizen Flow
1. **Landing Page (`/`):** Hero section, live municipal stats bar, 3-step autonomous workflow breakdown, and CTAs.
2. **Auth (`/auth`):** Unified toggle between Sign In and Sign Up with role assignment, input validations, password reset modal, and 1-click demo logins.
3. **Citizen Dashboard (`/citizen/dashboard`):** Personalized greeting, KPI overview (Total, Pending, In Progress, Resolved), interactive Leaflet city map, recent reports feed, and quick report button.
4. **Report Submission Flow (`/citizen/report`):**
   - **Step 1 (Upload):** Client-side image compression with `browser-image-compression`, instant preview, automated browser geolocation + interactive map pin adjustment.
   - **Step 2 (AI Detection):** Live scanning line visual animation with sequential multi-stage neural checks.
   - **Step 3 (Review):** YOLOv8 cyan bounding box overlays, issue categorization chips, severity ratings, estimated repair budget, assigned department, and nearby duplicate detection.
   - **Step 4 (Success):** Reference ID receipt (`#CS-XXXXXX`), urgency assessment score bar, tracking shortcut, and shareable link.
5. **My Reports (`/citizen/reports`):** Tabbed filtering (All, Pending, In Progress, Resolved), search by keyword or ward, and slide-in right drawer for complete incident history.

### 2. Department Staff Flow
1. **Staff Dashboard (`/staff/dashboard`):** 56px icon rail, department command header, shift workload metrics, and 3-column Kanban dispatch board (`Pending Review`, `In Progress`, `Resolved`).
2. **Staff Report Drawer:** Detailed photo review, mini Leaflet coordinates, citizen contact info, resolution note composer, and 1-click status transitions.
3. **Territory Map View (`/staff/map`):** Full-screen interactive Leaflet map of all assigned ward incidents with floating filter chips.

### 3. Municipal Admin Flow
1. **Admin Control Center (`/admin/dashboard`):** Full-screen dark-themed Leaflet map background, floating KPI summary bars, department performance completion gauges, and 14-day daily incident volume line chart.
2. **Analytics Command (`/admin/analytics`):** Detailed Recharts visualizations for issue breakdown, daily reporting velocity, department resolution rates, and top geographical hotspots.

---

## 🔑 Demo Credentials

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@civicscan.com` | `admin123` | Municipal HQ |
| **Roads Staff** | `roads@civicscan.com` | `staff123` | Roads Department |
| **Sanitation Staff**| `sanitation@civicscan.com`| `staff123` | Sanitation Department |
| **Water Staff** | `water@civicscan.com` | `staff123` | Water & Drainage Department |
| **Citizen** | `citizen@civicscan.com`| `citizen123`| Citizen Portal |

*(You can also click any of the 1-click demo buttons on `/auth` for instant sign-in).*

---

## 🏃‍♂️ How to Run

### 1. Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/`

### 2. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Open: `http://localhost:3000`

---

## 🗄️ Database Schema & Architecture

- **`users`:** `user_id`, `name`, `email`, `password_hash`, `phone`, `role` (citizen/staff/admin), `department_id`, `created_at`
- **`departments`:** `dept_id`, `name`, `issue_types`, `head_name`, `contact_email`
- **`reports`:** `report_id`, `user_id`, `image_url`, `result_image_url`, `result_image_b64`, `issue_type`, `confidence`, `severity`, `latitude`, `longitude`, `location_name`, `status`, `department_id`, `urgency_score`, `duplicate_of`, `duplicate_count`, `cost_estimate_min`, `cost_estimate_max`, `description`, `staff_notes`, `created_at`, `updated_at`, `resolved_at`
- **`status_history`:** `history_id`, `report_id`, `old_status`, `new_status`, `changed_by`, `notes`, `changed_at`
- **`notifications`:** `notif_id`, `user_id`, `report_id`, `message`, `type`, `is_read`, `created_at`
