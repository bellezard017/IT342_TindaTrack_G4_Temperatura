package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.DashboardResponse;
import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.dto.SaleResponse;
import com.tindatrack.backend.model.Sale;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.service.SaleService;
import com.tindatrack.backend.service.StoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SaleController {

    private final SaleService saleService;
    private final UserRepository userRepository;
    private final StoreService storeService;

    public SaleController(SaleService saleService, UserRepository userRepository, StoreService storeService) {
        this.saleService = saleService;
        this.userRepository = userRepository;
        this.storeService = storeService;
    }

    @PostMapping("/sales")
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request,
                                                   Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        SaleResponse response = saleService.mapToResponse(saleService.createSale(user, request));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales")
    public ResponseEntity<List<SaleResponse>> getSales(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        List<SaleResponse> responses = saleService.getSalesForStore(user.getStoreId())
                .stream()
                .map(saleService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/sales/{id}")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Sale sale = saleService.getSaleById(id);
        if (!sale.getStoreId().equals(user.getStoreId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(saleService.mapToResponse(sale));
    }

    @PutMapping("/sales/{id}")
    public ResponseEntity<SaleResponse> updateSale(@PathVariable Long id,
                                                   @Valid @RequestBody SaleRequest request,
                                                   Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Sale sale = saleService.getSaleById(id);
        if (!sale.getStoreId().equals(user.getStoreId())) {
            return ResponseEntity.status(403).build();
        }
        Sale updatedSale = saleService.updateSale(id, request);
        return ResponseEntity.ok(saleService.mapToResponse(updatedSale));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        DashboardResponse dashboard = saleService.getDashboardForStore(user.getStoreId());
        return ResponseEntity.ok(dashboard);
    }

    @DeleteMapping("/sales/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        // Only OWNER role can delete sales
        if (!"OWNER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        saleService.deleteSale(id);
        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}
