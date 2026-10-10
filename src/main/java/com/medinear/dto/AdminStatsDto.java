package com.medinear.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {

    private long totalUsers;
    private long totalPharmacies;
    private long verifiedPharmacies;
    private long totalMedicines;
    private long activeReservations;
    private long totalInventoryItems;
}
