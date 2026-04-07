package com.tindatrack.backend.service;

import com.tindatrack.backend.model.Store;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.StoreRepository;
import com.tindatrack.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StoreService {

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public StoreService(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    public Store createStoreForOwner(User owner, String storeName) {
        if (storeName == null || storeName.isBlank()) {
            throw new RuntimeException("Store name is required for owner registration.");
        }

        if (owner.getStoreId() != null) {
            throw new RuntimeException("User already has a store assigned.");
        }

        Store store = new Store();
        store.setName(storeName.trim());
        store.setCode(generateUniqueStoreCode());
        store.setOwnerId(owner.getId());
        store.setCreatedAt(LocalDateTime.now());

        return storeRepository.save(store);
    }

    public User assignStoreToUser(User user, String storeCode) {
        if (storeCode == null || storeCode.isBlank()) {
            throw new RuntimeException("Store code is required.");
        }

        Store store = storeRepository.findByCode(storeCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid store code."));

        if (user.getStoreId() != null && !user.getStoreId().equals(store.getId())) {
            throw new RuntimeException("Your account is already connected to a different store.");
        }

        user.setStoreId(store.getId());
        user.setRole("STAFF");
        user.setStoreName(store.getName());
        user.setStoreCode(store.getCode());

        return userRepository.save(user);
    }

    public User setupStoreByEmail(String email, String storeName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!"OWNER".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Only store owners can create a store.");
        }

        Store store = createStoreForOwner(user, storeName);
        user.setStoreId(store.getId());
        user.setStoreName(store.getName());
        user.setStoreCode(store.getCode());

        return userRepository.save(user);
    }

    public User joinStoreByEmail(String email, String storeCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getStoreId() != null && user.getStoreId() != 0L) {
            throw new RuntimeException("Your account is already connected to a store.");
        }

        return assignStoreToUser(user, storeCode);
    }

    public List<User> getStoreUsers(Long storeId) {
        if (storeId == null) {
            return List.of();
        }
        return userRepository.findByStoreId(storeId);
    }

    public void enrichUserStore(User user) {
        if (user == null || user.getStoreId() == null) {
            return;
        }

        Optional<Store> store = storeRepository.findById(user.getStoreId());
        store.ifPresent(value -> {
            user.setStoreName(value.getName());
            user.setStoreCode(value.getCode());
        });
    }

    private String generateUniqueStoreCode() {
        String code;
        do {
            code = generateCode();
        } while (storeRepository.findByCode(code).isPresent());
        return code;
    }

    private String generateCode() {
        StringBuilder builder = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            builder.append(CODE_CHARS.charAt(secureRandom.nextInt(CODE_CHARS.length())));
        }
        return builder.toString();
    }
}
