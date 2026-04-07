package com.tindatrack.backend.service;

import com.tindatrack.backend.model.Sale;

public class SaleNotificationService implements SaleObserver {

    @Override
    public void update(Sale sale) {
        System.out.println("New sale recorded: " + sale.getItemName());
    }
}