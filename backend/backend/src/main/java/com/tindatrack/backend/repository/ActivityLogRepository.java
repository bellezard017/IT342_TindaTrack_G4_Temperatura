package com.tindatrack.backend.repository;

import com.tindatrack.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop20ByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<ActivityLog> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();
}