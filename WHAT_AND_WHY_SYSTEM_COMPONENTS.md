# 🧠 MediNear – What and Why Guide (System Components & Architecture Rationale)

This guide documents **every component, technology, library, architectural decision, and file** in the MediNear project — detailing **WHAT it is** and **WHY it was chosen and used**.

---

## 📑 Table of Contents
1. [Core Technology Stack (What & Why)](#1-core-technology-stack-what--why)
2. [Architectural Decisions & Patterns](#2-architectural-decisions--patterns)
3. [Backend Code Structure (Java / Spring Boot)](#3-backend-code-structure-java--spring-boot)
4. [Database Schema & Entity Relational Design](#4-database-schema--entity-relational-design)
5. [Frontend Components & Modules (React + Vite)](#5-frontend-components--modules-react--vite)
6. [Emergency Domain-Specific Rationale](#6-emergency-domain-specific-rationale)

---

## 1. Core Technology Stack (What & Why)

### ☕ Java 17
* **What it is**: A modern Long-Term Support (LTS) release of the Java programming language.
* **Why it is used**:
  - Provides strong type safety, high execution speed, and battle-tested reliability for enterprise and mission-critical applications (such as healthcare systems).
  - Modern language features (Records, pattern matching, enhanced switch expressions, better garbage collection) improve developer productivity and runtime efficiency.

### 🍃 Spring Boot (3.3 / 4.x)
* **What it is**: An enterprise-grade, opinionated Java framework used to build production-ready web services and microservices.
* **Why it is used**:
  - **Embedded Tomcat Server**: Eliminates the need to configure external application servers; the application runs self-contained on port 8080.
  - **Auto-Configuration & Dependency Injection**: Automatically configures database pools (HikariCP), ORM (Hibernate), and transaction management, allowing developers to focus on business logic rather than boilerplate plumbing.
  - **Ecosystem Integration**: Seamlessly unifies Spring Web, Spring Data JPA, and Spring Security.

### ⚡ Supabase (Cloud Hosted PostgreSQL)
* **What it is**: An open-source, cloud-managed PostgreSQL database platform with high availability and automated backups.
* **Why it is used**:
  - **Zero Local Setup**: Eliminates issues with local MySQL/PostgreSQL installation, version discrepancies, and port conflicts across different machines.
  - **Relational Integrity**: PostgreSQL provides strict ACID compliance, foreign key constraints, and reliable transactional locks essential for preventing double-reservation of limited medicine inventory.
  - **Production-Ready**: The cloud database URL (`jdbc:postgresql://db.xfsubnzzyspzycyyjjrq.supabase.co:5432/postgres?sslmode=require`) connects securely via TLS, allowing the system to scale beyond localhost.

### 🔐 Spring Security & JSON Web Tokens (JJWT 0.12.6)
* **What it is**: A security framework for authentication and authorization, paired with JJWT for stateless token generation and signature verification.
* **Why it is used**:
  - **Stateless Architecture**: Traditional HTTP sessions require server-side memory to store session IDs. JWT embeds user claims (ID, email, role) inside a signed token, allowing horizontal scaling and cross-origin compatibility.
  - **Role-Based Access Control (RBAC)**: Enables granular endpoint security (`@PreAuthorize("hasRole('PHARMACY')")`), ensuring patients cannot edit medicine stock, and unverified stores cannot access administrative controls.
  - **HMAC-SHA256 Cryptography**: Prevents token tampering; any modified payload will fail signature verification.

### ⚛️ React 19 + Vite
* **What it is**: A modern declarative UI library paired with Vite, a blazing-fast next-generation frontend build tool.
* **Why it is used**:
  - **Instant HMR (Hot Module Replacement)**: Vite uses native ES modules, compiling and updating UI components in milliseconds during development.
  - **Component-Based Architecture**: Allows isolating reusable UI units (Emergency search radar, pharmacy cards, countdown timers, reservation modals).
  - **Production Optimization**: Vite's Rollup pipeline creates compact, code-split bundles that load instantly during medical emergencies when network latency might be poor.

### 🎨 Vanilla CSS Design System (index.css)
* **What it is**: Pure CSS styling utilizing modern CSS custom properties (variables), Flexbox, CSS Grid, and CSS animations.
* **Why it is used**:
  - Eliminates heavy third-party framework overhead (like Tailwind or Bootstrap build steps).
  - Full aesthetic control to deliver a bespoke **Clinical Dark Slate UI** tailored specifically for emergency visibility (high contrast, emergency beacon animations, clear status indicators).

### 🩺 Lucide React Icons
* **What it is**: An open-source, lightweight, consistent SVG icon set.
* **Why it is used**:
  - Healthcare and emergency interfaces rely heavily on universal visual cues (Pills, Sirens, Hospitals, Distance pins, Clocks, Verified shields, Direct phone calls) for fast recognition during high-stress situations.

---

## 2. Architectural Decisions & Patterns

| Architectural Decision | What It Means | Why It Was Chosen |
| :--- | :--- | :--- |
| **Layered Architecture** | Strict separation: Controller ➔ Service ➔ Repository ➔ Entity | Promotes single responsibility, maintainability, and allows independent unit testing of business rules without HTTP overhead. |
| **Data Transfer Objects (DTOs)** | Passing specialized DTO classes across network boundaries instead of raw JPA entities | Prevents recursive JSON serialization loops, shields internal database schemas, avoids over-fetching, and prevents mass assignment vulnerabilities. |
| **Haversine Proximity Math** | Mathematical formula calculating spherical earth distance between `(lat1, lon1)` and `(lat2, lon2)` | Enables distance calculation on the fly without requiring expensive external Google Maps API billing or complex GIS database extensions. |
| **30-Minute Hold Window** | Temporary medicine reservation that automatically expires in 30 minutes | In emergency medicine, patients need guaranteed availability while traveling to the pharmacy, but pharmacies cannot hold scarce medicines indefinitely if a patient fails to show up. |
| **Automated Data Seeder** | `CommandLineRunner` that populates initial medicines and pharmacies on startup | Ensures that anyone running or grading the project immediately has a rich, functioning dataset without manual database imports. |

---

## 3. Backend Code Structure (Java / Spring Boot)

### 📁 `src/main/java/com/medinear/`

#### 1. Entity Layer (`com.medinear.entity`)
* [User.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/entity/User.java): Stores user accounts, bcrypt hashed passwords, roles (`USER`, `PHARMACY`, `ADMIN`), and contact phone numbers.
* [Pharmacy.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/entity/Pharmacy.java): Represents physical medical stores with geospatial coordinates (`latitude`, `longitude`), address, phone, opening/closing hours, open status (`isOpen`), and admin verification status (`verified`).
* [Medicine.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/entity/Medicine.java): Master catalog of drugs containing standard pharmaceutical names, manufacturer, category, and indications.
* [PharmacyMedicine.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/entity/PharmacyMedicine.java): Connects medicines to pharmacies. Tracks real-time `quantity`, unit `price`, and `available` flag. Automatically sets `available = false` when `quantity <= 0`.
* [Reservation.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/entity/Reservation.java): Stores medicine hold tickets, user references, pharmacy references, status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `EXPIRED`), creation time, and 30-minute expiry time.

#### 2. Repository Layer (`com.medinear.repository`)
* [PharmacyMedicineRepository.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/repository/PharmacyMedicineRepository.java):
  - **What**: Data access interface extending `JpaRepository`.
  - **Why**: Contains optimized JPQL `@Query` with `JOIN FETCH pm.pharmacy p JOIN FETCH pm.medicine m` to fetch complete emergency medicine search records in a single database round-trip, completely avoiding Hibernate N+1 query performance penalties.
* [ReservationRepository.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/repository/ReservationRepository.java):
  - **What**: Query interface for reservations.
  - **Why**: Features eager-fetch queries sorted by creation timestamp descending (`ORDER BY r.createdAt DESC`) so patients and pharmacies always see their most recent emergency requests first.

#### 3. Service Layer (`com.medinear.service`)
* [MedicineService.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/service/MedicineService.java):
  - **What**: Business logic for drug lookups and the core emergency search algorithm.
  - **Why**: Implements multi-tier sorting: (1) In-stock items first, (2) Currently open stores first, (3) Closest physical distance in km first.
* [PharmacyService.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/service/PharmacyService.java):
  - **What**: Store profile and inventory management.
  - **Why**: Validates that only the authenticated pharmacy owner or system admin can edit medicine stock, update prices, or toggle the store open/closed switch.
* [ReservationService.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/service/ReservationService.java):
  - **What**: Reservation lifecycle and stock synchronization.
  - **Why**: Automatically deducts inventory when the pharmacy confirms a hold; automatically restores inventory if the hold is cancelled; automatically flags reservations as `EXPIRED` if the 30-minute window elapses.
* [AdminService.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/service/AdminService.java):
  - **What**: Platform auditing and pharmacy verification.
  - **Why**: Ensures rogue stores cannot claim verified status without admin approval.
* [DataInitializer.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/service/DataInitializer.java):
  - **What**: Automatic database seeder.
  - **Why**: Seeds realistic data (Insulin, Inhalers, Nitroglycerin, Greater Noida pharmacies) on application start so the application is immediately ready to demonstrate.

#### 4. Controller Layer (`com.medinear.controller`)
* [MedicineController.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/controller/MedicineController.java): Exposes `/api/medicines` and `/api/medicines/emergency-search`.
* [PharmacyController.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/controller/PharmacyController.java): Exposes `/api/pharmacies`, `/api/pharmacies/my`, and inventory endpoints `/api/pharmacies/{id}/medicines`.
* [ReservationController.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/controller/ReservationController.java): Exposes `/api/reservations`, `/api/reservations/my`, and confirmation endpoints.
* [AuthController.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/controller/AuthController.java): Exposes `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
* [AdminController.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/controller/AdminController.java): Exposes `/api/admin/stats` and `/api/admin/pharmacies/{id}/verify`.

#### 5. Security Layer (`com.medinear.security`)
* [SecurityConfig.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/security/SecurityConfig.java): Configures the Spring Security filter chain, public routes, CORS policy, and password encoder.
* [JwtUtils.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/security/JwtUtils.java): Signs and verifies JSON Web Tokens using a secret key.
* [JwtAuthenticationFilter.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/security/JwtAuthenticationFilter.java): Intercepts incoming requests, extracts the `Authorization: Bearer <token>` header, and populates Spring's `SecurityContextHolder`.

#### 6. Utilities (`com.medinear.util`)
* [GeoUtils.java](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/src/main/java/com/medinear/util/GeoUtils.java): Contains the Haversine trigonometric formula to calculate distance in kilometers based on Earth radius (6,371 km).

---

## 4. Database Schema & Entity Relational Design

```text
  users
  ├── id (PK)
  ├── name
  ├── email (UNIQUE)
  ├── password (BCrypt hash)
  ├── phone
  └── role (USER / PHARMACY / ADMIN)
       │
       ▼ (1 to 1)
  pharmacies
  ├── id (PK)
  ├── owner_id (FK -> users.id)
  ├── name
  ├── address
  ├── latitude
  ├── longitude
  ├── phone
  ├── opening_time / closing_time
  ├── is_open
  └── verified
       │
       ▼ (1 to Many)
  pharmacy_medicines ◄───────── medicines
  ├── id (PK)                   ├── id (PK)
  ├── pharmacy_id (FK)          ├── name
  ├── medicine_id (FK)          ├── manufacturer
  ├── quantity                  ├── category
  ├── price                     └── description
  ├── available
  └── last_updated
       │
       ▼ (Referenced in)
  reservations
  ├── id (PK)
  ├── user_id (FK -> users.id)
  ├── pharmacy_id (FK -> pharmacies.id)
  ├── medicine_id (FK -> medicines.id)
  ├── quantity
  ├── status (PENDING / CONFIRMED / COMPLETED / CANCELLED / EXPIRED)
  ├── created_at
  └── expiry_time (created_at + 30 minutes)
```

### Why a Composite Join Table (`pharmacy_medicines`)?
In a real-world healthcare ecosystem, a medicine (e.g. *Insulin Glargine*) is not owned by one pharmacy. It is produced by a manufacturer and stocked at hundreds of independent pharmacies. Each pharmacy has its own independent **stock quantity** and **selling price**. The `pharmacy_medicines` table models this many-to-many relationship cleanly without data duplication.

---

## 5. Frontend Components & Modules (React + Vite)

### 📁 `frontend/src/`

#### 1. Core Services & Context
* [api.js](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/services/api.js):
  - **What**: Centralized HTTP client.
  - **Why**: Automatically reads JWT tokens from `localStorage` and appends `Authorization: Bearer <token>` to requests. Unwraps standardized backend `ApiResponse<T>` envelopes so components receive pure data.
* [AuthContext.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/context/AuthContext.jsx):
  - **What**: Global React Context providing user profile and login state.
  - **Why**: Keeps session synchronized across navbar, reservation modals, and dashboards without prop drilling. Includes `loginAsDemo()` helper allowing 1-click test logins as Citizen, Pharmacy Owner, or Admin.

#### 2. User Interface Components
* [Navbar.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/Navbar.jsx):
  - **What**: Sticky top navigation bar.
  - **Why**: Displays the active 24/7 SOS radar pulse, tab navigation, active role badge, and 1-click demo switcher.
* [EmergencySearch.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/EmergencySearch.jsx):
  - **What**: Main hero feature of the application.
  - **Why**: Features quick chips for critical medicines (Insulin, Inhaler, Nitroglycerin, Epinephrine), browser GPS detection + preset city locations (Knowledge Park, Alpha Belt, Pari Chowk, Noida, Delhi), a distance radius slider (1–50 km), and pharmacy cards with distance badges.
* [ReservationModal.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/ReservationModal.jsx):
  - **What**: Hold confirmation dialog.
  - **Why**: Allows adjusting quantity, calculates total cost in INR, shows pharmacy address, and clearly states the 30-minute hold validity rules.
* [UserReservations.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/UserReservations.jsx):
  - **What**: Citizen's active reservations tracker.
  - **Why**: Displays live countdown timer for active holds, status badges, direct call buttons, and cancellation option.
* [PharmacyDashboard.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/PharmacyDashboard.jsx):
  - **What**: Store owner portal.
  - **Why**: Provides an instant Open/Closed toggle switch, an incoming holds queue with Confirm and Complete buttons, and an inventory manager to add and update stock quantities.
* [MedicineCatalog.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/MedicineCatalog.jsx):
  - **What**: Master drug directory.
  - **Why**: Allows browsing by medical category and features a 1-click "Find Nearby Pharmacies with Stock" button for any selected drug.
* [PharmacyDirectory.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/PharmacyDirectory.jsx):
  - **What**: Directory of all connected medical stores.
  - **Why**: Shows store operating hours, phone numbers, and includes a modal to inspect full store inventory.
* [AdminDashboard.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/AdminDashboard.jsx):
  - **What**: Administrative audit panel.
  - **Why**: Shows platform KPIs and allows one-click verification of pharmacy partners.
* [AuthModal.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/components/AuthModal.jsx):
  - **What**: Login and registration modal with role selector and 1-click test credentials.

#### 3. Styling (`index.css`)
* [index.css](file:///c:/Users/lenovo/OneDrive/Desktop/pbl/frontend/src/index.css):
  - **What**: Complete custom stylesheet.
  - **Why**: Implements surgical dark mode (`#080c16`), emergency pulse keyframe animations, glassmorphism cards, custom scrollbars, and responsive grid layouts.

---

## 6. Emergency Domain-Specific Rationale

1. **Why prioritize distance over price in emergency search?**
   - During acute health emergencies (e.g. asthma attack, diabetic shock, acute angina), travel time is critical. Saving 50 rupees is meaningless if the pharmacy is 15 km away. Distance and open status are prioritized first, followed by price.
2. **Why a 30-minute reservation expiry?**
   - Essential emergency medicines often face scarcity. Pharmacies cannot hold medicines for hours if a customer does not show up, as other emergency patients might need them. A 30-minute window gives the reserving patient enough travel time while protecting inventory turnover.
3. **Why require admin verification for pharmacies?**
   - Counterfeit or unlicensed pharmacies pose severe risks. The admin verification layer ensures only legitimate pharmacies with valid licenses are marked with the verified trust badge.
