package com.medinear.service;

import com.medinear.dto.AdminStatsDto;
import com.medinear.dto.PharmacyResponseDto;
import com.medinear.entity.Pharmacy;
import com.medinear.entity.ReservationStatus;
import com.medinear.entity.User;
import com.medinear.exception.ResourceNotFoundException;
import com.medinear.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final ReservationRepository reservationRepository;
    private final PharmacyMedicineRepository pharmacyMedicineRepository;
    private final PharmacyService pharmacyService;

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        long totalUsers = userRepository.count();
        long totalPharmacies = pharmacyRepository.count();
        long verifiedPharmacies = pharmacyRepository.findByVerifiedTrue().size();
        long totalMedicines = medicineRepository.count();
        long activeReservations = reservationRepository.countByStatus(ReservationStatus.PENDING)
                + reservationRepository.countByStatus(ReservationStatus.CONFIRMED);
        long totalInventoryItems = pharmacyMedicineRepository.count();

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalPharmacies(totalPharmacies)
                .verifiedPharmacies(verifiedPharmacies)
                .totalMedicines(totalMedicines)
                .activeReservations(activeReservations)
                .totalInventoryItems(totalInventoryItems)
                .build();
    }

    @Transactional
    public PharmacyResponseDto setPharmacyVerification(Long pharmacyId, boolean verified) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + pharmacyId));

        pharmacy.setVerified(verified);
        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return pharmacyService.getPharmacyById(saved.getId(), null, null);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll().stream()
                .peek(u -> u.setPassword(null)) // Sanitize
                .collect(Collectors.toList());
    }
}
