package com.medinear.controller;

import com.medinear.dto.ApiResponse;
import com.medinear.dto.EmergencySearchResultDto;
import com.medinear.dto.MedicineRequestDto;
import com.medinear.dto.MedicineResponseDto;
import com.medinear.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineResponseDto>>> getAllMedicines() {
        List<MedicineResponseDto> medicines = medicineService.getAllMedicines();
        return ResponseEntity.ok(ApiResponse.success("Medicines retrieved successfully", medicines));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MedicineResponseDto>>> searchMedicines(
            @RequestParam(required = false) String name) {
        List<MedicineResponseDto> results = medicineService.searchMedicines(name);
        return ResponseEntity.ok(ApiResponse.success("Search completed", results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponseDto>> getMedicineById(@PathVariable Long id) {
        MedicineResponseDto medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine details retrieved", medicine));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACY')")
    public ResponseEntity<ApiResponse<MedicineResponseDto>> createMedicine(
            @Valid @RequestBody MedicineRequestDto request) {
        MedicineResponseDto created = medicineService.createMedicine(request);
        return new ResponseEntity<>(ApiResponse.success("Medicine added to catalog", created), HttpStatus.CREATED);
    }

    /**
     * Emergency medicine availability search.
     * Takes medicine name, user's current GPS coordinates (lat, lng), and optional search radius.
     * Returns nearest pharmacies with confirmed stock and distance in km.
     */
    @GetMapping("/emergency-search")
    public ResponseEntity<ApiResponse<List<EmergencySearchResultDto>>> emergencySearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "50") Double radius) {
        List<EmergencySearchResultDto> results = medicineService.emergencySearch(name, lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.success("Emergency search results retrieved", results));
    }
}
