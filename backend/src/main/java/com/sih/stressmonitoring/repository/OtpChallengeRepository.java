package com.sih.stressmonitoring.repository;

import com.sih.stressmonitoring.entity.OtpChallenge;
import com.sih.stressmonitoring.entity.enums.OtpPurpose;
import com.sih.stressmonitoring.entity.enums.OtpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, UUID> {
    Optional<OtpChallenge> findFirstByPhoneNumberAndPurposeAndStatusOrderByCreatedAtDesc(
            String phoneNumber, OtpPurpose purpose, OtpStatus status);

    long countByPhoneNumberAndCreatedAtAfter(String phoneNumber, Instant time);
}
