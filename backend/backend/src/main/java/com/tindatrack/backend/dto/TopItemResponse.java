package com.tindatrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopItemResponse {
    private int rank;
    private String name;
    private int sold;
    private double amount;
}
