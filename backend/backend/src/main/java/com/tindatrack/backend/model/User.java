package com.tindatrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    private String role;

    private Long storeId;

    private LocalDateTime createdAt;

    @Transient
    private String storeName;

    @Transient
    private String storeCode;

    @Column(length = 255)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;
}