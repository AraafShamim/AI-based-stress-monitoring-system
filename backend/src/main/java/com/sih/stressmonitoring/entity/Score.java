package com.sih.stressmonitoring.entity;

import com.sih.stressmonitoring.entity.enums.RiskTier;
import com.sih.stressmonitoring.entity.enums.SentimentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkin_id", nullable = false, unique = true)
    private CheckIn checkIn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "victim_id", nullable = false)
    private Victim victim;

    @Column(name = "dds_score", nullable = false)
    private Integer ddsScore;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "risk_tier", nullable = false)
    private RiskTier riskTier;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "sentiment_label", nullable = false)
    private SentimentType sentimentLabel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "emotion_signals", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> emotionSignals;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "contributing_factors", columnDefinition = "jsonb", nullable = false)
    private List<String> contributingFactors;

    @Builder.Default
    @Column(name = "escalation_flag", nullable = false)
    private Boolean escalationFlag = false;

    @Column(name = "confidence_score", precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
