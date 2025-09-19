package com.studymate.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "discussion_threads", indexes = {
        @Index(name = "idx_course", columnList = "course"),
        @Index(name = "idx_topic", columnList = "topic"),
        @Index(name = "idx_course_topic", columnList = "course, topic"),
        @Index(name = "idx_last_activity", columnList = "last_activity_at"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_course_last_activity", columnList = "course, last_activity_at"),
        @Index(name = "idx_topic_last_activity", columnList = "topic, last_activity_at"),
        @Index(name = "idx_pinned_created", columnList = "is_pinned, created_at"),
        @Index(name = "idx_moderated", columnList = "is_moderated")
})
public class DiscussionThread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Size(max = 5000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String course;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String topic;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ThreadReply> replies = new ArrayList<>();

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "is_moderated", nullable = false)
    private Boolean isModerated = false;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "reply_count", nullable = false)
    private Integer replyCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    // Knowledge Graph relationships
    @ManyToMany
    @JoinTable(name = "thread_knowledge_entities", joinColumns = @JoinColumn(name = "thread_id"), inverseJoinColumns = @JoinColumn(name = "entity_id"))
    private Set<KnowledgeEntity> knowledgeEntities = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String aiGeneratedSummary;

    @Column(name = "knowledge_score")
    private Double knowledgeScore;

    // Constructors
    public DiscussionThread() {
    }

    public DiscussionThread(String title, String content, String course, String topic, User author) {
        this.title = title;
        this.content = content;
        this.course = course;
        this.topic = topic;
        this.author = author;
        this.lastActivityAt = LocalDateTime.now();
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

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public List<ThreadReply> getReplies() {
        return replies;
    }

    public void setReplies(List<ThreadReply> replies) {
        this.replies = replies;
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

    public Boolean getIsModerated() {
        return isModerated;
    }

    public void setIsModerated(Boolean isModerated) {
        this.isModerated = isModerated;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public Set<KnowledgeEntity> getKnowledgeEntities() {
        return knowledgeEntities;
    }

    public void setKnowledgeEntities(Set<KnowledgeEntity> knowledgeEntities) {
        this.knowledgeEntities = knowledgeEntities;
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

    // Helper methods
    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementReplyCount() {
        this.replyCount++;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void decrementReplyCount() {
        if (this.replyCount > 0) {
            this.replyCount--;
        }
    }
}
