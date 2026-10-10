package com.medinear.repository;

import com.medinear.entity.Reservation;
import com.medinear.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.user u " +
           "JOIN FETCH r.pharmacy p " +
           "JOIN FETCH r.medicine m " +
           "WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Reservation> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.user u " +
           "JOIN FETCH r.pharmacy p " +
           "JOIN FETCH r.medicine m " +
           "WHERE r.pharmacy.id = :pharmacyId ORDER BY r.createdAt DESC")
    List<Reservation> findByPharmacyIdWithDetails(@Param("pharmacyId") Long pharmacyId);

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByPharmacyId(Long pharmacyId);

    List<Reservation> findByStatus(ReservationStatus status);

    long countByStatus(ReservationStatus status);
}
