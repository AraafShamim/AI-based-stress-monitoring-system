package com.sih.stressmonitoring.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockSmsProvider implements SmsProvider {

    @Value("${sms.mock-enabled:true}")
    private boolean mockEnabled;

    @Override
    public void sendSms(String phoneNumber, String message) {
        if (mockEnabled) {
            log.info("MOCK_SMS_SENT to {}: {}", phoneNumber, message);
        } else {
            // Integrate Exotel/Twilio SDK
            log.warn("Real SMS provider not implemented. MOCK fallback triggered -> {}: {}", phoneNumber, message);
        }
    }
}
