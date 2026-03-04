package com.tindatrack.backend.service;

import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.dto.LoginRequest;
import com.tindatrack.backend.dto.LoginResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate a simple token (in production, use JWT)
        String token = generateToken(user);
        
        return new LoginResponse(token, user.getRole(), user.getEmail());
    }

    private String generateToken(User user) {
        String payload = user.getId() + ":" + user.getEmail() + ":" + user.getRole();
        return Base64.getEncoder().encodeToString(payload.getBytes());
    }
}