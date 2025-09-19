package com.studymate.backend.model;

import java.time.LocalDateTime;
import java.util.HashSet;
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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "thread_replies")
public class ThreadReply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 5000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private DiscussionThread thread;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id")
    private ThreadReply parentReply;

    @OneToMany(mappedBy = "reply", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ReplyKeyPhrase> keyPhrases = new HashSet<>();

    @Column(name = "is_moderated", nullable = false)
    private Boolean isModerated = false;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public ThreadReply() {
    }

    public ThreadReply(String content, DiscussionThread thread, User author) {
        this.content = content;
        this.thread = thread;
        this.author = author;
    }

    public ThreadReply(String content, DiscussionThread thread, User author, ThreadReply parentReply) {
        this.content = content;
        this.thread = thread;
        this.author = author;
        this.parentReply = parentReply;
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

    public DiscussionThread getThread() {
        return thread;
    }

    public void setThread(DiscussionThread thread) {
        this.thread = thread;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public ThreadReply getParentReply() {
        return parentReply;
    }

    public void setParentReply(ThreadReply parentReply) {
        this.parentReply = parentReply;
    }

    public Boolean getIsModerated() {
        return isModerated;
    }

    public void setIsModerated(Boolean isModerated) {
        this.isModerated = isModerated;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
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

    public Set<ReplyKeyPhrase> getKeyPhrases() {
        return keyPhrases;
    }

    public void setKeyPhrases(Set<ReplyKeyPhrase> keyPhrases) {
        this.keyPhrases = keyPhrases;
    }

    public void addKeyPhrase(ReplyKeyPhrase keyPhrase) {
        keyPhrases.add(keyPhrase);
        keyPhrase.setReply(this);
    }

    public void removeKeyPhrase(ReplyKeyPhrase keyPhrase) {
        keyPhrases.remove(keyPhrase);
        keyPhrase.setReply(null);
    }
}
