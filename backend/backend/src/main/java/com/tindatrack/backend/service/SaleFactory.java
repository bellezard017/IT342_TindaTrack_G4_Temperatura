package com.tindatrack.backend.service;

import com.tindatrack.backend.dto.SaleRequest;
import com.tindatrack.backend.model.Sale;
import com.tindatrack.backend.model.User;

import java.time.LocalDateTime;

public class SaleFactory {

    public static Sale createSale(User user, SaleRequest request) {
        Sale sale = new Sale();

        sale.setStoreId(user.getStoreId());
        sale.setUserId(user.getId());
        sale.setItemName(request.getName().trim());
        sale.setCategory(request.getCategory().trim());
        sale.setQuantity(request.getQuantity());
        sale.setPrice(request.getPrice());

        PricingStrategy strategy = new RegularPricing();
        double total = strategy.calculateTotal(request.getPrice(), request.getQuantity());
        sale.setTotalPrice(total);

        sale.setCreatedBy(user.getName());
        sale.setSaleDate(LocalDateTime.now());

        return sale;
    }
}