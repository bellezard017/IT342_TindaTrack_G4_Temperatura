package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.LoginRequest;
import com.tindatrack.backend.dto.RegisterRequest;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }   
    
    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}