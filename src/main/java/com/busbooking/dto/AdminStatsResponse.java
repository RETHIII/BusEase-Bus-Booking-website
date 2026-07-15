package com.busbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private Long totalBookings;
    private Double totalCollectedRevenue;
    private Double totalOutstandingRevenue;
    private Long activeBusesCount;
    private Double occupancyRate;
}
