package com.busbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "total_fare", nullable = false)
    private Double totalFare;

    @Column(name = "amount_paid", nullable = false)
    private Double amountPaid;

    @Column(name = "amount_due", nullable = false)
    private Double amountDue;

    @Column(name = "booking_type", nullable = false)
    private String bookingType; // FULL, PREBOOK

    @Column(nullable = false)
    private String status; // CONFIRMED, CANCELLED

    @Column(name = "payment_id")
    private String paymentId;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Passenger> passengers;
}
