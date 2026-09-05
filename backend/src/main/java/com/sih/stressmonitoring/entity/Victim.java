package com.sih.stressmonitoring.entity;

import com.sih.stressmonitoring.entity.enums.RiskTier;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "victims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Victim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_id", nullable = false, unique = true, length = 100)
    private String caseId;

    @Builder.Default
    @Column(name = "language_pref", nullable = false, length = 10)
    private String languagePref = "hi";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "current_risk_tier", nullable = false)
    private RiskTier currentRiskTier = RiskTier.LOW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_counsellor_id")
    private User assignedCounsellor;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Builder.Default
    @Column(name = "monitoring_active", nullable = false)
    private Boolean monitoringActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
