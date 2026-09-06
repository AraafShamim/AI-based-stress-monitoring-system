package com.sih.stressmonitoring.service;

import com.sih.stressmonitoring.entity.CheckIn;
import com.sih.stressmonitoring.entity.Score;
import com.sih.stressmonitoring.entity.UserSmsEvent;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.entity.enums.SmsMessageType;
import com.sih.stressmonitoring.entity.enums.SmsStatus;
import com.sih.stressmonitoring.notification.SmsProvider;
import com.sih.stressmonitoring.repository.UserSmsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final UserSmsEventRepository smsEventRepository;
    private final SmsProvider smsProvider;

    @Value("${sms.distress.threshold:80}")
    private int distressThreshold;

    @Value("${sms.motivational.cooldown.hours:24}")
    private int motivationalCooldownHours;

    public void evaluateAndSendDistressSms(Score score, Victim victim, CheckIn checkIn) {
        if (!victim.getMonitoringActive()) return;

        if (score.getDdsScore() >= distressThreshold) {

            // First check if a distress message was already sent for this exact score to be idempotent
            if (smsEventRepository.existsByScoreIdAndMessageType(score.getId(), SmsMessageType.DISTRESS_CHECKIN)) {
                return;
            }

            // Also check if a motivational message is on cooldown
            boolean motivationalAllowed = true;
            var lastMotiv = smsEventRepository.findFirstByVictimIdAndMessageTypeOrderByCreatedAtDesc(victim.getId(), SmsMessageType.MOTIVATIONAL);
            if (lastMotiv.isPresent() && Instant.now().isBefore(lastMotiv.get().getCreatedAt().plus(motivationalCooldownHours, ChronoUnit.HOURS))) {
                motivationalAllowed = false;
            }

            // We can send either DISTRESS or MOTIVATIONAL, we choose DISTRESS as priority if risk is high
            // Send Distress check
            String msg = "We're checking in because things may feel difficult right now. You're not alone. Consider reaching out to someone you trust or your support team. Reply YES if you need us to contact you, or STOP to opt-out.";

            UserSmsEvent event = UserSmsEvent.builder()
                    .victim(victim)
                    .phoneNumber(victim.getContactNumber() != null ? victim.getContactNumber() : "+910000000000") // Fallback
                    .checkIn(checkIn)
                    .score(score)
                    .messageType(SmsMessageType.DISTRESS_CHECKIN)
                    .messageBody(msg)
                    .status(SmsStatus.PENDING)
                    .build();

            event = smsEventRepository.save(event);

            try {
                smsProvider.sendSms(event.getPhoneNumber(), msg);
                event.setStatus(SmsStatus.SENT);
                event.setSentAt(Instant.now());
                event.setFollowUpDueAt(Instant.now().plus(24, ChronoUnit.HOURS));
            } catch (Exception e) {
                log.error("Failed to send distress SMS: {}", e.getMessage());
                event.setStatus(SmsStatus.FAILED);
            }

            smsEventRepository.save(event);
        }
    }
}
