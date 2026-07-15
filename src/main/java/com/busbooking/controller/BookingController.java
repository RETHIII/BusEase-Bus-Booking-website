package com.busbooking.controller;

import com.busbooking.dto.BookingRequest;
import com.busbooking.entity.Booking;
import com.busbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(bookingService.createBooking(request, email));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> myBookings(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(bookingService.getUserBookings(email));
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, email));
    }
}
