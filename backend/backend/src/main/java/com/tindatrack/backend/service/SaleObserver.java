package com.tindatrack.backend.service;

import com.tindatrack.backend.model.Sale;

public interface SaleObserver {
    void update(Sale sale);
}