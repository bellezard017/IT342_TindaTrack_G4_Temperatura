package com.tindatrack.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long storeId;   
    private String type;    
    private String label;   
    private String userId;
    private String userName;
    private Double amount;  

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}