package com.studymate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatbotQuestionRequest {

    @NotNull(message = "Material ID is required")
    private Long materialId;

    @NotBlank(message = "Question is required")
    private String question;

    private String conversationHistory;

    // Constructors
    public ChatbotQuestionRequest() {
    }

    public ChatbotQuestionRequest(Long materialId, String question, String conversationHistory) {
        this.materialId = materialId;
        this.question = question;
        this.conversationHistory = conversationHistory;
    }

    // Getters and Setters
    public Long getMaterialId() {
        return materialId;
    }

    public void setMaterialId(Long materialId) {
        this.materialId = materialId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(String conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}
