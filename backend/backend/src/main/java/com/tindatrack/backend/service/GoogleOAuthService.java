package com.tindatrack.backend.service;

import com.google.gson.Gson;
import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.dto.GoogleTokenResponse;
import com.tindatrack.backend.dto.GoogleUserInfo;
import com.tindatrack.backend.features.stores.StoreService;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class GoogleOAuthService {

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final StoreService storeService;
    private final EmailService emailService;
    private final Gson gson;
    private final HttpClient httpClient;

    public GoogleOAuthService(UserRepository userRepository,
                               JwtUtil jwtUtil,
                               StoreService storeService,
                               EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtUtil        = jwtUtil;
        this.storeService   = storeService;
        this.emailService   = emailService;
        this.gson           = new Gson();
        this.httpClient     = HttpClient.newHttpClient();
    }

    public String getGoogleAuthorizationUrl(String state) {
        String scope              = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        String redirectUriEncoded = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String stateParam         = (state != null && !state.isBlank())
                ? "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8)
                : "";

        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + redirectUriEncoded +
                "&response_type=code" +
                "&scope=" + scope +
                "&access_type=offline" +
                "&prompt=consent" +
                stateParam;
    }

    public GoogleTokenResponse exchangeCodeForToken(String code)
            throws IOException, InterruptedException {

        String body =
                "code="           + URLEncoder.encode(code,          StandardCharsets.UTF_8) +
                "&client_id="     + URLEncoder.encode(clientId,      StandardCharsets.UTF_8) +
                "&client_secret=" + URLEncoder.encode(clientSecret,  StandardCharsets.UTF_8) +
                "&redirect_uri="  + URLEncoder.encode(redirectUri,   StandardCharsets.UTF_8) +
                "&grant_type=authorization_code";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Token exchange failed: " + response.body());
        }

        return gson.fromJson(response.body(), GoogleTokenResponse.class);
    }

    public GoogleUserInfo getUserInfo(String accessToken)
            throws IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openidconnect.googleapis.com/v1/userinfo"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Get user info failed: " + response.body());
        }

        return gson.fromJson(response.body(), GoogleUserInfo.class);
    }

    public AuthResponse authenticateGoogleUser(String code, String intent)
            throws IOException, InterruptedException {

        GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);
        GoogleUserInfo googleUserInfo     = getUserInfo(tokenResponse.getAccess_token());

        String googleId = googleUserInfo.getSub();
        String email    = googleUserInfo.getEmail();

        // First try to find by Google ID, then by email
        User user = userRepository.findByGoogleId(googleId).orElse(null);
        
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        boolean isNewUser = (user == null);

        if (isNewUser) {
            // Create new user - respect the intent parameter for role
            user = new User();
            user.setName(googleUserInfo.getName());
            user.setEmail(googleUserInfo.getEmail());
            user.setPassword("OAUTH_NO_PASSWORD");
            user.setGoogleId(googleId);
            user.setIsOAuthUser(true);
            user.setCreatedAt(LocalDateTime.now());
            // Set role based on intent: if "staff", set STAFF, otherwise default to OWNER
            user.setRole("staff".equalsIgnoreCase(intent) ? "STAFF" : "OWNER");
            user = userRepository.save(user);
            
            // Send welcome email for new users
            emailService.sendWelcomeEmail(
                    user.getEmail(),
                    user.getName(),
                    user.getStoreName() != null ? user.getStoreName() : "Your Store",
                    user.getRole()
            );
            System.out.println("[GoogleOAuth] New user created: " + email + " with role: " + user.getRole());
        } else {
            // Existing user - link Google ID if not already linked
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setIsOAuthUser(true);
                user = userRepository.save(user);
                System.out.println("[GoogleOAuth] Linked Google ID to existing user: " + email);
            }
            // Enrich store information for existing users
            storeService.enrichUserStore(user);
            System.out.println("[GoogleOAuth] Logged in existing user: " + email + " with role: " + user.getRole());
        }

        String jwtToken = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(jwtToken, user);
    }
}