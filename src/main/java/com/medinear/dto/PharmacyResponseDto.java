package com.medinear.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyResponseDto {

    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String openingTime;
    private String closingTime;
    private Boolean isOpen;
    private Boolean verified;
    private Long ownerId;
    private String ownerName;
    private Double distanceKm; // Calculated distance when location provided
    private LocalDateTime createdAt;
}
