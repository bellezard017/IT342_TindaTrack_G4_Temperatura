package com.tindatrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreSetupRequest {

    @NotBlank(message = "Store name is required")
    private String storeName;
}
