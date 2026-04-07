package com.tindatrack.backend.service;

import com.tindatrack.backend.dto.ChartDataPoint;
import com.tindatrack.backend.dto.DashboardResponse;
import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.dto.SaleResponse;
import com.tindatrack.backend.dto.TopItemResponse;
import com.tindatrack.backend.model.Sale;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.SaleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class SaleService {

    private final SaleRepository saleRepository;

    public SaleService(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    public Sale createSale(User user, SaleRequest request) {
        if (user == null || user.getStoreId() == null) {
            throw new RuntimeException("Your account must be connected to a store before recording sales.");
        }

        Sale sale = new Sale();
        sale.setStoreId(user.getStoreId());
        sale.setUserId(user.getId());
        sale.setItemName(request.getName().trim());
        sale.setCategory(request.getCategory().trim());
        sale.setQuantity(request.getQuantity());
        sale.setPrice(request.getPrice());
        sale.setTotalPrice(request.getQuantity() * request.getPrice());
        sale.setCreatedBy(user.getName());
        sale.setSaleDate(LocalDateTime.now());

        return saleRepository.save(sale);
    }

    public List<Sale> getSalesForStore(Long storeId) {
        if (storeId == null) {
            return List.of();
        }
        return saleRepository.findByStoreIdOrderBySaleDateDesc(storeId);
    }

    public DashboardResponse getDashboardForStore(Long storeId) {
        List<Sale> allSales = getSalesForStore(storeId);

        LocalDate today = LocalDate.now();
        List<Sale> todaySales = allSales.stream()
                .filter(sale -> sale.getSaleDate() != null && sale.getSaleDate().toLocalDate().equals(today))
                .collect(Collectors.toList());

        double totalDailySales = todaySales.stream()
                .mapToDouble(Sale::getTotalPrice)
                .sum();

        int transactionCount = todaySales.size();
        int itemsSold = todaySales.stream()
                .mapToInt(Sale::getQuantity)
                .sum();

        List<SaleResponse> recentSales = allSales.stream()
                .limit(5)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<TopItemResponse> topItems = allSales.stream()
                .collect(Collectors.groupingBy(Sale::getItemName, Collectors.summarizingDouble(Sale::getTotalPrice)))
                .entrySet()
                .stream()
                .map(entry -> new TopItemResponse(0, entry.getKey(), allSales.stream()
                        .filter(sale -> sale.getItemName().equals(entry.getKey()))
                        .mapToInt(Sale::getQuantity)
                        .sum(), entry.getValue().getSum()))
                .sorted(Comparator.comparingDouble(TopItemResponse::getAmount).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<ChartDataPoint> chartData = IntStream.rangeClosed(0, 6)
                .mapToObj(i -> today.minusDays(6 - i))
                .map(date -> {
                    double revenue = allSales.stream()
                            .filter(sale -> sale.getSaleDate() != null && sale.getSaleDate().toLocalDate().equals(date))
                            .mapToDouble(Sale::getTotalPrice)
                            .sum();
                    return new ChartDataPoint(date.format(DateTimeFormatter.ofPattern("MMM d")), revenue);
                })
                .collect(Collectors.toList());

        for (int i = 0; i < topItems.size(); i++) {
            topItems.get(i).setRank(i + 1);
        }

        return new DashboardResponse(totalDailySales, transactionCount, itemsSold, recentSales, topItems, chartData);
    }

    public SaleResponse mapToResponse(Sale sale) {
        String displayDate = sale.getSaleDate() != null
                ? sale.getSaleDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a"))
                : "";
        return new SaleResponse(
                sale.getId(),
                displayDate,
                sale.getItemName(),
                sale.getCategory(),
                sale.getQuantity(),
                sale.getPrice(),
                sale.getTotalPrice(),
                sale.getCreatedBy()
        );
    }
}
