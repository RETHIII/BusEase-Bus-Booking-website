package com.busbooking.controller;

import com.busbooking.entity.Seat;
import com.busbooking.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatRepository seatRepository;

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Seat>> getSeatsByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(seatRepository.findByTripId(tripId));
    }
}
