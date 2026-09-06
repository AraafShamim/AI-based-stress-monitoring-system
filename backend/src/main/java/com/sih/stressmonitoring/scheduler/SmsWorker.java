package com.sih.stressmonitoring.scheduler;

import com.sih.stressmonitoring.entity.Alert;
import com.sih.stressmonitoring.entity.UserSmsEvent;
import com.sih.stressmonitoring.entity.enums.AlertStatus;
import com.sih.stressmonitoring.entity.enums.SmsStatus;
import com.sih.stressmonitoring.notification.SmsProvider;
import com.sih.stressmonitoring.repository.AlertRepository;
import com.sih.stressmonitoring.repository.UserSmsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsWorker {

    private final UserSmsEventRepository smsEventRepository;
    private final AlertRepository alertRepository;
    private final SmsProvider smsProvider;

    // Run every 5 minutes (300000 ms)
    @Scheduled(fixedDelayString = "${sms.scheduler.interval:300000}")
    @Transactional
    public void processEscalations() {
        log.info("Checking for overdue SMS events to escalate");

        List<UserSmsEvent> overdueEvents = smsEventRepository.findByStatusAndFollowUpDueAtBefore(
                SmsStatus.SENT, Instant.now());

        for (UserSmsEvent event : overdueEvents) {
            escalateEvent(event);
        }
    }

    private void escalateEvent(UserSmsEvent event) {
        event.setStatus(SmsStatus.ESCALATED);
        event.setEscalatedAt(Instant.now());
        smsEventRepository.save(event);

        // Prevent duplicating alerts if one already exists for this score
        if (event.getScore() != null) {
            boolean existingAlert = alertRepository.existsByScoreIdAndStatus(event.getScore().getId(), AlertStatus.OPEN);
            if (!existingAlert) {
                Alert alert = Alert.builder()
                        .victim(event.getVictim())
                        .score(event.getScore())
                        .thresholdCrossed("DISTRESS_SMS_NO_RESPONSE")
                        .status(AlertStatus.OPEN)
                        .assignedTo(event.getVictim().getAssignedCounsellor())
                        .build();
                alertRepository.save(alert);
                log.info("Created DISTRESS_SMS_NO_RESPONSE alert for victim {}", event.getVictim().getId());
            }
        }
    }
}
