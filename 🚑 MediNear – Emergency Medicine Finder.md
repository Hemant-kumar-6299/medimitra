# 🚑 MediNear – Emergency Medicine Finder

## 📌 Project Description

**MediNear – Emergency Medicine Finder** is a web-based application developed to help people quickly find the availability of medicines in nearby pharmacies, especially during emergency situations.

When a user urgently needs a particular medicine, they can search for the medicine and view nearby pharmacies that have reported the medicine as available. The application can prioritize results based on factors such as medicine availability, distance, and pharmacy status.

The project aims to reduce the time and effort required to search for emergency medicines by connecting users with nearby pharmacies through a single platform.

---

# 🎯 Project Objective

The main objective of MediNear is to:

- Help users find emergency medicines quickly.
- Provide information about nearby pharmacies.
- Display medicine availability.
- Reduce the time spent visiting multiple pharmacies.
- Allow pharmacies to maintain and update their medicine inventory.
- Provide a centralized platform connecting users and pharmacies.

---

# 🌍 Real-Life Problems Solved

In emergency situations, finding a required medicine can be difficult.

### Problem 1: Visiting Multiple Pharmacies

A person may visit several pharmacies before finding the required medicine.

**Solution:**  
The application allows users to search for medicine availability before visiting a pharmacy.

---

### Problem 2: Lack of Real-Time Availability Information

People usually do not know which nearby pharmacy has a particular medicine in stock.

**Solution:**  
Pharmacies can update their medicine inventory, allowing users to see reported availability.

---

### Problem 3: Time Wasted During Emergencies

During emergencies, every minute can be important.

**Solution:**  
The application helps users identify potentially nearby pharmacies that have the required medicine.

---

### Problem 4: Difficulty Finding Nearby Pharmacies

Users may not know which pharmacies are closest to their location.

**Solution:**  
The system uses location-based search to display nearby pharmacies.

---

### Problem 5: Medicine Out of Stock

A medicine may not be available at the nearest pharmacy.

**Solution:**  
The application can show multiple nearby pharmacies and their availability status.

---

# 👥 Users of the System

The system has three main types of users.

## 👤 1. Customer/User

A normal user who searches for medicines.

### User Features

- Register and login.
- Search for medicines.
- View nearby pharmacies.
- Check reported medicine availability.
- View pharmacy details.
- Request or reserve a medicine.
- View reservation status.
- Access emergency medicine search.

---

## 🏪 2. Pharmacy Owner

Pharmacy owners manage their pharmacy and medicine inventory.

### Pharmacy Features

- Register pharmacy.
- Add medicine details.
- Update medicine stock.
- Update medicine availability.
- Update medicine price.
- View medicine requests.
- Manage reservations.
- Update pharmacy information.

---

## 👨‍💼 3. Administrator

The administrator manages the overall system.

### Admin Features

- Manage users.
- Verify pharmacies.
- Manage medicine records.
- Monitor system activity.
- Remove incorrect medicine listings.
- Manage reported issues.

---

# ⭐ Main Features

## 🔍 Medicine Search

Users can search for a medicine by entering its name.

### Example

```text
Medicine: Paracetamol
Location: Greater Noida
```

The system displays pharmacies where the medicine is reported to be available.

---

## 📍 Nearby Pharmacy Finder

The application identifies pharmacies near the user's location.

Users can view:

- Pharmacy name.
- Address.
- Distance.
- Contact details.
- Medicine availability.
- Pharmacy opening status.

---

## 🚨 Emergency Mode

The emergency mode helps users quickly search for medicines.

The results can be prioritized based on:

1. Medicine availability.
2. Distance from the user.
3. Pharmacy status.

Example:

```text
🚨 Emergency Search

Medicine: Insulin

Nearby Results:

1. ABC Pharmacy
   Distance: 1.2 km
   Status: Open
   Availability: Available

2. XYZ Medical Store
   Distance: 2.5 km
   Status: Open
   Availability: Available
```

---

## 🏪 Pharmacy Inventory

Pharmacy owners can manage their medicine inventory.

They can:

