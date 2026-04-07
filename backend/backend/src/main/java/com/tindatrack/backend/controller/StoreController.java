package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.StoreJoinRequest;
import com.tindatrack.backend.dto.StoreSetupRequest;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.service.StoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    private final StoreService storeService;
    private final UserRepository userRepository;

    public StoreController(StoreService storeService, UserRepository userRepository) {
        this.storeService = storeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/setup")
    public ResponseEntity<User> setupStore(@Valid @RequestBody StoreSetupRequest request,
                                           Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        User user = storeService.setupStoreByEmail(authentication.getName(), request.getStoreName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/join")
    public ResponseEntity<User> joinStore(@Valid @RequestBody StoreJoinRequest request,
                                          Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        User user = storeService.joinStoreByEmail(authentication.getName(), request.getStoreCode());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/team")
    public ResponseEntity<List<User>> getStoreTeam(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        if (user.getStoreId() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<User> storeUsers = storeService.getStoreUsers(user.getStoreId());
        return ResponseEntity.ok(storeUsers.stream()
                .map(member -> {
                    member.setPassword(null);
                    return member;
                })
                .collect(Collectors.toList()));
    }
}
