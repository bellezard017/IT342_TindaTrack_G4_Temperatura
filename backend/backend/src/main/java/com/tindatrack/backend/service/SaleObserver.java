package com.tindatrack.backend.service;

import com.tindatrack.backend.features.sales.Sale;

public interface SaleObserver {
    void update(Sale sale);
}