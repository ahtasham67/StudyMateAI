package com.studymate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateReplyRequest {
    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content must not exceed 5000 characters")
    private String content;

    private Long parentReplyId; // Optional, for nested replies

    // Constructors
    public CreateReplyRequest() {
    }

    public CreateReplyRequest(String content) {
        this.content = content;
    }

    public CreateReplyRequest(String content, Long parentReplyId) {
        this.content = content;
        this.parentReplyId = parentReplyId;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getParentReplyId() {
        return parentReplyId;
    }

    public void setParentReplyId(Long parentReplyId) {
        this.parentReplyId = parentReplyId;
    }
}
