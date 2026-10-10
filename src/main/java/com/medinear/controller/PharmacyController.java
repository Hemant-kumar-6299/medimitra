package com.medinear.controller;

import com.medinear.dto.ApiResponse;
import com.medinear.dto.PharmacyMedicineDto;
import com.medinear.dto.PharmacyRequestDto;
import com.medinear.dto.PharmacyResponseDto;
import com.medinear.security.UserDetailsImpl;
import com.medinear.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PharmacyResponseDto>>> getAllPharmacies(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        List<PharmacyResponseDto> list = pharmacyService.getAllPharmacies(lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Pharmacies retrieved successfully", list));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<PharmacyResponseDto>>> getNearbyPharmacies(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius) {
        List<PharmacyResponseDto> list = pharmacyService.getNearbyPharmacies(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.success("Nearby pharmacies retrieved", list));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PHARMACY')")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> getMyPharmacy(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        PharmacyResponseDto dto = pharmacyService.getPharmacyByOwnerId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Pharmacy profile retrieved", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> getPharmacyById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        PharmacyResponseDto dto = pharmacyService.getPharmacyById(id, lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Pharmacy details retrieved", dto));
    }

    @PostMapping
    @PreAuthorize("hasRole('PHARMACY')")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> registerPharmacy(
            @Valid @RequestBody PharmacyRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        PharmacyResponseDto created = pharmacyService.registerPharmacy(request, currentUser.getId());
        return new ResponseEntity<>(ApiResponse.success("Pharmacy registered successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> updatePharmacy(
            @PathVariable Long id,
            @Valid @RequestBody PharmacyRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        PharmacyResponseDto updated = pharmacyService.updatePharmacy(id, request, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Pharmacy updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> toggleOpenStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        PharmacyResponseDto updated = pharmacyService.toggleOpenStatus(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Pharmacy status toggled", updated));
    }

    // --- Inventory Endpoints ---

    @GetMapping("/{id}/medicines")
    public ResponseEntity<ApiResponse<List<PharmacyMedicineDto>>> getPharmacyInventory(@PathVariable Long id) {
        List<PharmacyMedicineDto> inventory = pharmacyService.getPharmacyInventory(id);
        return ResponseEntity.ok(ApiResponse.success("Pharmacy inventory retrieved", inventory));
    }

    @PostMapping("/{id}/medicines")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PharmacyMedicineDto>> addOrUpdateInventory(
            @PathVariable Long id,
            @Valid @RequestBody PharmacyMedicineDto dto,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        PharmacyMedicineDto saved = pharmacyService.addOrUpdateInventory(id, dto, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", saved));
    }

    @DeleteMapping("/{pharmacyId}/medicines/{medicineId}")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryItem(
            @PathVariable Long pharmacyId,
            @PathVariable Long medicineId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        pharmacyService.deleteInventoryItem(pharmacyId, medicineId, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Inventory item removed"));
    }
}
