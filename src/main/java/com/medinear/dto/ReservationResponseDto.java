package com.medinear.dto;

import com.medinear.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDto {

    private Long id;

    // User info
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // Pharmacy info
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyAddress;
    private String pharmacyPhone;

    // Medicine info
    private Long medicineId;
    private String medicineName;
    private Double unitPrice;
    private Double totalPrice;

    private Integer quantity;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiryTime;
    private Long remainingMinutes;
}
