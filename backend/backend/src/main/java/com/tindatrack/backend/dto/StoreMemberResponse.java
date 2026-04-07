package com.tindatrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoreMemberResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String joinedAt;
}
