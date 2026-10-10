package com.medinear.repository;

import com.medinear.entity.PharmacyMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyMedicineRepository extends JpaRepository<PharmacyMedicine, Long> {

    List<PharmacyMedicine> findByPharmacyId(Long pharmacyId);

    List<PharmacyMedicine> findByMedicineId(Long medicineId);

    List<PharmacyMedicine> findByMedicineIdAndAvailableTrue(Long medicineId);

    Optional<PharmacyMedicine> findByPharmacyIdAndMedicineId(Long pharmacyId, Long medicineId);

    @Query("SELECT pm FROM PharmacyMedicine pm " +
           "JOIN FETCH pm.pharmacy p " +
           "JOIN FETCH pm.medicine m " +
           "WHERE (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<PharmacyMedicine> searchByMedicineNameOrCategory(@Param("query") String query);

    @Query("SELECT pm FROM PharmacyMedicine pm " +
           "JOIN FETCH pm.pharmacy p " +
           "JOIN FETCH pm.medicine m " +
           "WHERE pm.available = true AND pm.quantity > 0 AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<PharmacyMedicine> searchAvailableByMedicineNameOrCategory(@Param("query") String query);
}
