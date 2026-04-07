package com.tindatrack.backend.service;

import com.google.gson.Gson;
import com.tindatrack.backend.dto.AuthResponse;
import com.tindatrack.backend.dto.GoogleTokenResponse;
import com.tindatrack.backend.dto.GoogleUserInfo;
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
    private final Gson gson;
    private final HttpClient httpClient;

    public GoogleOAuthService(UserRepository userRepository, JwtUtil jwtUtil, StoreService storeService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.storeService = storeService;
        this.gson = new Gson();
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Generate Google OAuth authorization URL
     */
    public String getGoogleAuthorizationUrl() {
        String scope = URLEncoder.encode("openid email profile", StandardCharsets.UTF_8);
        String redirectUriEncoded = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);

        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + redirectUriEncoded +
                "&response_type=code" +
                "&scope=" + scope +
                "&access_type=offline" +
                "&prompt=consent";
    }

    /**
     * Exchange authorization code for Google access token
     */
    public GoogleTokenResponse exchangeCodeForToken(String code)
            throws IOException, InterruptedException {

        String requestBody =
                "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8) +
                "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&grant_type=authorization_code";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException(
                "Failed to exchange code for token. Status: "
                + response.statusCode() + " Body: " + response.body());
        }

        return gson.fromJson(response.body(), GoogleTokenResponse.class);
    }

    /**
     * Get user info from Google using access token
     */
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
            throw new RuntimeException(
                "Failed to get user info from Google. Status: "
                + response.statusCode() + " Body: " + response.body());
        }

        return gson.fromJson(response.body(), GoogleUserInfo.class);
    }

    /**
     * Full OAuth flow: exchange code → get user info → find/create user → return JWT
     */
    public AuthResponse authenticateGoogleUser(String code)
            throws IOException, InterruptedException {

        // 1. Exchange code for tokens
        GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);

        // 2. Get user info from Google
        GoogleUserInfo userInfo = getUserInfo(tokenResponse.getAccess_token());

        // 3. Find existing user or create new one
        User user = userRepository.findByEmail(userInfo.getEmail())
                .orElseGet(() -> createNewGoogleUser(userInfo));

        // 4. Enrich user with store data
        storeService.enrichUserStore(user);

        // 5. Generate JWT
        String jwtToken = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(jwtToken, user);
    }

    /**
     * Create a new user from Google profile info
     */
    private User createNewGoogleUser(GoogleUserInfo googleUserInfo) {
        User user = new User();
        user.setName(googleUserInfo.getName());
        user.setEmail(googleUserInfo.getEmail());
        user.setPassword("OAUTH_GOOGLE_USER"); // no password for OAuth users
        user.setRole("OWNER");                 // default role — adjust as needed
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}