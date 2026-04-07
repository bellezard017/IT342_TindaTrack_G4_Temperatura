package com.tindatrack.backend.controller;

import com.tindatrack.backend.dto.AvatarResponse;
import com.tindatrack.backend.dto.ProfileUpdateRequest;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import com.tindatrack.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/avatar")
    public ResponseEntity<AvatarResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        AvatarResponse response = userService.uploadAvatar(user, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        User updatedUser = userService.updateProfile(user, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<User> removeAvatar(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        User updatedUser = userService.removeAvatar(user);
        return ResponseEntity.ok(updatedUser);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}