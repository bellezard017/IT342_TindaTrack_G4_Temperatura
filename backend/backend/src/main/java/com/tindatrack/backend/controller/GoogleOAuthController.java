package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.service.GoogleOAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth/oauth")
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
            return oauthError(error);
        }
        if (code == null) {
            return oauthError("missing_code");
        }

        try {
            AuthResponse auth = googleOAuthService.authenticateGoogleUser(code, state);
            User user  = auth.getUser();
            String token = auth.getToken();

            boolean hasStore = user.getStoreId() != null && user.getStoreId() != 0L;
            boolean isOwner  = "OWNER".equalsIgnoreCase(user.getRole());
            boolean isStaff  = "STAFF".equalsIgnoreCase(user.getRole());

            String next;
            if (!hasStore && isOwner) {
                next = "setup-store";
            } else if (!hasStore && isStaff) {
                next = "setup-staff";
            } else {
                next = "dashboard";
            }

            String redirect = frontendUrl + "/oauth/callback?token="
                    + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&next=" + URLEncoder.encode(next, StandardCharsets.UTF_8);
            return new RedirectView(redirect);

        } catch (IOException | InterruptedException | RuntimeException e) {
            e.printStackTrace();
            return oauthError("auth_failed");
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

    private RedirectView oauthError(String error) {
        return new RedirectView(frontendUrl + "/oauth/callback?error="
                + URLEncoder.encode(error, StandardCharsets.UTF_8));
    }
}
