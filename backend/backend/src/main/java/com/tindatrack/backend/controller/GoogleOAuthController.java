package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.model.User;
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

    @GetMapping("/google/login")
    public RedirectView initiateGoogleLogin(
            @RequestParam(value = "state", required = false) String state) {
        String intent = (state != null) ? state : "";
        return new RedirectView(googleOAuthService.getGoogleAuthorizationUrl(intent));
    }

    @GetMapping("/google/callback")
    public RedirectView handleGoogleCallback(
            @RequestParam(value = "code",  required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "state", required = false) String state) {

        if (error != null) {
            System.err.println("[GoogleOAuth] Error from Google: " + error);
            return new RedirectView("http://localhost:5173/oauth/callback?error=" + error);
        }
        if (code == null) {
            System.err.println("[GoogleOAuth] Missing authorization code");
            return new RedirectView("http://localhost:5173/oauth/callback?error=missing_code");
        }

        try {
            AuthResponse auth = googleOAuthService.authenticateGoogleUser(code, state);
            User user         = auth.getUser();
            String token      = auth.getToken();

            boolean hasStore = user.getStoreId() != null && user.getStoreId() != 0L;
            boolean isOwner  = "OWNER".equalsIgnoreCase(user.getRole());
            boolean isStaff  = "STAFF".equalsIgnoreCase(user.getRole());

            String redirect;
            // If user doesn't have a store set up, redirect to setup
            if (!hasStore && isOwner) {
                System.out.println("[GoogleOAuth] Owner needs store setup, redirecting to /setup-store");
                redirect = "http://localhost:5173/setup-store?token=" + token;
            } else if (!hasStore && isStaff) {
                System.out.println("[GoogleOAuth] Staff needs store assignment, redirecting to /setup-staff");
                redirect = "http://localhost:5173/setup-staff?token=" + token;
            } else {
                System.out.println("[GoogleOAuth] User authenticated successfully, redirecting to /oauth/callback");
                redirect = "http://localhost:5173/oauth/callback?token=" + token + "&user=" + user.getName();
            }

            return new RedirectView(redirect);

        } catch (IOException | InterruptedException e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            System.err.println("[GoogleOAuth] Authentication error: " + errorMsg);
            System.err.println("[GoogleOAuth] Exception type: " + e.getClass().getName());
            e.printStackTrace();
            return new RedirectView("http://localhost:5173/oauth/callback?error=" + 
                    java.net.URLEncoder.encode("auth_failed: " + errorMsg, java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/google/token")
    public ResponseEntity<AuthResponse> exchangeGoogleToken(
            @RequestParam String code,
            @RequestParam(required = false) String intent) {
        try {
            return ResponseEntity.ok(
                    googleOAuthService.authenticateGoogleUser(code, intent));
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}