- Add medicines.
- Update stock quantity.
- Update prices.
- Mark medicines as available.
- Mark medicines as unavailable.

---

## 🔐 User Authentication

The application provides secure authentication.

Features include:

- User registration.
- Login.
- Password encryption.
- JWT authentication.
- Role-based authorization.

Roles:

```text
USER
PHARMACY
ADMIN
```

---

## 💊 Medicine Reservation

Users can request or reserve a medicine from a pharmacy.

Example:

```text
Medicine: Paracetamol

Pharmacy: ABC Medical Store

Reservation Status: Confirmed

Reservation Validity: 30 Minutes
```

---

## 🔔 Notifications

The system can notify users about:

- Reservation confirmation.
- Medicine availability updates.
- Reservation expiry.
- Pharmacy responses.

---

## 🔎 Smart Medicine Search

The application can suggest medicine names when users make spelling mistakes.

Example:

```text
User Input:

Paracitamol
```

Suggestion:

```text
Did you mean: Paracetamol?
```

---

## 🧾 Pharmacy Details

Users can view:

- Pharmacy name.
- Address.
- Phone number.
- Opening hours.
- Medicine availability.
- Distance from the user.

---

# 🔄 Application Workflow

## Step 1: User Registration

The user creates an account.

```text
User
  ↓
Registration
  ↓
Account Created
```

---

## Step 2: User Login

The user logs into the application.

```text
User
  ↓
Login
  ↓
Authentication
  ↓
JWT Token Generated
```

---

## Step 3: Medicine Search

The user searches for a medicine.

```text
User
  ↓
Enter Medicine Name
  ↓
Enter / Share Location
  ↓
Search Request
```

---

## Step 4: Search Processing

The backend processes the request.

```text
Spring Boot Application
        ↓
Search Medicine Database
        ↓
Find Available Pharmacies
        ↓
Calculate Nearby Locations
```

---

## Step 5: Display Results

The system displays relevant pharmacies.

```text
Available Pharmacies
        ↓
Sort by Distance
        ↓
Check Availability
        ↓
Display Results
```

---

## Step 6: Medicine Reservation

The user can reserve the medicine.

```text
User
  ↓
Select Pharmacy
  ↓
Select Medicine
  ↓
Send Reservation Request
  ↓
Pharmacy Confirmation
```

---

# 🏗️ Overall System Workflow

```text
                    ┌───────────────┐
                    │     USER      │
                    └───────┬───────┘
                            │
                     Search Medicine
                            │
                            ▼
                ┌─────────────────────┐
                │   Spring Boot API   │
                └──────────┬──────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │  Medicine Search  │
                 │      Service      │
                 └─────────┬─────────┘
                           │
                           ▼
                    ┌───────────────┐
                    │   Supabase    │
                    │  (PostgreSQL) │
                    └───────┬───────┘
                           │
                           ▼
                  Find Pharmacies
                           │
                           ▼
                 Sort by Distance
                           │
                           ▼
                  Display Results
```

---

# 🛠️ Technology Stack

## Backend

### ☕ Java

Java is used as the primary programming language.

---

### 🍃 Spring Boot

Spring Boot is used to develop the backend application and REST APIs.

---

### 🗄️ Spring Data JPA

Spring Data JPA is used for database operations.

---

### 🔐 Spring Security

Spring Security is used to secure the application.

---

### 🔑 JWT

JWT (JSON Web Token) is used for authentication and authorization.

---

### ⚡ Supabase (PostgreSQL)

Supabase (hosted PostgreSQL) is used to store application data.

---

### 🔄 Hibernate

Hibernate is used as the ORM framework.

---

### 📡 REST APIs

REST APIs are used for communication between the frontend and backend.

---

# 🧰 Development Tools

- IntelliJ IDEA / Eclipse / VS Code
- Postman
- Supabase Dashboard / DBeaver / pgAdmin
- Maven
- Git
- GitHub

---

# 📦 Spring Boot Dependencies

The following dependencies can be selected from Spring Initializr:

```text
Spring Web
Spring Data JPA
Spring Security
PostgreSQL Driver (Supabase)
Validation
Lombok
```

