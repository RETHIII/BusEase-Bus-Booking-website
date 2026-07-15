package com.busbooking.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private Long tripId;
    private String bookingType; // FULL, PREBOOK
    private String paymentId;
    private String couponCode;
    private List<PassengerDTO> passengers;

    @Data
    public static class PassengerDTO {
        private String name;
        private Integer age;
        private String gender;
        private String seatNumber;
    }
}
