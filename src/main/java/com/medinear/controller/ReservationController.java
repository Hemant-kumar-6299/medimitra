package com.medinear.controller;

import com.medinear.dto.ApiResponse;
import com.medinear.dto.ReservationRequestDto;
import com.medinear.dto.ReservationResponseDto;
import com.medinear.security.UserDetailsImpl;
import com.medinear.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponseDto>> createReservation(
            @Valid @RequestBody ReservationRequestDto request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        ReservationResponseDto reservation = reservationService.createReservation(request, currentUser.getId());
        return new ResponseEntity<>(ApiResponse.success("Medicine reserved successfully for 30 minutes", reservation), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReservationResponseDto>>> getMyReservations(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<ReservationResponseDto> list = reservationService.getUserReservations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Reservations retrieved", list));
    }

    @GetMapping("/pharmacy")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReservationResponseDto>>> getPharmacyReservations(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<ReservationResponseDto> list = reservationService.getPharmacyReservations(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Incoming reservations retrieved", list));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> confirmReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ReservationResponseDto confirmed = reservationService.confirmReservation(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservation confirmed and medicine stock reserved", confirmed));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ReservationResponseDto cancelled = reservationService.cancelReservation(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", cancelled));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('PHARMACY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> completeReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ReservationResponseDto completed = reservationService.completeReservation(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservation marked as completed/picked up", completed));
    }
}
