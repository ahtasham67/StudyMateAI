package com.studymate.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class KnowledgeEntityResponse {
    private Long id;
    private String name;
    private String entityType;
    private String description;
    private Double confidenceScore;
    private Integer frequencyCount;
    private LocalDateTime createdAt;
    private List<String> relatedEntityNames;
    private Long relatedThreadCount;

    public KnowledgeEntityResponse() {
    }

    public KnowledgeEntityResponse(Long id, String name, String entityType, String description,
            Double confidenceScore, Integer frequencyCount, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.entityType = entityType;
        this.description = description;
        this.confidenceScore = confidenceScore;
        this.frequencyCount = frequencyCount;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Integer getFrequencyCount() {
        return frequencyCount;
    }

    public void setFrequencyCount(Integer frequencyCount) {
        this.frequencyCount = frequencyCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getRelatedEntityNames() {
        return relatedEntityNames;
    }

    public void setRelatedEntityNames(List<String> relatedEntityNames) {
        this.relatedEntityNames = relatedEntityNames;
    }

    public Long getRelatedThreadCount() {
        return relatedThreadCount;
    }

    public void setRelatedThreadCount(Long relatedThreadCount) {
        this.relatedThreadCount = relatedThreadCount;
    }
}
