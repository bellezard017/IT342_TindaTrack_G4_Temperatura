package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.DashboardResponse;
import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.dto.SaleResponse;
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

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        storeService.enrichUserStore(user);
        DashboardResponse dashboard = saleService.getDashboardForStore(user.getStoreId());
        return ResponseEntity.ok(dashboard);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}
