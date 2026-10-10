package com.medinear.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyRequestDto {

    @NotBlank(message = "Pharmacy name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String openingTime; // e.g. "08:00 AM"
    private String closingTime; // e.g. "11:00 PM"
    private Boolean isOpen;
}
