package com.tindatrack.backend.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String phone;
    private String address;
}