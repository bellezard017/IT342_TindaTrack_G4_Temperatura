package com.tindatrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenResponse {
    private String access_token;
    private String token_type;
    private long expires_in;
    private String refresh_token;
    private String id_token;
}