package com.sih.stressmonitoring.service;

import com.sih.stressmonitoring.dto.checkin.CheckInRequest;
import com.sih.stressmonitoring.dto.checkin.CheckInResponse;
import com.sih.stressmonitoring.entity.CheckIn;
import com.sih.stressmonitoring.entity.Consent;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.entity.enums.ConsentStatus;
import com.sih.stressmonitoring.repository.CheckInRepository;
import com.sih.stressmonitoring.repository.ConsentRepository;
import com.sih.stressmonitoring.repository.VictimRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private static final Logger log = LoggerFactory.getLogger(CheckInService.class);
    public static final String SCORING_QUEUE = "checkin_scoring_queue";

    private final CheckInRepository checkInRepository;
    private final VictimRepository victimRepository;
    private final ConsentRepository consentRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public CheckInResponse ingestCheckIn(CheckInRequest request) {

        Victim victim = victimRepository.findById(request.getVictimId())
                .orElseThrow(() -> new NoSuchElementException("Victim not found"));

        if (!victim.getMonitoringActive()) {
            throw new IllegalStateException("Monitoring is inactive for this victim");
        }

        // Verify active consent
        Consent latestConsent = consentRepository.findFirstByVictimIdAndStatusOrderByCreatedAtDesc(victim.getId(), ConsentStatus.GRANTED)
                .orElseThrow(() -> new IllegalStateException("No active consent found for check-in"));

        // Persist the checkin raw data
        CheckIn checkIn = CheckIn.builder()
                .victim(victim)
                .channel(request.getChannel())
                .rawText(request.getRawText())
                .audioRef(request.getAudioRef())
                .responseLatencySec(request.getResponseLatencySec())
                .metadata(request.getMetadata())
                .isMissed(request.getIsMissed() != null ? request.getIsMissed() : false)
                .processingStatus("PENDING")
                .build();

        checkIn = checkInRepository.save(checkIn);

        // Try pushing to Redis Queue for async decoupled processing
        try {
            redisTemplate.opsForList().rightPush(SCORING_QUEUE, checkIn.getId().toString());
            log.info("Pushed check-in {} to Redis queue {}", checkIn.getId(), SCORING_QUEUE);
        } catch (Exception e) {
            log.warn("Failed to push to Redis queue (will be picked up by DB polling fallback): {}", e.getMessage());
        }

        // Return immediately without waiting for AI
        return CheckInResponse.builder()
                .id(checkIn.getId())
                .victimId(victim.getId())
                .channel(checkIn.getChannel())
                .createdAt(checkIn.getCreatedAt())
                .status(checkIn.getProcessingStatus())
                .build();
    }
}
