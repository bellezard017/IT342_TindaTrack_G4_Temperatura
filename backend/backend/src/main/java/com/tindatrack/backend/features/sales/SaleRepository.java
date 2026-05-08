package com.tindatrack.backend.features.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByStoreIdOrderBySaleDateDesc(Long storeId);
}
