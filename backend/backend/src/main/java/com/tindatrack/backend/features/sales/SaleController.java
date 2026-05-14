package com.tindatrack.backend.features.sales;

import com.tindatrack.backend.dto.DashboardResponse;
import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.dto.SaleResponse;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.features.stores.StoreService;
import com.tindatrack.backend.service.ActivityLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SaleController {

    private final SaleService saleService;
    private final UserRepository userRepository;
    private final StoreService storeService;
    private final ActivityLogService activityLogService;

    public SaleController(SaleService saleService,
                          UserRepository userRepository,
                          StoreService storeService,
                          ActivityLogService activityLogService) {
        this.saleService = saleService;
        this.userRepository = userRepository;
        this.storeService = storeService;
        this.activityLogService = activityLogService;
    }

    @PostMapping("/sales")
    public ResponseEntity<SaleResponse> createSale(
            @Valid @RequestBody SaleRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        SaleResponse response = saleService.mapToResponse(
                saleService.createSale(user, request));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales")
    public ResponseEntity<List<SaleResponse>> getSales(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        List<SaleResponse> responses = saleService
                .getSalesForStore(user.getStoreId())
                .stream()
                .map(saleService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/sales/{id}")
    public ResponseEntity<SaleResponse> getSaleById(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        Sale sale = saleService.getSaleById(id);
        if (!sale.getStoreId().equals(user.getStoreId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(saleService.mapToResponse(sale));
    }

    @PutMapping("/sales/{id}")
    public ResponseEntity<SaleResponse> updateSale(
            @PathVariable Long id,
            @Valid @RequestBody SaleRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        Sale sale = saleService.getSaleById(id);
        if (!sale.getStoreId().equals(user.getStoreId())) {
            return ResponseEntity.status(403).build();
        }
        Sale updatedSale = saleService.updateSale(id, request, user);
        return ResponseEntity.ok(saleService.mapToResponse(updatedSale));
    }

    @DeleteMapping("/sales/{id}")
    public ResponseEntity<Void> deleteSale(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        if (!"OWNER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        saleService.deleteSale(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        DashboardResponse dashboard = saleService.getDashboardForStore(user.getStoreId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/sales/export")
    public ResponseEntity<String> exportSales(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        List<Sale> sales = saleService.getSalesForStore(user.getStoreId());

        activityLogService.log(
                "export",
                "Exported sales records",
                String.valueOf(user.getId()),
                user.getName(),
                null,
                user.getStoreId()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"sales_export_" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(buildSalesCsv(sales));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    private String buildSalesCsv(List<Sale> sales) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Item,Category,Quantity,Price,Total,Recorded By\n");
        for (Sale sale : sales) {
            csv.append(csvValue(sale.getSaleDate() == null ? "" : sale.getSaleDate().toString())).append(',')
                    .append(csvValue(sale.getItemName())).append(',')
                    .append(csvValue(sale.getCategory())).append(',')
                    .append(sale.getQuantity() == null ? "" : sale.getQuantity()).append(',')
                    .append(sale.getPrice() == null ? "" : sale.getPrice()).append(',')
                    .append(sale.getTotalPrice() == null ? "" : sale.getTotalPrice()).append(',')
                    .append(csvValue(sale.getCreatedBy())).append('\n');
        }
        return csv.toString();
    }

    private String csvValue(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
