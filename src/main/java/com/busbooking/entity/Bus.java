package com.busbooking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_number", nullable = false, unique = true)
    private String busNumber;

    @Column(name = "operator_name", nullable = false)
    private String operatorName;

    @Column(name = "bus_type", nullable = false)
    private String busType; // e.g. "AC Sleeper (2+1)", "Non-AC Seater"

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Double price;

    private Double rating; // e.g. 4.5
}
