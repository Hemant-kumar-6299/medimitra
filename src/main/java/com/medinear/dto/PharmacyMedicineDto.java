package com.medinear.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyMedicineDto {

    private Long id;
    private Long pharmacyId;
    private String pharmacyName;

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;
    private String medicineName;
    private String medicineCategory;
    private String medicineManufacturer;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price cannot be negative")
    private Double price;

    private Boolean available;
    private LocalDateTime lastUpdated;
}
