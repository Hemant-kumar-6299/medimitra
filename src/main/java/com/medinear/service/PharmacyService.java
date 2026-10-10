package com.medinear.service;

import com.medinear.dto.PharmacyMedicineDto;
import com.medinear.dto.PharmacyRequestDto;
import com.medinear.dto.PharmacyResponseDto;
import com.medinear.entity.Medicine;
import com.medinear.entity.Pharmacy;
import com.medinear.entity.PharmacyMedicine;
import com.medinear.entity.User;
import com.medinear.exception.ResourceNotFoundException;
import com.medinear.repository.MedicineRepository;
import com.medinear.repository.PharmacyMedicineRepository;
import com.medinear.repository.PharmacyRepository;
import com.medinear.repository.UserRepository;
import com.medinear.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final PharmacyMedicineRepository pharmacyMedicineRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PharmacyResponseDto> getAllPharmacies(Double userLat, Double userLng) {
        return pharmacyRepository.findAll().stream()
                .map(p -> mapToDto(p, userLat, userLng))
                .sorted(Comparator.comparing(p -> p.getDistanceKm() != null ? p.getDistanceKm() : Double.MAX_VALUE))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PharmacyResponseDto> getNearbyPharmacies(double lat, double lng, double radiusKm) {
        return pharmacyRepository.findAll().stream()
                .map(p -> mapToDto(p, lat, lng))
                .filter(p -> p.getDistanceKm() != null && p.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparing(PharmacyResponseDto::getDistanceKm))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PharmacyResponseDto getPharmacyById(Long id, Double userLat, Double userLng) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + id));
        return mapToDto(pharmacy, userLat, userLng);
    }

    @Transactional(readOnly = true)
    public PharmacyResponseDto getPharmacyByOwnerId(Long ownerId) {
        Pharmacy pharmacy = pharmacyRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No pharmacy registered for user ID: " + ownerId));
        return mapToDto(pharmacy, null, null);
    }

    @Transactional
    public PharmacyResponseDto registerPharmacy(PharmacyRequestDto request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + ownerId));

        if (pharmacyRepository.findByOwnerId(ownerId).isPresent()) {
            throw new IllegalArgumentException("User already has a registered pharmacy");
        }

        Pharmacy pharmacy = Pharmacy.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone().trim())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .isOpen(request.getIsOpen() != null ? request.getIsOpen() : true)
                .verified(false) // Needs admin verification
                .owner(owner)
                .build();

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return mapToDto(saved, null, null);
    }

    @Transactional
    public PharmacyResponseDto updatePharmacy(Long id, PharmacyRequestDto request, Long currentUserId, boolean isAdmin) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + id));

        if (!isAdmin && !pharmacy.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to update this pharmacy");
        }

        pharmacy.setName(request.getName().trim());
        pharmacy.setAddress(request.getAddress().trim());
        pharmacy.setLatitude(request.getLatitude());
        pharmacy.setLongitude(request.getLongitude());
        pharmacy.setPhone(request.getPhone().trim());
        if (request.getOpeningTime() != null) pharmacy.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) pharmacy.setClosingTime(request.getClosingTime());
        if (request.getIsOpen() != null) pharmacy.setIsOpen(request.getIsOpen());

        Pharmacy updated = pharmacyRepository.save(pharmacy);
        return mapToDto(updated, null, null);
    }

    @Transactional
    public PharmacyResponseDto toggleOpenStatus(Long id, Long currentUserId, boolean isAdmin) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + id));

        if (!isAdmin && !pharmacy.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to modify this pharmacy");
        }

        pharmacy.setIsOpen(!Boolean.TRUE.equals(pharmacy.getIsOpen()));
        Pharmacy saved = pharmacyRepository.save(pharmacy);
        return mapToDto(saved, null, null);
    }

    // --- Inventory Management ---

    @Transactional(readOnly = true)
    public List<PharmacyMedicineDto> getPharmacyInventory(Long pharmacyId) {
        return pharmacyMedicineRepository.findByPharmacyId(pharmacyId).stream()
                .map(this::mapInventoryToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PharmacyMedicineDto addOrUpdateInventory(Long pharmacyId, PharmacyMedicineDto dto, Long currentUserId, boolean isAdmin) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + pharmacyId));

        if (!isAdmin && !pharmacy.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to manage inventory for this pharmacy");
        }

        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + dto.getMedicineId()));

        PharmacyMedicine item = pharmacyMedicineRepository.findByPharmacyIdAndMedicineId(pharmacyId, medicine.getId())
                .orElse(PharmacyMedicine.builder()
                        .pharmacy(pharmacy)
                        .medicine(medicine)
                        .build());

        item.setQuantity(dto.getQuantity());
        item.setPrice(dto.getPrice());
        item.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : (dto.getQuantity() > 0));

        PharmacyMedicine saved = pharmacyMedicineRepository.save(item);
        return mapInventoryToDto(saved);
    }

    @Transactional
    public void deleteInventoryItem(Long pharmacyId, Long medicineId, Long currentUserId, boolean isAdmin) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + pharmacyId));

        if (!isAdmin && !pharmacy.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to modify this pharmacy inventory");
        }

        PharmacyMedicine item = pharmacyMedicineRepository.findByPharmacyIdAndMedicineId(pharmacyId, medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        pharmacyMedicineRepository.delete(item);
    }

    private PharmacyResponseDto mapToDto(Pharmacy p, Double userLat, Double userLng) {
        Double distance = null;
        if (userLat != null && userLng != null && p.getLatitude() != null && p.getLongitude() != null) {
            distance = GeoUtils.calculateDistanceKm(userLat, userLng, p.getLatitude(), p.getLongitude());
        }

        return PharmacyResponseDto.builder()
                .id(p.getId())
                .name(p.getName())
                .address(p.getAddress())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .phone(p.getPhone())
                .openingTime(p.getOpeningTime())
                .closingTime(p.getClosingTime())
                .isOpen(p.getIsOpen())
                .verified(p.getVerified())
                .ownerId(p.getOwner() != null ? p.getOwner().getId() : null)
                .ownerName(p.getOwner() != null ? p.getOwner().getName() : null)
                .distanceKm(distance)
                .createdAt(p.getCreatedAt())
                .build();
    }

    public PharmacyMedicineDto mapInventoryToDto(PharmacyMedicine pm) {
        return PharmacyMedicineDto.builder()
                .id(pm.getId())
                .pharmacyId(pm.getPharmacy().getId())
                .pharmacyName(pm.getPharmacy().getName())
                .medicineId(pm.getMedicine().getId())
                .medicineName(pm.getMedicine().getName())
                .medicineCategory(pm.getMedicine().getCategory())
                .medicineManufacturer(pm.getMedicine().getManufacturer())
                .quantity(pm.getQuantity())
                .price(pm.getPrice())
                .available(pm.getAvailable())
                .lastUpdated(pm.getLastUpdated())
                .build();
    }
}
