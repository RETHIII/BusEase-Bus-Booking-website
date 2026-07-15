package com.busbooking.repository;

import com.busbooking.entity.Route;
import com.busbooking.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByRouteAndDepartureDate(Route route, LocalDate departureDate);
    List<Trip> findByDepartureDate(LocalDate departureDate);
}
