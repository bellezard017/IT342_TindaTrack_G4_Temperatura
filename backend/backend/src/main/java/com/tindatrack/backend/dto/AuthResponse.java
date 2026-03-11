package com.tindatrack.backend.dto;

import com.tindatrack.backend.model.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
}
