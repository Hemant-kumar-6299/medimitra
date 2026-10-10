package com.medinear.service;

import com.medinear.dto.ReservationRequestDto;
import com.medinear.dto.ReservationResponseDto;
import com.medinear.entity.*;
import com.medinear.exception.ResourceNotFoundException;
import com.medinear.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final PharmacyMedicineRepository pharmacyMedicineRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReservationResponseDto createReservation(ReservationRequestDto request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy not found with ID: " + request.getPharmacyId()));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + request.getMedicineId()));

        PharmacyMedicine inventoryItem = pharmacyMedicineRepository
                .findByPharmacyIdAndMedicineId(pharmacy.getId(), medicine.getId())
                .orElseThrow(() -> new IllegalArgumentException("This medicine is not stocked at the selected pharmacy"));

        if (!Boolean.TRUE.equals(inventoryItem.getAvailable()) || inventoryItem.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient medicine stock available for reservation. Available: "
                    + inventoryItem.getQuantity());
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .pharmacy(pharmacy)
                .medicine(medicine)
                .quantity(request.getQuantity())
                .status(ReservationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusMinutes(30))
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return mapToDto(saved, inventoryItem.getPrice());
    }

    @Transactional
    public List<ReservationResponseDto> getUserReservations(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUserIdWithDetails(userId);
        autoExpirePendingReservations(reservations);
        return reservations.stream()
                .map(this::mapWithInventoryPrice)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ReservationResponseDto> getPharmacyReservations(Long pharmacyOwnerId) {
        Pharmacy pharmacy = pharmacyRepository.findByOwnerId(pharmacyOwnerId)
                .orElseThrow(() -> new ResourceNotFoundException("No pharmacy registered for owner ID: " + pharmacyOwnerId));

        List<Reservation> reservations = reservationRepository.findByPharmacyIdWithDetails(pharmacy.getId());
        autoExpirePendingReservations(reservations);
        return reservations.stream()
                .map(this::mapWithInventoryPrice)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponseDto confirmReservation(Long reservationId, Long ownerId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (!isAdmin && !reservation.getPharmacy().getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to confirm reservations for this pharmacy");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalStateException("Reservation cannot be confirmed from status: " + reservation.getStatus());
        }

        if (LocalDateTime.now().isAfter(reservation.getExpiryTime())) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);
            throw new IllegalStateException("Reservation has expired and cannot be confirmed");
        }

        // Deduct inventory
        PharmacyMedicine item = pharmacyMedicineRepository
                .findByPharmacyIdAndMedicineId(reservation.getPharmacy().getId(), reservation.getMedicine().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));

        int remaining = item.getQuantity() - reservation.getQuantity();
        item.setQuantity(Math.max(0, remaining));
        if (item.getQuantity() <= 0) {
            item.setAvailable(false);
        }
        pharmacyMedicineRepository.save(item);

        reservation.setStatus(ReservationStatus.CONFIRMED);
        Reservation saved = reservationRepository.save(reservation);
        return mapToDto(saved, item.getPrice());
    }

    @Transactional
    public ReservationResponseDto cancelReservation(Long reservationId, Long currentUserId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        boolean isUser = reservation.getUser().getId().equals(currentUserId);
        boolean isPharmacyOwner = reservation.getPharmacy().getOwner().getId().equals(currentUserId);

        if (!isAdmin && !isUser && !isPharmacyOwner) {
            throw new AccessDeniedException("You are not authorized to cancel this reservation");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Reservation is already " + reservation.getStatus());
        }

        // If previously CONFIRMED, restore inventory
        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            pharmacyMedicineRepository.findByPharmacyIdAndMedicineId(
                    reservation.getPharmacy().getId(), reservation.getMedicine().getId()
            ).ifPresent(item -> {
                item.setQuantity(item.getQuantity() + reservation.getQuantity());
                item.setAvailable(true);
                pharmacyMedicineRepository.save(item);
            });
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);
        return mapWithInventoryPrice(saved);
    }

    @Transactional
    public ReservationResponseDto completeReservation(Long reservationId, Long ownerId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (!isAdmin && !reservation.getPharmacy().getOwner().getId().equals(ownerId)) {
            throw new AccessDeniedException("You are not authorized to complete reservations for this pharmacy");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed reservations can be marked as completed");
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        Reservation saved = reservationRepository.save(reservation);
        return mapWithInventoryPrice(saved);
    }

    private void autoExpirePendingReservations(List<Reservation> list) {
        LocalDateTime now = LocalDateTime.now();
        for (Reservation r : list) {
            if (r.getStatus() == ReservationStatus.PENDING && r.getExpiryTime() != null && now.isAfter(r.getExpiryTime())) {
                r.setStatus(ReservationStatus.EXPIRED);
                reservationRepository.save(r);
            }
        }
    }

    private ReservationResponseDto mapWithInventoryPrice(Reservation r) {
        Double unitPrice = pharmacyMedicineRepository
                .findByPharmacyIdAndMedicineId(r.getPharmacy().getId(), r.getMedicine().getId())
                .map(PharmacyMedicine::getPrice)
                .orElse(0.0);
        return mapToDto(r, unitPrice);
    }

    private ReservationResponseDto mapToDto(Reservation r, Double unitPrice) {
        long remainingMinutes = 0;
        if (r.getExpiryTime() != null && LocalDateTime.now().isBefore(r.getExpiryTime())) {
            remainingMinutes = Duration.between(LocalDateTime.now(), r.getExpiryTime()).toMinutes();
        }

        double price = (unitPrice != null) ? unitPrice : 0.0;
        double total = price * r.getQuantity();

        return ReservationResponseDto.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .userEmail(r.getUser().getEmail())
                .userPhone(r.getUser().getPhone())
                .pharmacyId(r.getPharmacy().getId())
                .pharmacyName(r.getPharmacy().getName())
                .pharmacyAddress(r.getPharmacy().getAddress())
                .pharmacyPhone(r.getPharmacy().getPhone())
                .medicineId(r.getMedicine().getId())
                .medicineName(r.getMedicine().getName())
                .unitPrice(price)
                .totalPrice(total)
                .quantity(r.getQuantity())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .expiryTime(r.getExpiryTime())
                .remainingMinutes(remainingMinutes)
                .build();
    }
}
