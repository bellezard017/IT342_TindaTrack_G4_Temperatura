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
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ActivityLogService activityLogService;
    private final EmailService emailService;
    private final List<SaleObserver> observers = new ArrayList<>();

    public SaleService(SaleRepository saleRepository,
                       ActivityLogService activityLogService,
                       EmailService emailService) {
        this.saleRepository     = saleRepository;
        this.activityLogService = activityLogService;
        this.emailService       = emailService;
        this.addObserver(new SaleNotificationService());
    }

    public void addObserver(SaleObserver observer) {
        observers.add(observer);
    }

    private void notifyObservers(Sale sale) {
        observers.forEach(o -> o.update(sale));
    }

    public Sale createSale(User user, SaleRequest request) {
        if (user == null || user.getStoreId() == null) {
            throw new RuntimeException("User must be connected to a store.");
        }

        String systemName = ConfigManager.getInstance().getSystemName();
        System.out.println(systemName);

        Sale sale      = SaleFactory.createSale(user, request);
        Sale savedSale = saleRepository.save(sale);

        notifyObservers(savedSale);

        activityLogService.log(
                "add",
                "Added sale: " + request.getName(),
                String.valueOf(user.getId()),
                user.getName(),
                request.getPrice() * request.getQuantity(),
                user.getStoreId()
        );

        emailService.sendSaleConfirmationEmail(
                user.getEmail(),
                user.getName(),
                request.getName(),
                request.getQuantity(),
                request.getPrice(),
                request.getPrice() * request.getQuantity(),
                user.getStoreName() != null ? user.getStoreName() : "your store"
        );

        return savedSale;
    }

    public List<Sale> getSalesForStore(Long storeId) {
        if (storeId == null) return List.of();
        return saleRepository.findByStoreIdOrderBySaleDateDesc(storeId);
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));
    }

    public Sale updateSale(Long id, SaleRequest request, User user) {
        Sale sale = getSaleById(id);
        sale.setItemName(request.getName());
        sale.setCategory(request.getCategory());
        sale.setQuantity(request.getQuantity());
        sale.setPrice(request.getPrice());
        sale.setTotalPrice(request.getQuantity() * request.getPrice());

        Sale updatedSale = saleRepository.save(sale);

        if (user != null) {
            activityLogService.log(
                    "edit",
                    "Edited sale: " + request.getName(),
                    String.valueOf(user.getId()),
                    user.getName(),
                    request.getPrice() * request.getQuantity(),
                    user.getStoreId()
            );
        }

        return updatedSale;
    }

    public void deleteSale(Long id, User user) {
        Sale sale = getSaleById(id);
        saleRepository.deleteById(id);

        if (user != null) {
            activityLogService.log(
                    "delete",
                    "Deleted sale: " + sale.getItemName(),
                    String.valueOf(user.getId()),
                    user.getName(),
                    null,
                    user.getStoreId()
            );
        }
    }

    public DashboardResponse getDashboardForStore(Long storeId) {
        List<Sale> allSales = getSalesForStore(storeId);
        LocalDate  today    = LocalDate.now();

        List<Sale> todaySales = allSales.stream()
                .filter(s -> s.getSaleDate() != null &&
                             s.getSaleDate().toLocalDate().equals(today))
                .collect(Collectors.toList());

        double totalDailySales = todaySales.stream()
                .mapToDouble(Sale::getTotalPrice).sum();
        int transactionCount   = todaySales.size();
        int itemsSold          = todaySales.stream().mapToInt(Sale::getQuantity).sum();

        List<SaleResponse> recentSales = allSales.stream()
                .limit(5).map(this::mapToResponse).collect(Collectors.toList());

        List<TopItemResponse> topItems = allSales.stream()
                .collect(Collectors.groupingBy(
                        Sale::getItemName,
                        Collectors.summarizingDouble(Sale::getTotalPrice)))
                .entrySet().stream()
                .map(e -> new TopItemResponse(
                        0, e.getKey(),
                        allSales.stream()
                                .filter(s -> s.getItemName().equals(e.getKey()))
                                .mapToInt(Sale::getQuantity).sum(),
                        e.getValue().getSum()))
                .sorted(Comparator.comparingDouble(TopItemResponse::getAmount).reversed())
                .limit(5)
                .collect(Collectors.toList());

        for (int i = 0; i < topItems.size(); i++) topItems.get(i).setRank(i + 1);

        List<ChartDataPoint> chartData = IntStream.rangeClosed(0, 6)
                .mapToObj(i -> today.minusDays(6 - i))
                .map(date -> {
                    double revenue = allSales.stream()
                            .filter(s -> s.getSaleDate() != null &&
                                         s.getSaleDate().toLocalDate().equals(date))
                            .mapToDouble(Sale::getTotalPrice).sum();
                    return new ChartDataPoint(
                            date.format(DateTimeFormatter.ofPattern("MMM d")), revenue);
                })
                .collect(Collectors.toList());

        return new DashboardResponse(
                totalDailySales, transactionCount, itemsSold,
                recentSales, topItems, chartData);
    }

    public SaleResponse mapToResponse(Sale sale) {
        String displayDate = sale.getSaleDate() != null
                ? sale.getSaleDate().format(
                        DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a"))
                : "";
        return new SaleResponse(
                sale.getId(), displayDate,
                sale.getItemName(), sale.getCategory(),
                sale.getQuantity(), sale.getPrice(),
                sale.getTotalPrice(), sale.getCreatedBy());
    }
}