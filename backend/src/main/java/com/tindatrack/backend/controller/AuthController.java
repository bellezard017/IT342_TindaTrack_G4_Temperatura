package com.tindatrack.backend.controller;

import com.tindatrack.backend.model.User;
import com.tindatrack.backend.service.AuthService;
import com.tindatrack.backend.dto.LoginRequest;
import com.tindatrack.backend.dto.LoginResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}