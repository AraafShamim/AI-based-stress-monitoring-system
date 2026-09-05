package com.sih.stressmonitoring.queue;

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
import com.sih.stressmonitoring.repository.VictimRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class JobWorker {

    private static final Logger logger = LoggerFactory.getLogger(JobWorker.class);
    private final RedisTemplate<String, Object> redisTemplate;
    private final AiServiceClient aiServiceClient;
    private final CheckInRepository checkInRepository;
    private final ScoreRepository scoreRepository;
    private final AlertRepository alertRepository;
    private final VictimRepository victimRepository;

    @Scheduled(fixedDelayString = "1000") // Check queue every 1s
    public void processQueue() {
        Object item = redisTemplate.opsForList().leftPop(JobPublisher.SCORING_QUEUE, Duration.ofSeconds(1));
        if (item instanceof ScoringJob job) {
            try {
                processJob(job);
            } catch (Exception e) {
                logger.error("Error processing scoring job: {}", e.getMessage());
                handleFailure(job);
            }
        }
    }

    @Transactional
    public void processJob(ScoringJob job) {
        logger.info("Processing scoring job for checkin {}", job.getCheckinId());

        // 1. Idempotency check: Already scored?
        if (scoreRepository.existsByCheckInId(job.getCheckinId())) {
            logger.info("Score already exists for checkin {}. Ignoring job.", job.getCheckinId());
            return;
        }

        CheckIn checkIn = checkInRepository.findById(job.getCheckinId())
                .orElseThrow(() -> new IllegalStateException("Checkin missing: " + job.getCheckinId()));
        Victim victim = victimRepository.findById(job.getVictimId())
                .orElseThrow(() -> new IllegalStateException("Victim missing: " + job.getVictimId()));

        // 2. Call AI/Mock
        ScoreRequest req = ScoreRequest.builder()
                .checkinId(job.getCheckinId())
                .victimId(job.getVictimId())
                .text(job.getText())
                .audioRef(job.getAudioRef())
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

        // DB trigger updates victim.currentRiskTier automatically in real DB execution.
        // But Hibernate doesn't know it unless refreshed. We'll proceed to evaluating alerts off the new result's risk tier directly.

        // 4. Alert evaluation
        evaluateAndCreateAlert(score, victim);
    }

    private void evaluateAndCreateAlert(Score score, Victim victim) {
        RiskTier tier = score.getRiskTier();
        if (tier == RiskTier.HIGH || tier == RiskTier.CRITICAL) {

            // Prevent duplicate alerts
            boolean alertOpen = alertRepository.existsByScoreIdAndStatus(score.getId(), AlertStatus.OPEN);
            if (!alertOpen) {
                String threshold = "DDS >= 70 (Escalation to " + tier.name() + ")";
                Alert alert = Alert.builder()
                        .victim(victim)
                        .score(score)
                        .thresholdCrossed(threshold)
                        .status(AlertStatus.OPEN)
                        .assignedTo(victim.getAssignedCounsellor()) // Assumes we will fetch User entity
                        .build();

                alertRepository.save(alert);
                logger.info("Created {} alert for victim {}", tier, victim.getId());

                // Usually we trigger WebSocket or Email notification here.
            }
        }
    }

    private void handleFailure(ScoringJob job) {
        job.setAttempt(job.getAttempt() + 1);
        if (job.getAttempt() < 3) {
            // Requeue for retry
            redisTemplate.opsForList().rightPush(JobPublisher.SCORING_QUEUE, job);
            logger.info("Job re-queued. Attempt {}", job.getAttempt());
        } else {
            logger.error("Job max retries exceeded for checkin {}", job.getCheckinId());
            // Log for manual intervention / DLQ
        }
    }
}
