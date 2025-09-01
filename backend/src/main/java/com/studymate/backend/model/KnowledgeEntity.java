package com.studymate.backend.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "knowledge_entities")
public class KnowledgeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "entity_type")
    private String entityType; // CONCEPT, TOPIC, TERM, PERSON, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "frequency_count")
    private Integer frequencyCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many-to-many relationship with discussion threads
    @ManyToMany(mappedBy = "knowledgeEntities")
    private Set<DiscussionThread> relatedThreads = new HashSet<>();

    // Self-referencing many-to-many for entity relationships
    @ManyToMany
    @JoinTable(name = "entity_relationships", joinColumns = @JoinColumn(name = "source_entity_id"), inverseJoinColumns = @JoinColumn(name = "target_entity_id"))
    private Set<KnowledgeEntity> relatedEntities = new HashSet<>();

    @ManyToMany(mappedBy = "relatedEntities")
    private Set<KnowledgeEntity> parentEntities = new HashSet<>();

    public KnowledgeEntity() {
    }

    public KnowledgeEntity(String name, String entityType, String description, Double confidenceScore) {
        this.name = name;
        this.entityType = entityType;
        this.description = description;
        this.confidenceScore = confidenceScore;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementFrequency() {
        this.frequencyCount++;
        this.updatedAt = LocalDateTime.now();
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<DiscussionThread> getRelatedThreads() {
        return relatedThreads;
    }

    public void setRelatedThreads(Set<DiscussionThread> relatedThreads) {
        this.relatedThreads = relatedThreads;
    }

    public Set<KnowledgeEntity> getRelatedEntities() {
        return relatedEntities;
    }

    public void setRelatedEntities(Set<KnowledgeEntity> relatedEntities) {
        this.relatedEntities = relatedEntities;
    }

    public Set<KnowledgeEntity> getParentEntities() {
        return parentEntities;
    }

    public void setParentEntities(Set<KnowledgeEntity> parentEntities) {
        this.parentEntities = parentEntities;
    }
}
