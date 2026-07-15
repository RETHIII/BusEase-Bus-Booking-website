package com.busbooking.service;

import com.busbooking.entity.Bus;
import com.busbooking.entity.Route;
import com.busbooking.entity.Seat;
import com.busbooking.entity.Trip;
import com.busbooking.repository.BusRepository;
import com.busbooking.repository.RouteRepository;
import com.busbooking.repository.SeatRepository;
import com.busbooking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private SeatRepository seatRepository;

    private final Random random = new Random();

    private final String[] operators = {"Zingbus", "VRL Travels", "SRS Travels", "Orange Travels", "National Travels", "IntrCity SmartBus", "Sharma Travels", "KPN Travels"};
    private final String[] busTypes = {"A/C Sleeper (2+1)", "A/C Seater (2+2)", "Non-A/C Sleeper (2+1)", "Non-A/C Seater (2+2)"};

    @Transactional
    public List<Trip> searchTrips(String source, String destination, LocalDate date) {
        // Standardize city names
        String cleanSource = capitalizeCity(source.trim());
        String cleanDestination = capitalizeCity(destination.trim());

        // Check if route exists
        Optional<Route> routeOptional = routeRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(cleanSource, cleanDestination);
        Route route;

        if (routeOptional.isPresent()) {
            route = routeOptional.get();
        } else {
            // Dynamically generate the route if not found (All Over India support)
            route = createDynamicRoute(cleanSource, cleanDestination);
        }

        // Search for trips on the given date
        List<Trip> trips = tripRepository.findByRouteAndDepartureDate(route, date);

        if (trips.isEmpty()) {
            // Dynamically generate trips for this date
            trips = createDynamicTrips(route, date);
        }

        return trips;
    }

    private String capitalizeCity(String city) {
        if (city == null || city.isEmpty()) return "";
        String[] words = city.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }

    private Route createDynamicRoute(String source, String destination) {
        int durationHours = 4 + random.nextInt(9); // 4 to 12 hours
        int durationMinutes = random.nextBoolean() ? 30 : 0;
        String durationStr = durationHours + "h" + (durationMinutes > 0 ? " " + durationMinutes + "m" : "");

        LocalTime depTime = LocalTime.of(6 + random.nextInt(16), random.nextBoolean() ? 30 : 0); // between 6 AM and 10 PM
        LocalTime arrTime = depTime.plusHours(durationHours).plusMinutes(durationMinutes);

        Route route = Route.builder()
                .source(source)
                .destination(destination)
                .departureTime(depTime)
                .arrivalTime(arrTime)
                .duration(durationStr)
                .build();

        return routeRepository.save(route);
    }

    private List<Trip> createDynamicTrips(Route route, LocalDate date) {
        List<Trip> trips = new ArrayList<>();
        int numberOfBuses = 3 + random.nextInt(3); // Generate 3 to 5 bus trips

        for (int i = 0; i < numberOfBuses; i++) {
            // Select random operator and type
            String operator = operators[random.nextInt(operators.length)];
            String type = busTypes[random.nextInt(busTypes.length)];
            
            boolean isSleeper = type.contains("Sleeper");
            int totalSeats = isSleeper ? 36 : 40;
            double price = 500 + random.nextInt(15) * 100 + (isSleeper ? 300 : 0);
            double rawRating = 3.5 + random.nextInt(15) * 0.1;
            double rating = Math.round(rawRating * 10.0) / 10.0; // round to 1 decimal place

            // Create unique bus number
            String busNumber = "IN-" + (10 + random.nextInt(90)) + "-" + (char)('A' + random.nextInt(26)) + (char)('A' + random.nextInt(26)) + "-" + (1000 + random.nextInt(9000));
            
            // Check if bus exists, otherwise create
            Bus bus = busRepository.findByBusNumber(busNumber).orElseGet(() -> {
                Bus newBus = Bus.builder()
                        .busNumber(busNumber)
                        .operatorName(operator)
                        .busType(type)
                        .totalSeats(totalSeats)
                        .price(price)
                        .rating(rating)
                        .build();
                return busRepository.save(newBus);
            });

            // Create Trip
            Trip trip = Trip.builder()
                    .bus(bus)
                    .route(route)
                    .departureDate(date)
                    .availableSeats(totalSeats) // Will be updated after seat initialization
                    .build();

            trip = tripRepository.save(trip);

            // Generate Seats and pre-book some for realistic occupancy
            List<Seat> seats = new ArrayList<>();
            int bookedCount = 0;
            
            for (int seatIndex = 1; seatIndex <= totalSeats; seatIndex++) {
                String seatNumber;
                if (isSleeper) {
                    // Sleeper layout: L1..L18 (Lower) and U1..U18 (Upper)
                    int half = totalSeats / 2;
                    if (seatIndex <= half) {
                        seatNumber = "L" + seatIndex;
                    } else {
                        seatNumber = "U" + (seatIndex - half);
                    }
                } else {
                    // Seater layout: 1A, 1B, 1C, 1D, 2A, ...
                    int row = (seatIndex - 1) / 4 + 1;
                    char col = (char)('A' + ((seatIndex - 1) % 4));
                    seatNumber = row + String.valueOf(col);
                }

                // Randomly pre-book 20% to 40% of seats
                boolean isBooked = random.nextInt(100) < 30; // 30% chance of being prebooked
                if (isBooked) {
                    bookedCount++;
                }

                Seat seat = Seat.builder()
                        .trip(trip)
                        .seatNumber(seatNumber)
                        .isBooked(isBooked)
                        .build();
                seats.add(seat);
            }

            seatRepository.saveAll(seats);

            // Update trip available seats count
            trip.setAvailableSeats(totalSeats - bookedCount);
            trip = tripRepository.save(trip);
            
            trips.add(trip);
        }

        return trips;
    }
}
