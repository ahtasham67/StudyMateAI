package com.studymate.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ThreadResponse {
    private Long id;
    private String title;
    private String content;
    private String course;
    private String topic;
    private String authorName;
    private Boolean isPinned;
    private Boolean isLocked;
    private Integer viewCount;
    private Integer replyCount;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;

    // Knowledge Graph fields
    private String aiGeneratedSummary;
    private Double knowledgeScore;
    private List<KnowledgeEntityResponse> knowledgeEntities;

    // Constructors
    public ThreadResponse() {
    }

    public ThreadResponse(Long id, String title, String content, String course, String topic,
            String authorName, Boolean isPinned, Boolean isLocked,
            Integer viewCount, Integer replyCount,
            LocalDateTime createdAt, LocalDateTime lastActivityAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.course = course;
        this.topic = topic;
        this.authorName = authorName;
        this.isPinned = isPinned;
        this.isLocked = isLocked;
        this.viewCount = viewCount;
        this.replyCount = replyCount;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }

    public Integer getReplyCount() {
        return replyCount;
    }

    public void setReplyCount(Integer replyCount) {
        this.replyCount = replyCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

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

    public List<KnowledgeEntityResponse> getKnowledgeEntities() {
        return knowledgeEntities;
    }

    public void setKnowledgeEntities(List<KnowledgeEntityResponse> knowledgeEntities) {
        this.knowledgeEntities = knowledgeEntities;
    }
}
