package com.sih.stressmonitoring.controller;

import com.sih.stressmonitoring.dto.sms.WebhookRequest;
import com.sih.stressmonitoring.entity.UserSmsEvent;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.entity.enums.SmsStatus;
import com.sih.stressmonitoring.repository.UserSmsEventRepository;
import com.sih.stressmonitoring.repository.VictimRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/sms")
@RequiredArgsConstructor
@Tag(name = "SMS Webhook", description = "Inbound SMS webhook processor")
public class SmsWebhookController {

    private final UserSmsEventRepository smsEventRepository;
    private final VictimRepository victimRepository;

    @PostMapping("/webhook")
    @Operation(summary = "Process incoming SMS response")
    public ResponseEntity<Void> processWebhook(@RequestBody WebhookRequest request) {
        String phone = normalizePhone(request.getFrom());
        String text = request.getBody() != null ? request.getBody().trim().toUpperCase() : "";

        log.info("Received SMS Webhook from {}", phone);

        // Find pending or sent event
        UserSmsEvent event = smsEventRepository
                .findFirstByPhoneNumberAndStatusInOrderByCreatedAtDesc(phone, List.of(SmsStatus.SENT, SmsStatus.DELIVERED))
                .orElse(null);

        if (event != null) {
            event.setResponseText(text);
            event.setRespondedAt(Instant.now());
            event.setStatus(SmsStatus.RESPONDED);

            if (text.equals("YES") || text.equals("HELP")) {
                event.setResponseType(text);
                smsEventRepository.save(event);
            } else if (text.equals("STOP")) {
                event.setResponseType("STOP");
                smsEventRepository.save(event);

                // Opt out logic
                Victim victim = event.getVictim();
                if (victim != null) {
                    victim.setMonitoringActive(false);
                    victimRepository.save(victim);
                    log.info("Victim {} opted out via SMS STOP", victim.getId());
                }
            } else {
                event.setResponseType("OTHER");
                smsEventRepository.save(event);
            }
        } else {
            // Handle unsolicited STOP or HELP if victim exists
            if (text.equals("STOP")) {
                 List<Victim> victims = victimRepository.findByContactNumber(phone);
                 for (Victim v : victims) {
                     v.setMonitoringActive(false);
                     victimRepository.save(v);
                     log.info("Victim {} opted out via unsolicited SMS STOP", v.getId());
                 }
            }
        }

        return ResponseEntity.ok().build();
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        if (!phone.startsWith("+")) {
            phone = "+91" + phone;
        }
        return phone;
    }
}
