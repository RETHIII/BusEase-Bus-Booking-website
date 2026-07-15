package com.busbooking.service;

import com.busbooking.dto.BookingRequest;
import com.busbooking.entity.*;
import com.busbooking.repository.BookingRepository;
import com.busbooking.repository.SeatRepository;
import com.busbooking.repository.TripRepository;
import com.busbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public Booking createBooking(BookingRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<String> seatNumbers = request.getPassengers().stream()
                .map(BookingRequest.PassengerDTO::getSeatNumber)
                .collect(Collectors.toList());

        // Check seat availability
        List<Seat> seats = seatRepository.findByTripIdAndSeatNumberIn(trip.getId(), seatNumbers);
        
        // Ensure all seats exist
        if (seats.size() != seatNumbers.size()) {
            throw new RuntimeException("Some seats do not exist on this trip");
        }

        // Check if any seat is already booked
        for (Seat seat : seats) {
            if (seat.getIsBooked()) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked");
            }
        }

        // Calculate pricing
        double basePrice = trip.getBus().getPrice();
        double baseFare = basePrice * request.getPassengers().size();
        
        // Coupon code validations
        double discount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim().toUpperCase();
            if ("BUSEASE10".equals(code)) {
                discount = baseFare * 0.10;
            } else if ("SAVE150".equals(code)) {
                discount = 150.0;
            } else if ("FIRSTBUS".equals(code)) {
                discount = baseFare * 0.15;
            }
            if (discount > baseFare) {
                discount = baseFare;
            }
        }
        
        double baseFareAfterDiscount = baseFare - discount;
        double gst = baseFareAfterDiscount * 0.18;
        double bookingFee = 25.00;
        double totalFare = baseFareAfterDiscount + gst + bookingFee;
        
        // Dynamic calculations for Prebook options
        double amountPaid;
        double amountDue;
        
        if ("PREBOOK".equalsIgnoreCase(request.getBookingType())) {
            // ₹99 per seat as booking fee, balance due on boarding
            amountPaid = 99.0 * request.getPassengers().size();
            amountDue = totalFare - amountPaid;
        } else {
            amountPaid = totalFare;
            amountDue = 0.0;
        }

        // Create Booking
        Booking booking = Booking.builder()
                .user(user)
                .trip(trip)
                .bookingDate(LocalDate.now())
                .totalFare(totalFare)
                .amountPaid(amountPaid)
                .amountDue(amountDue)
                .bookingType(request.getBookingType().toUpperCase())
                .status("CONFIRMED")
                .paymentId(request.getPaymentId())
                .build();

        // Map passengers
        List<Passenger> passengers = new ArrayList<>();
        for (BookingRequest.PassengerDTO pDto : request.getPassengers()) {
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .name(pDto.getName())
                    .age(pDto.getAge())
                    .gender(pDto.getGender())
                    .seatNumber(pDto.getSeatNumber())
                    .build();
            passengers.add(passenger);
        }
        booking.setPassengers(passengers);

        // Save booking (cascades passenger creation)
        Booking savedBooking = bookingRepository.save(booking);

        // Mark seats as booked
        for (Seat seat : seats) {
            seat.setIsBooked(true);
        }
        seatRepository.saveAll(seats);

        // Update trip available seats count
        trip.setAvailableSeats(trip.getAvailableSeats() - seats.size());
        tripRepository.save(trip);

        return savedBooking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Allow cancellation if it belongs to the user, or if user is admin
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized cancellation request");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Mark status as cancelled
        booking.setStatus("CANCELLED");
        
        // Outstanding balance is zero, paid amount is refunded (simulated)
        booking.setAmountDue(0.0);
        
        Booking savedBooking = bookingRepository.save(booking);

        // Release seats
        List<String> seatNumbers = booking.getPassengers().stream()
                .map(Passenger::getSeatNumber)
                .collect(Collectors.toList());

        Trip trip = booking.getTrip();
        List<Seat> seats = seatRepository.findByTripIdAndSeatNumberIn(trip.getId(), seatNumbers);
        for (Seat seat : seats) {
            seat.setIsBooked(false);
        }
        seatRepository.saveAll(seats);

        // Increase trip available seats count
        trip.setAvailableSeats(trip.getAvailableSeats() + seats.size());
        tripRepository.save(trip);

        return savedBooking;
    }

    public List<Booking> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId());
    }
}
