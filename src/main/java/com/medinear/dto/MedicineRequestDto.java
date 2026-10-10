package com.medinear.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequestDto {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 150, message = "Name must be under 150 characters")
    private String name;

    private String manufacturer;
    private String category;
    private String description;
}
