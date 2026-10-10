package com.medinear.repository;

import com.medinear.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    Optional<Pharmacy> findByOwnerId(Long ownerId);
    List<Pharmacy> findByIsOpenTrue();
    List<Pharmacy> findByVerifiedTrue();
    List<Pharmacy> findByNameContainingIgnoreCase(String name);
}
