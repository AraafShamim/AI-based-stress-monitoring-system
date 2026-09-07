package com.sih.stressmonitoring.scheduler;

import com.sih.stressmonitoring.dto.ai.EmotionSignals;
import com.sih.stressmonitoring.dto.ai.ScoreRequest;
import com.sih.stressmonitoring.dto.ai.ScoreResponse;
import com.sih.stressmonitoring.entity.Alert;
import com.sih.stressmonitoring.entity.CheckIn;
import com.sih.stressmonitoring.entity.Score;
import com.sih.stressmonitoring.entity.Victim;
import com.sih.stressmonitoring.entity.enums.AlertStatus;
import com.sih.stressmonitoring.entity.enums.RiskTier;
import com.sih.stressmonitoring.entity.enums.SentimentType;
import com.sih.stressmonitoring.repository.AlertRepository;
import com.sih.stressmonitoring.repository.CheckInRepository;
import com.sih.stressmonitoring.repository.ScoreRepository;
import com.sih.stressmonitoring.service.AiScoringService;
import com.sih.stressmonitoring.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScoringWorker {

    private static final Logger logger = LoggerFactory.getLogger(ScoringWorker.class);

    private final CheckInRepository checkInRepository;
    private final ScoreRepository scoreRepository;
    private final AlertRepository alertRepository;
    private final AiScoringService aiScoringService;
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

        ScoreRequest req = new ScoreRequest(
                checkIn.getId().toString(),
                checkIn.getRawText() != null ? checkIn.getRawText() : "",
                victim.getLanguagePref(),
                Boolean.TRUE.equals(checkIn.getIsMissed()) ? List.of("missed") : List.of(),
                getPreviousScores(victim.getId()),
                checkIn.getResponseLatencySec() != null ? checkIn.getResponseLatencySec().intValue() : 0,
                null,
                null,
                locationOf(victim)
        );

        ScoreResponse result = aiScoringService.score(req);

        Score score = Score.builder()
                .checkIn(checkIn)
                .victim(victim)
                .ddsScore(result.ddsScore() != null ? result.ddsScore() : 0)
                .riskTier(toRiskTier(result.riskTier()))
                .sentimentLabel(toSentimentType(result.sentimentLabel()))
                .emotionSignals(toEmotionSignalMap(result.emotionSignals()))
                .contributingFactors(result.contributingFactors() != null ? result.contributingFactors() : List.of())
                .escalationFlag(Boolean.TRUE.equals(result.escalationFlag()))
                .confidenceScore(null)
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

    private static String locationOf(Victim victim) {
        if (victim.getDistrict() == null && victim.getState() == null) {
            return null;
        }
        if (victim.getDistrict() == null) {
            return victim.getState();
        }
        if (victim.getState() == null) {
            return victim.getDistrict();
        }
        return victim.getDistrict() + ", " + victim.getState();
    }

    private static RiskTier toRiskTier(String riskTier) {
        if (riskTier == null || riskTier.isBlank()) {
            return RiskTier.LOW;
        }
        return switch (riskTier.trim().toUpperCase(Locale.ROOT)) {
            case "MODERATE" -> RiskTier.MODERATE;
            case "HIGH" -> RiskTier.HIGH;
            case "CRITICAL" -> RiskTier.CRITICAL;
            default -> RiskTier.LOW;
        };
    }

    private static SentimentType toSentimentType(String sentimentLabel) {
        if (sentimentLabel == null) {
            return SentimentType.NEUTRAL;
        }
        String normalized = sentimentLabel.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("distress") || normalized.contains("negative")) {
            return SentimentType.DISTRESS_INDICATIVE;
        }
        if (normalized.contains("positive")) {
            return SentimentType.POSITIVE;
        }
        return SentimentType.NEUTRAL;
    }

    private static Map<String, Object> toEmotionSignalMap(EmotionSignals signals) {
        Map<String, Object> map = new HashMap<>();
        if (signals == null) {
            map.put("voice_stress", 0.0);
            map.put("flat_affect", 0.0);
            return map;
        }
        map.put("voice_stress", signals.voiceStress() != null ? signals.voiceStress() : 0.0);
        map.put("flat_affect", signals.flatAffect() != null ? signals.flatAffect() : 0.0);
        return map;
    }

    private List<Integer> getPreviousScores(java.util.UUID victimId) {
        return scoreRepository.findHistoricalScoresByVictimId(victimId, PageRequest.of(0, 5))
                .stream()
                .map(Score::getDdsScore)
                .toList();
    }
}