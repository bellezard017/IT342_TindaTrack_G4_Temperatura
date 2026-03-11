package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.service.GoogleOAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth/oauth")
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;

    public GoogleOAuthController(GoogleOAuthService googleOAuthService) {
        this.googleOAuthService = googleOAuthService;
    }

    /**
     * Initiates Google OAuth flow
     * Redirects user to Google's authorization endpoint
     */
    @GetMapping("/google/login")
    public RedirectView initiateGoogleLogin() {
        String authorizationUrl = googleOAuthService.getGoogleAuthorizationUrl();
        return new RedirectView(authorizationUrl);
    }

    /**
     * Google OAuth callback endpoint
     * Handles the authorization code from Google
     */
    @GetMapping("/google/callback")
    public RedirectView handleGoogleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error) {
        
        if (error != null) {
            return new RedirectView("http://localhost:5173/login?error=" + error);
        }

        if (code == null) {
            return new RedirectView("http://localhost:5173/login?error=missing_code");
        }

        try {
            // Authenticate user with Google OAuth
            AuthResponse authResponse = googleOAuthService.authenticateGoogleUser(code);
            
            // Redirect to dashboard with token and user info
            String redirectUrl = "http://localhost:5173/dashboard?token=" + authResponse.getToken() + 
                    "&user=" + authResponse.getUser().getName();
            return new RedirectView(redirectUrl);
            
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return new RedirectView("http://localhost:5173/login?error=auth_failed");
        }
    }

    /**
     * Alternative endpoint that returns JSON instead of redirecting
     */
    @PostMapping("/google/token")
    public ResponseEntity<AuthResponse> exchangeGoogleToken(@RequestParam String code) {
        try {
            AuthResponse authResponse = googleOAuthService.authenticateGoogleUser(code);
            return ResponseEntity.ok(authResponse);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
    }
}
