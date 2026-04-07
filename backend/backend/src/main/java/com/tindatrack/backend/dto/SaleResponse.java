package com.tindatrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {
    private Long id;
    private String date;
    private String name;
    private String category;
    private Integer quantity;
    private Double price;
    private Double total;
    private String createdBy;
}
