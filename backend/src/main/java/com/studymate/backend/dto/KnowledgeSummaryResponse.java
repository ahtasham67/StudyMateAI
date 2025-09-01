package com.studymate.backend.dto;

import java.util.List;

public class KnowledgeSummaryResponse {
    private String aiGeneratedSummary;
    private Double knowledgeScore;
    private List<KnowledgeEntityResponse> keyEntities;
    private List<ThreadResponse> relatedThreads;
    private List<String> suggestedTopics;

    public KnowledgeSummaryResponse() {
    }

    public KnowledgeSummaryResponse(String aiGeneratedSummary, Double knowledgeScore,
            List<KnowledgeEntityResponse> keyEntities,
            List<ThreadResponse> relatedThreads,
            List<String> suggestedTopics) {
        this.aiGeneratedSummary = aiGeneratedSummary;
        this.knowledgeScore = knowledgeScore;
        this.keyEntities = keyEntities;
        this.relatedThreads = relatedThreads;
        this.suggestedTopics = suggestedTopics;
    }

    // Getters and Setters
    public String getAiGeneratedSummary() {
        return aiGeneratedSummary;
    }

    public void setAiGeneratedSummary(String aiGeneratedSummary) {
        this.aiGeneratedSummary = aiGeneratedSummary;
    }

    public Double getKnowledgeScore() {
        return knowledgeScore;
    }

    public void setKnowledgeScore(Double knowledgeScore) {
        this.knowledgeScore = knowledgeScore;
    }

    public List<KnowledgeEntityResponse> getKeyEntities() {
        return keyEntities;
    }

    public void setKeyEntities(List<KnowledgeEntityResponse> keyEntities) {
        this.keyEntities = keyEntities;
    }

    public List<ThreadResponse> getRelatedThreads() {
        return relatedThreads;
    }

    public void setRelatedThreads(List<ThreadResponse> relatedThreads) {
        this.relatedThreads = relatedThreads;
    }

    public List<String> getSuggestedTopics() {
        return suggestedTopics;
    }

    public void setSuggestedTopics(List<String> suggestedTopics) {
        this.suggestedTopics = suggestedTopics;
    }
}
