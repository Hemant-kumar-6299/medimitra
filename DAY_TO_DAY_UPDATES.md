# 📅 MediNear – Day-to-Day Updation Log (Project Progress Tracker)

This document tracks all tasks, milestones, and development updates completed from project initiation up to today.

---

## 📌 Project Overview
* **Project Name**: MediNear – Emergency Medicine Availability & Pharmacy Finder
* **Backend**: Java 17, Spring Boot, Spring Data JPA, Spring Security, JJWT
* **Frontend**: React 19, Vite, Vanilla CSS Design System, Lucide Icons
* **Database**: PostgreSQL (Cloud Hosted on Supabase)
* **Architecture**: Stateless RESTful API Architecture with Role-Based Access Control (`USER`, `PHARMACY`, `ADMIN`)

---

## 🗓️ Progress Log by Phase & Date

### Phase 1: Requirement Analysis, Architecture & Specification
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Detailed requirement document created: [🚑 MediNear – Emergency Medicine Finder.md](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/%F0%9F%9A%91%20MediNear%20%E2%80%93%20Emergency%20Medicine%20Finder.md).
  2. Identified real-world emergency healthcare challenges:
     - Patients visiting multiple pharmacies blindly during acute health crises.
     - Lack of real-time stock visibility for life-saving drugs (Insulin, Inhalers, Nitroglycerin).
     - Need for distance-prioritized pharmacy discovery and temporary medicine reservation.
  3. Defined system roles:
     - `USER` (Citizen / Patient)
     - `PHARMACY` (Chemist / Store Owner)
     - `ADMIN` (System Auditor & Verifier)

---

