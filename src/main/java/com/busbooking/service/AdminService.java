package com.busbooking.service;

import com.busbooking.dto.AdminBusResponse;
import com.busbooking.dto.AdminStatsResponse;
import com.busbooking.entity.Booking;
import com.busbooking.entity.Bus;
import com.busbooking.entity.Seat;
import com.busbooking.entity.Trip;
import com.busbooking.repository.BookingRepository;
import com.busbooking.repository.BusRepository;
import com.busbooking.repository.SeatRepository;
import com.busbooking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private SeatRepository seatRepository;

    public AdminStatsResponse getDashboardStats() {
        List<Booking> activeBookings = bookingRepository.findAll().stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .toList();

        long totalBookings = activeBookings.size();
        
        double totalCollectedRevenue = activeBookings.stream()
                .mapToDouble(Booking::getAmountPaid)
                .sum();

        double totalOutstandingRevenue = activeBookings.stream()
                .mapToDouble(Booking::getAmountDue)
                .sum();

        long activeBusesCount = busRepository.count();

        // Calculate occupancy rate
        List<Seat> allSeats = seatRepository.findAll();
        long totalSeats = allSeats.size();
        long bookedSeats = allSeats.stream().filter(Seat::getIsBooked).count();

        double occupancyRate = 0.0;
        if (totalSeats > 0) {
            occupancyRate = (double) bookedSeats / totalSeats * 100.0;
            occupancyRate = Math.round(occupancyRate * 100.0) / 100.0; // Round to 2 decimal places
        }

        return AdminStatsResponse.builder()
                .totalBookings(totalBookings)
                .totalCollectedRevenue(totalCollectedRevenue)
                .totalOutstandingRevenue(totalOutstandingRevenue)
                .activeBusesCount(activeBusesCount)
                .occupancyRate(occupancyRate)
                .build();
    }

    public List<AdminBusResponse> getBusesBookingStatus() {
        List<Bus> buses = busRepository.findAll();
        List<AdminBusResponse> responseList = new ArrayList<>();

        for (Bus bus : buses) {
            // Find all trips for this bus
            List<Trip> trips = tripRepository.findAll().stream()
                    .filter(t -> t.getBus().getId().equals(bus.getId()))
                    .toList();

            int totalBusSeats = bus.getTotalSeats();
            int bookedSeatsCount = 0;

            for (Trip trip : trips) {
                List<Seat> seats = seatRepository.findByTripId(trip.getId());
                bookedSeatsCount += (int) seats.stream().filter(Seat::getIsBooked).count();
            }

            // Available seats across all scheduled trips
            int totalAvailableSeats = (trips.size() * totalBusSeats) - bookedSeatsCount;
            // Fallback if no trips are scheduled yet for this bus
            if (trips.isEmpty()) {
                totalAvailableSeats = totalBusSeats;
            }

            responseList.add(AdminBusResponse.builder()
                    .id(bus.getId())
                    .busNumber(bus.getBusNumber())
                    .operatorName(bus.getOperatorName())
                    .busType(bus.getBusType())
                    .totalSeats(totalBusSeats)
                    .bookedSeatsCount(bookedSeatsCount)
                    .availableSeatsCount(totalAvailableSeats)
                    .price(bus.getPrice())
                    .rating(bus.getRating())
                    .build());
        }

        return responseList;
    }

    public Bus addBus(Bus bus) {
        if (bus.getRating() == null) {
            bus.setRating(4.0); // Default rating
        }
        return busRepository.save(bus);
    }
}
