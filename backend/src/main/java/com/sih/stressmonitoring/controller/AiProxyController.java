package com.sih.stressmonitoring.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiProxyController {

    private final RestClient restClient;

    public AiProxyController(RestClient.Builder restClientBuilder, @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(aiServiceUrl).build();
    }

    @PostMapping("/chat")
    public ResponseEntity<String> proxyChat(@RequestBody Map<String, Object> request) {
        return restClient.post()
                .uri("/ai/v1/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toEntity(String.class);
    }

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> proxyTranscribe(@RequestParam("file") MultipartFile file) throws Exception {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());

        return restClient.post()
                .uri("/ai/v1/transcribe")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .toEntity(String.class);
    }

    @PostMapping("/counselor-insight")
    public ResponseEntity<String> proxyCounselorInsight(@RequestBody Map<String, Object> request) {
        return restClient.post()
                .uri("/ai/v1/counselor-insight")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .toEntity(String.class);
    }
}
