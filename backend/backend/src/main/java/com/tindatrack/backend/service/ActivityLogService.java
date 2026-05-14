package com.tindatrack.backend.service;

import com.tindatrack.backend.model.ActivityLog;
import com.tindatrack.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository repo;

    @Transactional
    public void log(String type,
                    String label,
                    String userId,
                    String userName,
                    Double amount,
                    Long storeId) {
        try {
            ActivityLog entry = new ActivityLog();
            entry.setType(type);
            entry.setLabel(label);
            entry.setUserId(userId);
            entry.setUserName(userName);
            entry.setAmount(amount);
            entry.setStoreId(storeId);
            repo.save(entry);
            System.out.println("[ActivityLog] Saved: " + type + " – " + label
                    + "  store=" + storeId);
        } catch (Exception e) {
            
            System.err.println("[ActivityLog] Failed to save: " + e.getMessage());
        }
    }

    public List<ActivityLog> getRecentByStore(Long storeId) {
        return repo.findTop20ByStoreIdOrderByCreatedAtDesc(storeId);
    }

    public List<ActivityLog> getAllByStore(Long storeId) {
        return repo.findByStoreIdOrderByCreatedAtDesc(storeId);
    }

    public List<ActivityLog> getRecent() {
        return repo.findTop20ByOrderByCreatedAtDesc();
    }
}
