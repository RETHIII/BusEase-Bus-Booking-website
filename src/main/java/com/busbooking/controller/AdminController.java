package com.busbooking.controller;

import com.busbooking.dto.AdminBusResponse;
import com.busbooking.dto.AdminStatsResponse;
import com.busbooking.entity.Booking;
import com.busbooking.entity.Bus;
import com.busbooking.repository.BookingRepository;
import com.busbooking.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private com.busbooking.repository.UserRepository userRepository;

    @Autowired
    private com.busbooking.repository.FeedbackRepository feedbackRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/buses")
    public ResponseEntity<List<AdminBusResponse>> getBuses() {
        return ResponseEntity.ok(adminService.getBusesBookingStatus());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookings() {
        return ResponseEntity.ok(bookingRepository.findAllByOrderByIdDesc());
    }

    @GetMapping("/users")
    public ResponseEntity<List<com.busbooking.entity.User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<com.busbooking.entity.Feedback>> getFeedbacks() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByIdDesc());
    }

    @PostMapping("/buses/add")
    public ResponseEntity<Bus> addBus(@RequestBody Bus bus) {
        return ResponseEntity.ok(adminService.addBus(bus));
    }
}
