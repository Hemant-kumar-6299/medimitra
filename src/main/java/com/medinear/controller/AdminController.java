package com.medinear.controller;

import com.medinear.dto.AdminStatsDto;
import com.medinear.dto.ApiResponse;
import com.medinear.dto.PharmacyResponseDto;
import com.medinear.entity.User;
import com.medinear.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success("Admin statistics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/pharmacies/{id}/verify")
    public ResponseEntity<ApiResponse<PharmacyResponseDto>> verifyPharmacy(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean verified) {
        PharmacyResponseDto updated = adminService.setPharmacyVerification(id, verified);
        return ResponseEntity.ok(ApiResponse.success(verified ? "Pharmacy verified successfully" : "Pharmacy verification revoked", updated));
    }
}
