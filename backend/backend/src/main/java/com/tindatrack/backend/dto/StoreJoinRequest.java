package com.tindatrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreJoinRequest {

    @NotBlank(message = "Store code is required")
    private String storeCode;
}
