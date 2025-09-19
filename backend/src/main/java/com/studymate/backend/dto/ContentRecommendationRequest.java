package com.studymate.backend.dto;

public class ContentRecommendationRequest {
    private String topic;
    private String subject;
    private String difficulty;
    private String contentType; // "video", "article", "blog", "tutorial", "all"
    private String context;

    public ContentRecommendationRequest() {
    }

    public ContentRecommendationRequest(String topic, String subject, String difficulty, String contentType,
            String context) {
        this.topic = topic;
        this.subject = subject;
        this.difficulty = difficulty;
        this.contentType = contentType;
        this.context = context;
    }

    // Getters and setters
    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }
}