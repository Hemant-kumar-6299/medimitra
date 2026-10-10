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
public class EmergencySearchResultDto {

    // Pharmacy info
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyAddress;
    private String pharmacyPhone;
    private Double latitude;
    private Double longitude;
    private String openingTime;
    private String closingTime;
    private Boolean isOpen;
    private Boolean verified;

    // Medicine info
    private Long medicineId;
    private String medicineName;
    private String medicineCategory;
    private String medicineManufacturer;
    private String medicineDescription;

    // Availability & Pricing
    private Integer quantity;
    private Double price;
    private Boolean available;
    private LocalDateTime lastUpdated;

    // Geospatial Distance
    private Double distanceKm; // Distance from user's coordinates in km
}
