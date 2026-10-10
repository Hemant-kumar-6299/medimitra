package com.medinear.service;

import com.medinear.entity.*;
import com.medinear.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final PharmacyMedicineRepository pharmacyMedicineRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            log.info("Checking MediNear database initialization...");
            seedUsersAndPharmacies();
            seedMedicines();
            seedInventory();
            log.info("MediNear database initialization verified successfully.");
        } catch (Exception e) {
            log.error("Error during MediNear data seeding: {}", e.getMessage(), e);
        }
    }

    private void seedUsersAndPharmacies() {
        // Admin
        if (userRepository.findByEmail("admin@medinear.com").isEmpty()) {
            User admin = User.builder()
                    .name("MediNear Admin")
                    .email("admin@medinear.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9999988888")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Created default Admin user: admin@medinear.com");
        }

        // Demo Citizen/User
        if (userRepository.findByEmail("user@medinear.com").isEmpty()) {
            User user = User.builder()
                    .name("Rahul Sharma")
                    .email("user@medinear.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9876543210")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.info("Created default Citizen user: user@medinear.com");
        }

        // Pharmacy 1: Apollo 24/7 Chemist
        if (userRepository.findByEmail("apollo@medinear.com").isEmpty()) {
            User apolloOwner = User.builder()
                    .name("Rajesh Kumar (Apollo)")
                    .email("apollo@medinear.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9811223344")
                    .role(Role.PHARMACY)
                    .build();
            User savedOwner = userRepository.save(apolloOwner);

            Pharmacy apollo = Pharmacy.builder()
                    .name("Apollo 24x7 Emergency Pharmacy")
                    .address("Shop 12, Alpha Commercial Belt, Greater Noida, UP")
                    .latitude(28.4780)
                    .longitude(77.5020)
                    .phone("+91 9811223344")
                    .openingTime("24/7")
                    .closingTime("24/7")
                    .isOpen(true)
                    .verified(true)
                    .owner(savedOwner)
                    .build();
            pharmacyRepository.save(apollo);
            log.info("Created Apollo Pharmacy");
        }

        // Pharmacy 2: MedPlus Chemist
        if (userRepository.findByEmail("medplus@medinear.com").isEmpty()) {
            User medplusOwner = User.builder()
                    .name("Sunita Verma (MedPlus)")
                    .email("medplus@medinear.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9822334455")
                    .role(Role.PHARMACY)
                    .build();
            User savedOwner = userRepository.save(medplusOwner);

            Pharmacy medplus = Pharmacy.builder()
                    .name("MedPlus Health & Emergency Store")
                    .address("Plot 45, Knowledge Park II, Greater Noida, UP")
                    .latitude(28.4690)
                    .longitude(77.5110)
                    .phone("+91 9822334455")
                    .openingTime("07:00 AM")
                    .closingTime("11:30 PM")
                    .isOpen(true)
                    .verified(true)
                    .owner(savedOwner)
                    .build();
            pharmacyRepository.save(medplus);
            log.info("Created MedPlus Pharmacy");
        }

        // Pharmacy 3: CityCare Emergency Chemist
        if (userRepository.findByEmail("citycare@medinear.com").isEmpty()) {
            User cityCareOwner = User.builder()
                    .name("Dr. Amit Saxena (CityCare)")
                    .email("citycare@medinear.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+91 9833445566")
                    .role(Role.PHARMACY)
                    .build();
            User savedOwner = userRepository.save(cityCareOwner);

            Pharmacy cityCare = Pharmacy.builder()
                    .name("CityCare 24x7 Trauma Pharmacy")
                    .address("Near Kailash Hospital, Gamma 1, Greater Noida, UP")
                    .latitude(28.4890)
                    .longitude(77.4950)
                    .phone("+91 9833445566")
                    .openingTime("24/7")
                    .closingTime("24/7")
                    .isOpen(true)
                    .verified(true)
                    .owner(savedOwner)
                    .build();
            pharmacyRepository.save(cityCare);
            log.info("Created CityCare Pharmacy");
        }
    }

    private void seedMedicines() {
        if (medicineRepository.count() >= 8) {
            return;
        }

        List<Medicine> defaultMedicines = List.of(
                Medicine.builder()
                        .name("Insulin Glargine 100 IU/ml")
                        .manufacturer("Sanofi Aventis")
                        .category("Diabetes / Emergency")
                        .description("Long-acting basal insulin for emergency glycemic control. Store refrigerated.")
                        .build(),
                Medicine.builder()
                        .name("Salbutamol Inhaler 100mcg")
                        .manufacturer("Cipla (Asthalin)")
                        .category("Respiratory / Emergency")
                        .description("Fast-acting rescue bronchodilator for severe asthma attacks and acute dyspnea.")
                        .build(),
                Medicine.builder()
                        .name("Nitroglycerin Sublingual 0.5mg")
                        .manufacturer("Sun Pharma")
                        .category("Cardiac / Emergency")
                        .description("Rapid-acting sublingual tablet for emergency relief of acute angina pectoris chest pain.")
                        .build(),
                Medicine.builder()
                        .name("Paracetamol 650mg")
                        .manufacturer("Micro Labs (Dolo 650)")
                        .category("Antipyretic / Analgesic")
                        .description("Immediate high-efficacy antipyretic for high fever and body ache.")
                        .build(),
                Medicine.builder()
                        .name("Azithromycin 500mg")
                        .manufacturer("Pfizer (Azy 500)")
                        .category("Antibiotic")
                        .description("Broad-spectrum antibiotic for bacterial respiratory, skin, and throat infections.")
                        .build(),
                Medicine.builder()
                        .name("Amoxicillin & Clavulanate 625mg")
                        .manufacturer("GlaxoSmithKline (Augmentin)")
                        .category("Antibiotic")
                        .description("High-potency antibiotic for acute bacterial infections.")
                        .build(),
                Medicine.builder()
                        .name("Cetirizine 10mg")
                        .manufacturer("Dr. Reddy's")
                        .category("Antiallergic")
                        .description("Fast-acting antihistamine for acute allergic attacks, hives, and rhinitis.")
                        .build(),
                Medicine.builder()
                        .name("Oral Rehydration Salts (ORS)")
                        .manufacturer("FDC Ltd (Electral)")
                        .category("Electrolyte / Emergency")
                        .description("WHO-formulated electrolyte formula to prevent critical dehydration in acute diarrhea.")
                        .build(),
                Medicine.builder()
                        .name("Metformin 500mg SR")
                        .manufacturer("USV Ltd (Glycomet)")
                        .category("Diabetes")
                        .description("Sustained-release anti-hyperglycemic agent for managing type 2 diabetes.")
                        .build(),
                Medicine.builder()
                        .name("Epinephrine Auto-Injector 0.3mg")
                        .manufacturer("Mylan (EpiPen)")
                        .category("Emergency / Anaphylaxis")
                        .description("Life-saving auto-injector for immediate treatment of severe anaphylactic allergic shocks.")
                        .build()
        );

        for (Medicine m : defaultMedicines) {
            if (medicineRepository.findByNameIgnoreCase(m.getName()).isEmpty()) {
                medicineRepository.save(m);
            }
        }
        log.info("Seeded default emergency medicine catalog.");
    }

    private void seedInventory() {
        if (pharmacyMedicineRepository.count() > 0) {
            return;
        }

        List<Pharmacy> pharmacies = pharmacyRepository.findAll();
        List<Medicine> medicines = medicineRepository.findAll();

        if (pharmacies.isEmpty() || medicines.isEmpty()) {
            return;
        }

        // Distribute medicines across pharmacies
        for (Pharmacy p : pharmacies) {
            for (Medicine m : medicines) {
                int quantity = 15;
                double price = 120.0;

                if (m.getName().contains("Insulin")) {
                    quantity = p.getName().contains("Apollo") ? 25 : (p.getName().contains("CityCare") ? 18 : 5);
                    price = 480.0;
                } else if (m.getName().contains("Inhaler")) {
                    quantity = 20;
                    price = 145.0;
                } else if (m.getName().contains("Nitroglycerin")) {
                    quantity = 12;
                    price = 85.0;
                } else if (m.getName().contains("Paracetamol")) {
                    quantity = 150;
                    price = 32.0;
                } else if (m.getName().contains("Epinephrine")) {
                    quantity = p.getName().contains("CityCare") ? 10 : 2;
                    price = 2200.0;
                } else if (m.getName().contains("ORS")) {
                    quantity = 80;
                    price = 22.0;
                }

                PharmacyMedicine pm = PharmacyMedicine.builder()
                        .pharmacy(p)
                        .medicine(m)
                        .quantity(quantity)
                        .price(price)
                        .available(quantity > 0)
                        .lastUpdated(LocalDateTime.now())
                        .build();

                pharmacyMedicineRepository.save(pm);
            }
        }
        log.info("Populated inventory stock for all registered pharmacies.");
    }
}
