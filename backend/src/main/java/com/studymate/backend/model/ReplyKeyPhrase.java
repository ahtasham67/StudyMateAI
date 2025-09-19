package com.studymate.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reply_key_phrases")
public class ReplyKeyPhrase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyPhrase;

    @Column(nullable = false)
    private Double relevanceScore = 1.0;

    @Column(nullable = false)
    private Integer frequency = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id", nullable = false)
    private ThreadReply reply;

    // Constructors
    public ReplyKeyPhrase() {
    }

    public ReplyKeyPhrase(String keyPhrase, ThreadReply reply) {
        this.keyPhrase = keyPhrase;
        this.reply = reply;
    }

    public ReplyKeyPhrase(String keyPhrase, Double relevanceScore, ThreadReply reply) {
        this.keyPhrase = keyPhrase;
        this.relevanceScore = relevanceScore;
        this.reply = reply;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKeyPhrase() {
        return keyPhrase;
    }

    public void setKeyPhrase(String keyPhrase) {
        this.keyPhrase = keyPhrase;
    }

    public Double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(Double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public Integer getFrequency() {
        return frequency;
    }

    public void setFrequency(Integer frequency) {
        this.frequency = frequency;
    }

    public ThreadReply getReply() {
        return reply;
    }

    public void setReply(ThreadReply reply) {
        this.reply = reply;
    }

    public void incrementFrequency() {
        this.frequency++;
    }
}
