package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.service.GoogleOAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;
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
            return oauthError(error, state);
        }
        if (code == null) {
            return oauthError("missing_code", state);
        }

        try {
            AuthResponse auth = googleOAuthService.authenticateGoogleUser(code, state);
            User user  = auth.getUser();
            String token = auth.getToken();

            String next = resolveNextRoute(user);

            String redirect = frontendUrl + "/oauth/callback?token="
                    + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&next=" + URLEncoder.encode(next, StandardCharsets.UTF_8);
            return new RedirectView(redirect);

        } catch (IOException | InterruptedException | RuntimeException e) {
            e.printStackTrace();
            return oauthError("auth_failed", state);
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

    @PostMapping("/google/dev-login")
    public ResponseEntity<AuthResponse> developmentGoogleLogin(
            @RequestParam(required = false) String intent,
            HttpServletRequest request) {

        if (!isLocalRequest(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(googleOAuthService.authenticateDevelopmentGoogleUser(intent));
    }

    private RedirectView oauthError(String error, String state) {
        String redirect = frontendUrl + "/oauth/callback?error="
                + URLEncoder.encode(error, StandardCharsets.UTF_8);

        if (state != null && !state.isBlank()) {
            redirect += "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
        }

        return new RedirectView(redirect);
    }

    private boolean isLocalRequest(HttpServletRequest request) {
        String serverName = request.getServerName();
        String remoteAddress = request.getRemoteAddr();

        return "localhost".equalsIgnoreCase(serverName)
                || "127.0.0.1".equals(serverName)
                || "0:0:0:0:0:0:0:1".equals(remoteAddress)
                || "127.0.0.1".equals(remoteAddress);
    }

    private String resolveNextRoute(User user) {
        boolean hasStore = user.getStoreId() != null && user.getStoreId() != 0L;
        boolean isOwner = "OWNER".equalsIgnoreCase(user.getRole());
        boolean isStaff = "STAFF".equalsIgnoreCase(user.getRole());

        if (!hasStore && isOwner) {
            return "setup-store";
        }
        if (!hasStore && isStaff) {
            return "setup-staff";
        }
        return "dashboard";
    }
}
