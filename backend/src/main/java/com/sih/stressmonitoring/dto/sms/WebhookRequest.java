package com.sih.stressmonitoring.dto.sms;

import lombok.Data;

@Data
public class WebhookRequest {
    private String from; // Phone number
    private String body; // Text message
    private String providerId;
}
