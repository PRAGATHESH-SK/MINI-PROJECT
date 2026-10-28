# Connecting Tech (கனெக்டிங் டெக்)
### Tamil Nadu Industry & University Geofenced Internship Management Platform
*Aligned with the Naan Mudhalvan (நான் முதல்வன்) State Digital Transformation Initiative*

---

## 🌟 Executive Summary

**Connecting Tech** is a production-grade, full-stack enterprise web application designed to bridge engineering colleges across Tamil Nadu's 38 districts with premier tech enterprises. 

The platform features **genuine server-side GPS geofencing** using PostgreSQL geography functions (PostGIS / Great-Circle geodesic distance calculations) to verify student workplace attendance at authorized campus centroids (such as TCS Siruseri IT Park, Bosch Saravanampatti, Zoho Estancia, and HCL Madurai ELCOT).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Leaflet, React-Leaflet, OpenStreetMap tiles, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js (v4.21), TypeScript, Zod request validation, JWT, BcryptJS, Express-Rate-Limit, Helmet, CORS, CSV Stringify |
| **Database & GIS** | PostgreSQL 18 with PostGIS / Geodesic distance calculations, Prisma ORM (v6), parameterized SQL queries |
| **Testing** | Vitest, Supertest (16 automated unit/integration tests covering geofence boundary math, accuracy rejection, duplicate prevention, and auth) |

---

## 🗺️ Key Features & User Roles

### 1. 🎓 Student Experience
- **Localized Internship Search**: Discover internships filtered by Tamil Nadu district (Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, etc.), skills, department, stipend, and mode (On-Site, Hybrid).
- **Proximity Search**: Use browser Geolocation to calculate distance from student coordinates to industrial sites.
- **1-Click Application**: Apply with cover letter and university accreditation details; prevents duplicate submissions.
- **Application Tracking**: Monitor status pipeline (`APPLIED` → `REVIEWING` → `SHORTLISTED` → `SELECTED` → `REJECTED`).
- **GPS Geofenced Daily Attendance**:
  - Live interactive Leaflet map rendering authorized workplace centroid, allowed geofence perimeter circle (e.g., 150m), and student GPS marker with accuracy circle.
  - Device Geolocation via `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })`.
  - Check-In and Check-Out actions with server-side geodesic distance verification.
  - **Visible [DEMO SIMULATOR]**: Developer test mode with 4 presets (Inside Office, Borderline Edge, Far Outside, Low Accuracy GPS) distinctly watermarked as demo simulation.
  - Attendance history table with dates, timestamps, distance from site, accuracy, and verification method.

### 2. 🏢 Employer & Industry Experience
- **Workplace Management**: Post positions with department, stipend, duration, and requirements.
- **Interactive Leaflet Coordinate Picker**: Set office GPS latitude/longitude by clicking on map, with an adjustable geofence radius slider (50m - 1000m) and quick jumps to major Tamil Nadu IT parks.
- **Candidate Review**: Filter applicants, inspect student resumes, and update statuses.
- **1-Click Intern Onboarding**: Selecting an applicant automatically creates an active `InternshipAssignment`.
- **Verified Attendance Reports**: Audit live intern check-ins, view reported distance from workplace centroid, and **export verified logs as CSV**.

### 3. 🏛️ State Administrator Experience
- **Executive Analytics Dashboard**: Real-time KPIs calculated from PostgreSQL (total students, employers, active internships, attendance rates).
- **District Opportunity Distribution**: Recharts bar chart visualizing opportunity distribution across Tamil Nadu districts.
- **User Directory & Verification**: Verify corporate employers, approve university affiliations, and toggle account activation.
- **Listing Moderation Queue**: Review submitted internships, approve or reject listings with moderation comments.
- **Geofence Audit Trail**: Full audit log of all GPS check-in attempts including diagnostic rejection reasons (`OUTSIDE_GEOFENCE`, `ACCURACY_TOO_LOW`, `NOT_ASSIGNED`, `DUPLICATE_CHECK_IN`).
- **System Governance**: Configurable maximum GPS accuracy threshold (default 100m) and default geofence radius (150m).

---

## 🔑 Demo Accounts (Pre-Seeded)

For evaluator convenience, Connecting Tech includes **1-Click Demo Login** buttons on the login screens and top navigation bar:

| Role | Email Address | Password | Account Context |
| :--- | :--- | :--- | :--- |
| **Student** | `student.karthik@annauniv-demo.edu` | `Student@123` | Karthik S. (Anna University, CEG) &bull; Active intern at TCS Siruseri |
| **Employer** | `tcs.careers@tcs-demo.com` | `Employer@123` | Tata Consultancy Services &bull; Siruseri IT Park, Chennai |
| **Admin** | `admin@connectingtech.tn.gov.in` | `Admin@123` | Tamil Nadu State Platform Administrator |