### Phase 2: Backend Scaffolding & Dependencies Setup
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Configured Maven build descriptor (`pom.xml`) targeting Java 17.
  2. Added core starter dependencies:
     - `spring-boot-starter-webmvc` (REST APIs)
     - `spring-boot-starter-data-jpa` (Hibernate ORM)
     - `spring-boot-starter-validation` (Bean Validation)
     - `spring-boot-starter-security` (Security & Filters)
     - `postgresql` JDBC Driver (Supabase integration)
     - `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (v0.12.6 for JSON Web Tokens)
     - `lombok` (Boilerplate reduction)
  3. Verified compilation with Maven Wrapper (`./mvnw compile`).
  4. Verified initial health check endpoint `/api/test/health`.

---

### Phase 3: Cloud Database Integration & Entity Modeling (Supabase PostgreSQL)
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Configured Supabase PostgreSQL connection in `application.properties`:
     - Database Host: `db.xfsubnzzyspzycyyjjrq.supabase.co:5432`
     - Driver: `org.postgresql.Driver` with SSL enabled (`sslmode=require`).
     - Hibernate `ddl-auto=update` for automated schema generation.
  2. Designed and implemented JPA entities with relational mapping:
     - `User`: Handles credentials, email unique constraints, contact phone, and `Role` enum.
     - `Pharmacy`: Stores store name, address, latitude, longitude coordinates, operating hours, open status, verification badge, and owner relationship.
     - `Medicine`: Master drug catalog with name, manufacturer, category, and clinical indications.
     - `PharmacyMedicine`: Composite relational entity linking pharmacies with medicines, tracking stock quantity, unit price, availability flag, and last updated timestamps.
     - `Reservation`: Manages hold tickets with user reference, pharmacy reference, medicine reference, quantity, status enum (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), and 30-minute expiry timestamps.
  3. Created Spring Data JPA Repositories:
     - `UserRepository`, `PharmacyRepository`, `MedicineRepository`, `PharmacyMedicineRepository`, `ReservationRepository`.
     - Added eager fetch custom queries (`JOIN FETCH`) to optimize database access and avoid lazy initialization overhead.

---

### Phase 4: Authentication & Security Architecture
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Implemented Spring Security filter chain in `SecurityConfig.java`:
     - Stateless session management (`SessionCreationPolicy.STATELESS`).
     - Configured permissive CORS headers allowing React frontend communication.
     - Public access to `/api/auth/register`, `/api/auth/login`, and GET queries for `/api/medicines/**` and `/api/pharmacies/**`.
     - Secured mutations and reservations under JWT bearer token verification.
  2. Built JWT utilities (`JwtUtils.java`):
     - HMAC-SHA256 signature algorithm with a 256-bit secret key.
     - 24-hour token validity.
     - Token generation, claims extraction, and token expiration validation.
  3. Implemented `JwtAuthenticationFilter.java` and `CustomUserDetailsService.java` for intercepting incoming HTTP requests and establishing security context.
  4. Developed `AuthService.java` and `AuthController.java`:
     - Password hashing via `BCryptPasswordEncoder`.
     - `POST /api/auth/register` (Citizen or Pharmacy registration).
     - `POST /api/auth/login` (Returns JWT token and user profile).
     - `GET /api/auth/me` (Profile retrieval).

---

### Phase 5: Business Services & REST API Layer
* **Status**: ✅ Completed
* **Tasks Done**:
  1. **Geospatial Math Engine (`GeoUtils.java`)**:
     - Implemented the Haversine formula to compute great-circle distance in kilometers between two GPS coordinates `(lat1, lon1)` and `(lat2, lon2)`.
  2. **Medicine Service & Controller (`MedicineService.java`, `MedicineController.java`)**:
     - `GET /api/medicines`: Master catalog listing.
     - `GET /api/medicines/search`: Drug search by keyword/category.
     - `POST /api/medicines`: Add new medicine to master catalog.
     - `GET /api/medicines/emergency-search`: Core emergency algorithm querying all pharmacies with stock, computing distance, filtering by radius, and sorting (In-Stock first ➔ Open stores first ➔ Closest distance first).
  3. **Pharmacy Service & Controller (`PharmacyService.java`, `PharmacyController.java`)**:
     - `GET /api/pharmacies`: Directory listing with computed distances.
     - `GET /api/pharmacies/my`: Pharmacy owner profile lookup.
     - `PATCH /api/pharmacies/{id}/toggle-status`: 1-click toggle for store Open / Closed status.
     - `GET /api/pharmacies/{id}/medicines`: Store-specific inventory lookup.
     - `POST /api/pharmacies/{id}/medicines`: Stock adjustment (quantity & unit price).
     - `DELETE /api/pharmacies/{pharmacyId}/medicines/{medicineId}`: Remove item from inventory.
  4. **Reservation Service & Controller (`ReservationService.java`, `ReservationController.java`)**:
     - `POST /api/reservations`: Reserves medicine with automatic 30-minute validity (`expiry_time = now + 30 min`).
     - `GET /api/reservations/my`: Citizen reservation ticket tracker with remaining minutes calculation and auto-expiration.
     - `GET /api/reservations/pharmacy`: Pharmacy incoming orders feed.
     - `PUT /api/reservations/{id}/confirm`: Pharmacy confirms order and automatically deducts stock from inventory.
     - `PUT /api/reservations/{id}/cancel`: Cancels reservation and automatically restores stock if previously confirmed.
     - `PUT /api/reservations/{id}/complete`: Marks order as picked up / completed.
  5. **Admin Service & Controller (`AdminService.java`, `AdminController.java`)**:
     - `GET /api/admin/stats`: Live system KPIs (Total Users, Pharmacies, Verified Stores, Catalog Medicines, Active Holds, Total Stock Items).
     - `PUT /api/admin/pharmacies/{id}/verify`: Verify or unverify pharmacy partner.
     - `GET /api/admin/users`: Audit registered accounts.

---

### Phase 6: Automated Data Seeder (`DataInitializer.java`)
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Built a `CommandLineRunner` component that auto-seeds initial data on application boot if database is empty:
     - 5 Pre-configured accounts (Citizen, Apollo Pharmacy, MedPlus Chemist, CityCare Emergency, System Admin).
     - 10 Critical emergency medicines (Insulin Glargine, Salbutamol Inhaler, Nitroglycerin, Paracetamol 650, Epinephrine Auto-Injector, Azithromycin, Amoxicillin, Cetirizine, ORS, Metformin).
     - 3 Realistically mapped pharmacies in Greater Noida (Alpha Belt, Knowledge Park II, Gamma 1) with precise coordinates.
     - Populated initial stock quantities and realistic pricing.

---

### Phase 7: React Frontend & Bespoke Healthcare Design System
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Initialized React 19 + Vite project in `frontend/`.
  2. Installed `lucide-react` for healthcare, emergency, and navigation icons.
  3. Crafted modern dark clinical design system in `frontend/src/index.css`:
     - Deep slate canvas (`#080c16`) with radial glow ambient accents.
     - Emergency Beacon pulse animation (`beacon-pulse`) for active radar.
     - Glassmorphism surfaces (`var(--bg-glass)`) with subtle borders.
     - Distinctive typography using Google Fonts (**Outfit** for headings, **Plus Jakarta Sans** for body).
  4. Built frontend architecture:
     - `services/api.js`: Unified API client with automatic JWT token injection, unified response unwrapping, and error handling.
     - `context/AuthContext.jsx`: Global auth state, session persistence in `localStorage`, user role tracking, and 1-click test login helpers.
     - `components/Navbar.jsx`: Brand identity, 24/7 SOS badge, navigation tabs, user role pill, quick demo login dropdown.
     - `components/EmergencySearch.jsx`: Hero emergency radar search, instant medicine chips, GPS / preset location dropdown, search radius slider (1–50 km), and pharmacy cards with distance badges.
     - `components/ReservationModal.jsx`: Emergency hold modal with quantity adjuster, cost calculator, and 30-minute validity guarantee.
     - `components/UserReservations.jsx`: Citizen reservation tracker with real-time countdown minutes, status badges, and cancel button.
     - `components/PharmacyDashboard.jsx`: Store owner portal with live Open/Closed switch, incoming hold queue (Confirm/Reject/Fulfill), and stock inventory table.
     - `components/MedicineCatalog.jsx`: Searchable drug directory with category filtering and new drug registration form.
     - `components/PharmacyDirectory.jsx`: Searchable list of connected medical stores with full inventory preview modal.
     - `components/AdminDashboard.jsx`: KPI summary cards, pharmacy verification toggle, and user registry.
     - `components/AuthModal.jsx`: Modal for Sign In and Account Registration with role switcher.
  5. Built and optimized production bundle (`npm run build`) in 782ms.

---

### Phase 8: Full-Stack Integration & Automated Verification
* **Status**: ✅ Completed
* **Tasks Done**:
  1. Bootstrapped Spring Boot backend on `http://localhost:8080`.
  2. Bootstrapped Vite frontend on `http://localhost:5173`.
  3. Created and executed automated test script (`test_integration.ps1`) verifying all live workflows:
     - Frontend HTTP status code 200 and title verification.
     - User authentication via JWT.
     - Emergency medicine search returning pharmacies sorted by distance (0.45 km, 0.91 km, 1.85 km).
     - Creation of reservation #1 with 30-minute hold window.
     - Pharmacy owner login and order confirmation.
     - Verification of inventory stock deduction.
     - Admin dashboard stats retrieval.

---

## 📊 Summary of Current State
| Component | Technology | Port / URL | Status |
| :--- | :--- | :--- | :--- |
| **Backend REST API** | Spring Boot 3.3/4.x (Java 17) | `http://localhost:8080/api` | 🟢 Active & Running |
| **Frontend Web App** | React 19 + Vite | `http://localhost:5173/` | 🟢 Active & Running |
| **Cloud Database** | PostgreSQL (Supabase) | `db.xfsubnzzyspzycyyjjrq.supabase.co` | 🟢 Connected & Seeded |
| **Security Layer** | Spring Security + JWT | Header `Bearer <token>` | 🟢 Enforced |
| **Integration Test** | PowerShell Automated Suite | Localhost | 🟢 100% Passed |

---

## 🔮 Next Planned Steps
1. **Google Maps / Leaflet Map View**: Interactive visual map plotting user location and nearby pharmacies with driving route lines.
2. **Prescription Upload Support**: Allow patients to attach photo of doctor prescription when creating an emergency hold for scheduled drugs.
3. **SMS / WhatsApp Alert Notifications**: Send booking confirmation and 10-minute expiry warning messages to patients and pharmacy owners.
