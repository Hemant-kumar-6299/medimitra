package com.medinear.service;

import com.medinear.dto.EmergencySearchResultDto;
import com.medinear.dto.MedicineRequestDto;
import com.medinear.dto.MedicineResponseDto;
import com.medinear.entity.Medicine;
import com.medinear.entity.Pharmacy;
import com.medinear.entity.PharmacyMedicine;
import com.medinear.exception.ResourceNotFoundException;
import com.medinear.repository.MedicineRepository;
import com.medinear.repository.PharmacyMedicineRepository;
import com.medinear.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final PharmacyMedicineRepository pharmacyMedicineRepository;

    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponseDto> searchMedicines(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllMedicines();
        }
        return medicineRepository.findByNameContainingIgnoreCase(name.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineResponseDto getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return mapToDto(medicine);
    }

    @Transactional
    public MedicineResponseDto createMedicine(MedicineRequestDto request) {
        if (medicineRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Medicine with name '" + request.getName() + "' already exists");
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName().trim())
                .manufacturer(request.getManufacturer())
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        Medicine saved = medicineRepository.save(medicine);
        return mapToDto(saved);
    }

    /**
     * Emergency medicine search across all pharmacies.
     * Calculates distance from user location and prioritizes closest, open, and stocked pharmacies.
     */
    @Transactional(readOnly = true)
    public List<EmergencySearchResultDto> emergencySearch(String query, Double userLat, Double userLng, Double radiusKm) {
        String searchQuery = (query != null) ? query.trim() : "";
        List<PharmacyMedicine> inventoryItems = searchQuery.isEmpty()
                ? pharmacyMedicineRepository.findAll()
                : pharmacyMedicineRepository.searchByMedicineNameOrCategory(searchQuery);

        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 50.0;

        return inventoryItems.stream()
                .map(pm -> {
                    Pharmacy p = pm.getPharmacy();
                    Medicine m = pm.getMedicine();

                    Double distance = null;
                    if (userLat != null && userLng != null && p.getLatitude() != null && p.getLongitude() != null) {
                        distance = GeoUtils.calculateDistanceKm(userLat, userLng, p.getLatitude(), p.getLongitude());
                    }

                    return EmergencySearchResultDto.builder()
                            .pharmacyId(p.getId())
                            .pharmacyName(p.getName())
                            .pharmacyAddress(p.getAddress())
                            .pharmacyPhone(p.getPhone())
                            .latitude(p.getLatitude())
                            .longitude(p.getLongitude())
                            .openingTime(p.getOpeningTime())
                            .closingTime(p.getClosingTime())
                            .isOpen(p.getIsOpen())
                            .verified(p.getVerified())
                            .medicineId(m.getId())
                            .medicineName(m.getName())
                            .medicineCategory(m.getCategory())
                            .medicineManufacturer(m.getManufacturer())
                            .medicineDescription(m.getDescription())
                            .quantity(pm.getQuantity())
                            .price(pm.getPrice())
                            .available(pm.getAvailable())
                            .lastUpdated(pm.getLastUpdated())
                            .distanceKm(distance)
                            .build();
                })
                .filter(res -> {
                    // If user coordinates provided, filter by radius
                    if (res.getDistanceKm() != null) {
                        return res.getDistanceKm() <= maxRadius;
                    }
                    return true;
                })
                .sorted(Comparator
                        // 1. Available in stock first
                        .comparing((EmergencySearchResultDto r) -> r.getAvailable() != null && r.getAvailable() && r.getQuantity() > 0 ? 0 : 1)
                        // 2. Open pharmacies first
                        .thenComparing(r -> r.getIsOpen() != null && r.getIsOpen() ? 0 : 1)
                        // 3. Closest distance first (if distance is present)
                        .thenComparing(r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE)
                        // 4. Alphabetical by pharmacy name
                        .thenComparing(EmergencySearchResultDto::getPharmacyName)
                )
                .collect(Collectors.toList());
    }

    public MedicineResponseDto mapToDto(Medicine m) {
        return MedicineResponseDto.builder()
                .id(m.getId())
                .name(m.getName())
                .manufacturer(m.getManufacturer())
                .category(m.getCategory())
                .description(m.getDescription())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
