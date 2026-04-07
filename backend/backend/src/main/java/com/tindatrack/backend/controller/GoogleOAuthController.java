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
            
            String redirectUrl;
            // Check if user needs to set up a store (OWNER role with no store)
            if ("OWNER".equalsIgnoreCase(authResponse.getUser().getRole()) && 
                (authResponse.getUser().getStoreId() == null || authResponse.getUser().getStoreId() == 0L)) {
                // New owner who needs to create a store
                redirectUrl = "http://localhost:5173/setup-store?token=" + authResponse.getToken();
            } else if (authResponse.getUser().getStoreId() == null || authResponse.getUser().getStoreId() == 0L) {
                // User without a store assignment (shouldn't happen, but redirect to setup-staff)
                redirectUrl = "http://localhost:5173/setup-staff?token=" + authResponse.getToken();
            } else {
                // User has a store, go to dashboard
                redirectUrl = "http://localhost:5173/dashboard?token=" + authResponse.getToken() + 
                        "&user=" + authResponse.getUser().getName();
            }
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
