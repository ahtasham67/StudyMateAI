package com.studymate.backend.dto;

import java.time.LocalDateTime;

public class ChatbotResponse {

    private String response;
    private String type; // "summary", "answer", "topics"
    private Long materialId;
    private String materialName;
    private LocalDateTime timestamp;

    // Constructors
    public ChatbotResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatbotResponse(String response, String type, Long materialId, String materialName) {
        this.response = response;
        this.type = type;
        this.materialId = materialId;
        this.materialName = materialName;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getMaterialId() {
        return materialId;
    }

    public void setMaterialId(Long materialId) {
        this.materialId = materialId;
    }

    public String getMaterialName() {
        return materialName;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
