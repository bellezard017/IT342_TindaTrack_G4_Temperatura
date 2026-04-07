package com.tindatrack.backend.repository;

import com.tindatrack.backend.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByStoreIdOrderBySaleDateDesc(Long storeId);
}
