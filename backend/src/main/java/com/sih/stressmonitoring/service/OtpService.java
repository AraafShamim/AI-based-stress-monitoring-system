package com.sih.stressmonitoring.service;

import com.sih.stressmonitoring.entity.OtpChallenge;
import com.sih.stressmonitoring.entity.User;
import com.sih.stressmonitoring.entity.enums.OtpPurpose;
import com.sih.stressmonitoring.entity.enums.OtpStatus;
import com.sih.stressmonitoring.notification.SmsProvider;
import com.sih.stressmonitoring.repository.OtpChallengeRepository;
import com.sih.stressmonitoring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpChallengeRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsProvider smsProvider;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;

    @Transactional
    public void generateAndSendOtp(String phoneNumber, OtpPurpose purpose) {
        // Normalize phone
        String phone = normalizePhone(phoneNumber);

        // Security check: If purpose is login/password reset, user MUST exist
        User user = null;
        if (purpose == OtpPurpose.LOGIN || purpose == OtpPurpose.PASSWORD_RESET) {
            user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new IllegalArgumentException("No user found with this phone number"));
        } else if (purpose == OtpPurpose.PHONE_VERIFICATION) {
            user = userRepository.findByPhone(phone).orElse(null);
        }

        // Check cooldown
        Optional<OtpChallenge> recentOtp = otpRepository
                .findFirstByPhoneNumberAndPurposeAndStatusOrderByCreatedAtDesc(phone, purpose, OtpStatus.PENDING);
        if (recentOtp.isPresent()) {
            long secondsSince = ChronoUnit.SECONDS.between(recentOtp.get().getCreatedAt(), Instant.now());
            if (secondsSince < COOLDOWN_SECONDS) {
                throw new IllegalStateException("Please wait before requesting another OTP");
            }
        }

        // Generate 6 digit secure code
        String otpCode = generateCode();
        String otpHash = passwordEncoder.encode(otpCode);

        OtpChallenge challenge = OtpChallenge.builder()
                .phoneNumber(phone)
                .user(user)
                .otpHash(otpHash)
                .purpose(purpose)
                .expiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .maxAttempts(MAX_ATTEMPTS)
                .build();

        otpRepository.save(challenge);

        // Send via SMS
        String message = String.format("Your verification code is: %s. Valid for %d minutes. Do not share this.", otpCode, OTP_EXPIRY_MINUTES);
        smsProvider.sendSms(phone, message);
    }

    @Transactional
    public Optional<User> verifyOtp(String phoneNumber, String otp, OtpPurpose purpose) {
        String phone = normalizePhone(phoneNumber);

        OtpChallenge challenge = otpRepository
                .findFirstByPhoneNumberAndPurposeAndStatusOrderByCreatedAtDesc(phone, purpose, OtpStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("No pending OTP request found"));

        if (Instant.now().isAfter(challenge.getExpiresAt())) {
            challenge.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(challenge);
            throw new IllegalArgumentException("OTP has expired");
        }

        challenge.setAttempts(challenge.getAttempts() + 1);

        if (challenge.getAttempts() > challenge.getMaxAttempts()) {
            challenge.setStatus(OtpStatus.FAILED);
            otpRepository.save(challenge);
            throw new IllegalArgumentException("Maximum verification attempts exceeded");
        }

        if (!passwordEncoder.matches(otp, challenge.getOtpHash())) {
            otpRepository.save(challenge);
            throw new IllegalArgumentException("Invalid OTP");
        }

        // Success
        challenge.setStatus(OtpStatus.VERIFIED);
        challenge.setVerifiedAt(Instant.now());
        otpRepository.save(challenge);

        // Handle Side-effects
        User user = challenge.getUser();
        if (purpose == OtpPurpose.PHONE_VERIFICATION && user != null) {
            user.setPhoneVerified(true);
            user.setPhoneVerifiedAt(Instant.now());
            userRepository.save(user);
        }

        return Optional.ofNullable(user);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    private String normalizePhone(String phone) {
        if (!phone.startsWith("+")) {
            phone = "+91" + phone;
        }
        return phone;
    }
}
