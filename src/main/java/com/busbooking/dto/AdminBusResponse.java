package com.busbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBusResponse {
    private Long id;
    private String busNumber;
    private String operatorName;
    private String busType;
    private Integer totalSeats;
    private Integer bookedSeatsCount;
    private Integer availableSeatsCount;
    private Double price;
    private Double rating;
}
