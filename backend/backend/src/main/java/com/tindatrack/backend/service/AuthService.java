package com.tindatrack.backend.service;

import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.dto.LoginRequest;
import com.tindatrack.backend.dto.RegisterRequest;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StoreService storeService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       StoreService storeService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.storeService = storeService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getConfirmPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String normalizedRole = request.getRole() == null ? "USER" : request.getRole().trim().toUpperCase();
        user.setRole(normalizedRole);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        if ("OWNER".equalsIgnoreCase(request.getRole())) {
            if (request.getStoreName() == null || request.getStoreName().isBlank()) {
                throw new RuntimeException("Store name is required for owner registration.");
            }
            var store = storeService.createStoreForOwner(savedUser, request.getStoreName());
            savedUser.setStoreId(store.getId());
            savedUser.setStoreName(store.getName());
            savedUser.setStoreCode(store.getCode());
            savedUser = userRepository.save(savedUser);
        }

        if ("STAFF".equalsIgnoreCase(request.getRole())) {
            if (request.getStoreCode() == null || request.getStoreCode().isBlank()) {
                throw new RuntimeException("Store code is required for staff registration.");
            }
            savedUser = storeService.joinStoreByEmail(savedUser.getEmail(), request.getStoreCode().trim().toUpperCase());
        }

        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        storeService.enrichUserStore(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user);
    }

    public User getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        storeService.enrichUserStore(user);
        return user;
    }
}