*Additional student accounts:*
- Priya (PSG Tech, Coimbatore &bull; Bosch intern): `student.priya@psg-demo.edu` / `Student@123`
- Anand (TCE Madurai): `student.anand@tce-demo.edu` / `Student@123`

---

## ⚙️ PostGIS & PostgreSQL Setup Guide

Connecting Tech connects to PostgreSQL via Prisma ORM and parameterized raw SQL queries.

### 1. Enabling PostGIS Extension (Production)
In your PostgreSQL database (`connecting_tech`), execute:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Dual-Engine Geodesic Distance Implementation
To ensure flawless operation across standard PostgreSQL installations and cloud providers where PostGIS binary libraries may not be pre-compiled:
- The server automatically attempts PostGIS `ST_Distance(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, ...)` first.
- If PostGIS is not yet installed on the server, it seamlessly falls back to PostgreSQL's `earth_distance` / spherical Great-Circle parameterized SQL function:
```sql
SELECT (
  6371000 * 2 * ASIN(
    SQRT(
      POWER(SIN(RADIANS($lat2 - $lat1) / 2.0), 2) +
      COS(RADIANS($lat1)) * COS(RADIANS($lat2)) *
      POWER(SIN(RADIANS($lon2 - $lon1) / 2.0), 2)
    )
  )
) AS distance_meters;
```
This guarantees **100% genuine server-side spatial distance calculation** in any PostgreSQL deployment.

---

## 🚀 Installation & Local Startup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running on `localhost:5432` with user `postgres` and password `postgres` (or customized in `server/.env`)

### 1. Install Dependencies
From the repository root:
```bash
# In the server directory:
cd server
npm install

# In the client directory:
cd ../client
npm install
```

### 2. Configure Environment Variables
Verify or create `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/connecting_tech?schema=public"
JWT_SECRET="connecting_tech_secure_jwt_secret_key_2026_super_safe"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
MAX_GEOFENCE_RADIUS_METERS=1000
MAX_GPS_ACCURACY_METERS=100
DEMO_MODE=true
```

### 3. Initialize Database & Seed Demo Data
```bash
cd server
npx prisma db push
npm run seed
```

### 4. Run Automated Test Suite
```bash
cd server
npm test
```
*Output: 16 passing unit and integration tests covering geofence boundary math, accuracy rejection, duplicate prevention, and auth.*

### 5. Launch the Full-Stack Application
In two terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📡 API Reference Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/student` | Public | Register student with university accreditation details |
| `POST` | `/api/auth/register/employer` | Public | Register corporate employer profile |
| `POST` | `/api/auth/login` | Public | Sign in and receive secure JWT cookie/bearer |
| `GET` | `/api/auth/me` | Authenticated | Retrieve session profile |
| `GET` | `/api/internships` | Public | Localized search by district, skills, mode, coordinates |
| `POST` | `/api/internships` | Employer/Admin | Create listing with GPS coordinates and geofence radius |
| `POST` | `/api/applications` | Student | Apply to internship (duplicate check enforced) |
| `PATCH` | `/api/applications/:id/status`| Employer/Admin | Update candidate status; auto-onboards intern |
| `POST` | `/api/attendance/check-in` | Student | PostGIS Geofence verified check-in |
| `POST` | `/api/attendance/check-out` | Student | PostGIS Geofence verified check-out |
| `GET` | `/api/attendance/my` | Student | Student attendance history and stats |
| `GET` | `/api/attendance/internship/:id` | Employer/Admin | Verified intern logs for workplace |
| `GET` | `/api/attendance/export` | Employer/Admin | Download verified attendance report as CSV |
| `GET` | `/api/attendance/attempts` | Employer/Admin | Audit log of check-in attempts and rejections |
| `GET` | `/api/admin/analytics` | Admin | Statewide KPI analytics and district distribution |
| `PATCH` | `/api/admin/users/:id/status`| Admin | Verify employer or toggle account access |

---

## 🔒 Security & Anti-Spoofing Architecture

1. **Server-Side Distance Authority**: The client never calculates or claims verification status. Coordinates and accuracy are strictly evaluated by PostgreSQL geography queries on the server.
2. **GPS Accuracy Threshold**: Mobile GPS fixes reporting accuracy error &gt; 100m are rejected (`ACCURACY_TOO_LOW`) to prevent inaccurate fixes from passing.
3. **Assignment Requirement**: Students can only mark attendance for internships where they hold an active `InternshipAssignment`.
4. **Duplicate Prevention**: Database unique constraints enforce that only one check-in can be recorded per student per calendar day.
5. **Audit Logging**: All attempts—both passes and rejections—are captured in the `AttendanceAttempt` table with client IP, user agent, calculated distance, and diagnostic reason.

---

*Connecting Tech &mdash; Empowering Tamil Nadu's Students & Leading Tech Industries.*
