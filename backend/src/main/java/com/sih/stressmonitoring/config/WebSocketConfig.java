package com.sih.stressmonitoring.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:*}")
    private String[] allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] parsedOrigins = Arrays.stream(allowedOrigins)
                .flatMap(s -> Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
                
        // Ensure * is handled correctly for Spring if needed, but normally exact origins or * allowed
        if (parsedOrigins.length == 1 && "*".equals(parsedOrigins[0])) {
            registry.addEndpoint("/ws/alerts").setAllowedOriginPatterns("*").withSockJS();
            registry.addEndpoint("/ws/alerts").setAllowedOriginPatterns("*");
        } else {
            registry.addEndpoint("/ws/alerts").setAllowedOrigins(parsedOrigins).withSockJS();
            registry.addEndpoint("/ws/alerts").setAllowedOrigins(parsedOrigins);
        }
    }
}
