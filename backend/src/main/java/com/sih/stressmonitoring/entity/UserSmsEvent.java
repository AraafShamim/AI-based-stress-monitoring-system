package com.sih.stressmonitoring.entity;

import com.sih.stressmonitoring.entity.enums.SmsMessageType;
import com.sih.stressmonitoring.entity.enums.SmsStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_sms_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSmsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "victim_id")
    private Victim victim;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkin_id")
    private CheckIn checkIn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_id")
    private Score score;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private SmsMessageType messageType;

    @Column(name = "message_body", length = 1000)
    private String messageBody;

    @Column(name = "provider_message_id")
    private String providerMessageId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SmsStatus status = SmsStatus.PENDING;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "response_text", length = 500)
    private String responseText;

    @Column(name = "response_type")
    private String responseType; // YES, HELP, STOP

    @Column(name = "follow_up_due_at")
    private Instant followUpDueAt;

    @Column(name = "escalated_at")
    private Instant escalatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