Additional libraries:

```text
JWT Library
```

---

# 🗂️ Suggested Project Structure

```text
src/main/java/com/medinear

├── controller
│   ├── AuthController.java
│   ├── MedicineController.java
│   ├── PharmacyController.java
│   └── ReservationController.java
│
├── service
│   ├── UserService.java
│   ├── MedicineService.java
│   ├── PharmacyService.java
│   └── ReservationService.java
│
├── repository
│   ├── UserRepository.java
│   ├── MedicineRepository.java
│   ├── PharmacyRepository.java
│   └── ReservationRepository.java
│
├── entity
│   ├── User.java
│   ├── Medicine.java
│   ├── Pharmacy.java
│   └── Reservation.java
│
├── dto
│
├── security
│
├── exception
│
└── MediNearApplication.java
```

---

# 🗄️ Database Design

## Users Table

```text
users
----------------
id
name
email
password
phone
role
```

---

## Pharmacy Table

```text
pharmacy
----------------
id
name
address
latitude
longitude
phone
opening_time
closing_time
status
```

---

## Medicine Table

```text
medicine
----------------
id
name
manufacturer
category
description
```

---

## Pharmacy Medicine Table

This table connects medicines with pharmacies.

```text
pharmacy_medicine
----------------
id
pharmacy_id
medicine_id
quantity
price
availability
last_updated
```

---

## Reservation Table

```text
reservation
----------------
id
user_id
pharmacy_id
medicine_id
quantity
status
created_at
expiry_time
```

---

# 🔌 Important REST APIs

## Authentication

```text
POST /api/auth/register

POST /api/auth/login
```

---

## Medicine

```text
GET /api/medicines

GET /api/medicines/search?name=paracetamol

POST /api/medicines
```

---

## Pharmacy

```text
GET /api/pharmacies

GET /api/pharmacies/nearby

POST /api/pharmacies

PUT /api/pharmacies/{id}
```

---

## Reservation

```text
POST /api/reservations

GET /api/reservations/{id}

PUT /api/reservations/{id}/confirm

PUT /api/reservations/{id}/cancel
```

---

# 🚀 Future Enhancements

The project can be expanded with the following features:

- 🤖 AI-powered medicine search.
- 📍 Real-time location tracking.
- 🗺️ Google Maps integration.
- 🔔 Push notifications.
- 📸 Prescription upload.
- 💬 Pharmacy chat system.
- 📊 Advanced analytics dashboard.
- 📱 Mobile application.
- 🌐 Multiple language support.
- ⭐ Pharmacy ratings and reviews.

---

# ⚠️ Important Disclaimer

MediNear is an **information and availability platform**. It should not provide medical diagnosis or recommend prescription medicines without appropriate professional oversight.

Medicine availability information depends on data maintained by participating pharmacies. Users should confirm availability directly with the pharmacy before visiting.

For prescription medicines, all applicable medical and legal requirements must be followed.

---

# 🎓 Learning Outcomes

By developing this project, you can learn:

- Java programming.
- Spring Boot.
- REST API development.
- CRUD operations.
- Spring Data JPA.
- Hibernate.
- Supabase (PostgreSQL).
- Spring Security.
- JWT authentication.
- Role-based authorization.
- Exception handling.
- Database relationships.
- Location-based services.
- Backend architecture.
- Git and GitHub.

---

# 🌟 Why This Project Is Unique

Unlike a basic CRUD or management system, **MediNear solves a practical real-world problem**.

It combines:

```text
Healthcare
     +
Technology
     +
Location Services
     +
Real-Time Information
     +
Emergency Support
```

The project demonstrates how modern backend technologies can be used to build an application that helps users quickly locate essential medicines.

---

# 📌 Project Name

## 🚑 MediNear

### Emergency Medicine Availability and Pharmacy Finder

**Built using Java and Spring Boot.**

---

## 👨‍💻 Developer

**Your Name:** [Add Your Name]

**Technology:** Java | Spring Boot | Supabase (PostgreSQL) | Spring Security | JWT

---

⭐ If you like this project, consider adding more advanced features and making it production-ready.