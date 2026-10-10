package com.medinear.repository;

import com.medinear.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByCategoryIgnoreCase(String category);
    Optional<Medicine> findByNameIgnoreCase(String name);
    Boolean existsByNameIgnoreCase(String name);
}
