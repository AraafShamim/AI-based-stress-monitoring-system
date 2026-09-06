package com.sih.stressmonitoring.notification;

public interface SmsProvider {
    void sendSms(String phoneNumber, String message);
}
