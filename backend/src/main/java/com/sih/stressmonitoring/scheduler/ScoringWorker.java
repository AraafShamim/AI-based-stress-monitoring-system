package com.sih.stressmonitoring.scheduler;

import com.sih.stressmonitoring.ai.AiServiceClient;
import com.sih.stressmonitoring.dto.ai.ScoreRequest;
import com.sih.stressmonitoring.dto.ai.ScoreResponse;
import com.sih.stressmonitoring.entity.Alert;
import com.sih.stressmonitoring.entity.CheckIn;
import com.sih.stressmonitoring.entity.Score;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.entity.enums.AlertStatus;
import com.sih.stressmonitoring.entity.enums.RiskTier;
import com.sih.stressmonitoring.repository.AlertRepository;
import com.sih.stressmonitoring.repository.CheckInRepository;
import com.sih.stressmonitoring.repository.ScoreRepository;
import com.sih.stressmonitoring.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoringWorker {

    private static final Logger logger = LoggerFactory.getLogger(ScoringWorker.class);

    private final CheckInRepository checkInRepository;
    private final ScoreRepository scoreRepository;
    private final AlertRepository alertRepository;
    private final AiServiceClient aiServiceClient;
    private final SmsService smsService;

    @Scheduled(fixedDelayString = "3000") // Run every 3s
    public void processPendingCheckIns() {
        // Fetch up to 10 pending check-ins at a time
        List<CheckIn> pendingCheckIns = checkInRepository.findByProcessingStatus("PENDING", PageRequest.of(0, 10));

        for (CheckIn checkIn : pendingCheckIns) {
            try {
                processSingleCheckIn(checkIn);
            } catch (Exception e) {
                logger.error("Failed to process check-in {}: {}", checkIn.getId(), e.getMessage());
                checkIn.setProcessingStatus("FAILED");
                checkInRepository.save(checkIn);
                // Real system would implement retry thresholds
            }
        }
    }

    @Transactional
    public void processSingleCheckIn(CheckIn checkIn) {
        // 1. Mark as processing (optimistic approach, in real prod use select for update or status check)
        checkIn.setProcessingStatus("PROCESSING");
        checkIn = checkInRepository.save(checkIn);

        if (scoreRepository.existsByCheckInId(checkIn.getId())) {
            logger.info("Score already exists for checkin {}. Ignoring.", checkIn.getId());
            checkIn.setProcessingStatus("COMPLETED");
            checkInRepository.save(checkIn);
            return;
        }

        Victim victim = checkIn.getVictim();

        // 2. Call AI/Mock
        ScoreRequest req = ScoreRequest.builder()
                .checkinId(checkIn.getId())
                .victimId(victim.getId())
                .text(checkIn.getRawText())
                .audioRef(checkIn.getAudioRef())
                .build();

        ScoreResponse result = aiServiceClient.getScore(req);

        // 3. Save Score
        Score score = Score.builder()
                .checkIn(checkIn)
                .victim(victim)
                .ddsScore(result.getDdsScore())
                .riskTier(result.getRiskTier())
                .sentimentLabel(result.getSentimentLabel())
                .emotionSignals(result.getEmotionSignals())
                .contributingFactors(result.getContributingFactors())
                .escalationFlag(result.getEscalationFlag())
                .confidenceScore(result.getConfidenceScore())
                .build();

        score = scoreRepository.save(score);

        // 4. Alert evaluation
        smsService.evaluateAndSendDistressSms(score, victim, checkIn);
        evaluateAndCreateAlert(score, victim);

        // 5. Mark checkin as completed
        checkIn.setProcessingStatus("COMPLETED");
        checkInRepository.save(checkIn);
    }

    private void evaluateAndCreateAlert(Score score, Victim victim) {
        RiskTier tier = score.getRiskTier();
        if (tier == RiskTier.HIGH || tier == RiskTier.CRITICAL) {
            boolean alertOpen = alertRepository.existsByScoreIdAndStatus(score.getId(), AlertStatus.OPEN);
            if (!alertOpen) {
                String threshold = "DDS >= 70 (Escalation to " + tier.name() + ")";
                Alert alert = Alert.builder()
                        .victim(victim)
                        .score(score)
                        .thresholdCrossed(threshold)
                        .status(AlertStatus.OPEN)
                        .assignedTo(victim.getAssignedCounsellor())
                        .build();

                alertRepository.save(alert);
                logger.info("Created {} alert for victim {}", tier, victim.getId());
            }
        }
    }
}
