package com.studymate.backend.dto;

import java.time.LocalDateTime;

public class ReplyResponse {
    private Long id;
    private String content;
    private String authorName;
    private Long parentReplyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double averageRating;
    private Integer ratingCount;
    private Integer userRating;

    // Constructors
    public ReplyResponse() {
    }

    public ReplyResponse(Long id, String content, String authorName, Long parentReplyId,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.authorName = authorName;
        this.parentReplyId = parentReplyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.averageRating = 0.0;
        this.ratingCount = 0;
        this.userRating = null;
    }

    public ReplyResponse(Long id, String content, String authorName, Long parentReplyId,
            LocalDateTime createdAt, LocalDateTime updatedAt,
            Double averageRating, Integer ratingCount, Integer userRating) {
        this.id = id;
        this.content = content;
        this.authorName = authorName;
        this.parentReplyId = parentReplyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
        this.userRating = userRating;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Long getParentReplyId() {
        return parentReplyId;
    }

    public void setParentReplyId(Long parentReplyId) {
        this.parentReplyId = parentReplyId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Integer getUserRating() {
        return userRating;
    }

    public void setUserRating(Integer userRating) {
        this.userRating = userRating;
    }
}
