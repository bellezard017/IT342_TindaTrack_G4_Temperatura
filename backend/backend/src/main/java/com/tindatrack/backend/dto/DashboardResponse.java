package com.tindatrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private double totalDailySales;
    private int transactionCount;
    private int itemsSold;
    private List<SaleResponse> recentSales;
    private List<TopItemResponse> topItems;
    private List<ChartDataPoint> chartData;
}
