package com.tindatrack.backend.service;

import com.tindatrack.backend.dto.AvatarResponse;
import com.tindatrack.backend.dto.ProfileUpdateRequest;
import com.tindatrack.backend.model.User;
import com.tindatrack.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AvatarResponse uploadAvatar(User user, MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.equals("image/jpeg") &&
             !contentType.equals("image/png") &&
             !contentType.equals("image/gif") &&
             !contentType.equals("image/webp"))) {
            throw new RuntimeException("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        }

        // Check file size (5MB limit)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 5MB limit.");
        }

        try {
            // Convert to Base64
            byte[] fileBytes = file.getBytes();
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);
            String dataUrl = "data:" + contentType + ";base64," + base64Data;

            // Update user
            user.setAvatarUrl(dataUrl);
            userRepository.save(user);

            AvatarResponse response = new AvatarResponse();
            response.setAvatarUrl(dataUrl);
            return response;

        } catch (IOException e) {
            throw new RuntimeException("Failed to process image file");
        }
    }

    public User removeAvatar(User user) {
        user.setAvatarUrl(null);
        return userRepository.save(user);
    }

    public User updateProfile(User user, ProfileUpdateRequest request) {
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        return userRepository.save(user);
    }
}