package com.studymate.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_folders")
public class StudyFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "color")
    private String color; // Hex color code for folder display

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Parent folder for nested structure
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private StudyFolder parentFolder;

    // Child folders
    @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudyFolder> subFolders = new ArrayList<>();

    // Study materials in this folder
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudyMaterial> studyMaterials = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public StudyFolder() {
    }

    public StudyFolder(String name, String description, String color, Long userId) {
        this.name = name;
        this.description = description;
        this.color = color;
        this.userId = userId;
    }

    public StudyFolder(String name, String description, String color, Long userId, StudyFolder parentFolder) {
        this.name = name;
        this.description = description;
        this.color = color;
        this.userId = userId;
        this.parentFolder = parentFolder;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public StudyFolder getParentFolder() {
        return parentFolder;
    }

    public void setParentFolder(StudyFolder parentFolder) {
        this.parentFolder = parentFolder;
    }

    public List<StudyFolder> getSubFolders() {
        return subFolders;
    }

    public void setSubFolders(List<StudyFolder> subFolders) {
        this.subFolders = subFolders;
    }

    public List<StudyMaterial> getStudyMaterials() {
        return studyMaterials;
    }

    public void setStudyMaterials(List<StudyMaterial> studyMaterials) {
        this.studyMaterials = studyMaterials;
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

    // Helper methods
    public void addSubFolder(StudyFolder subFolder) {
        subFolders.add(subFolder);
        subFolder.setParentFolder(this);
    }

    public void removeSubFolder(StudyFolder subFolder) {
        subFolders.remove(subFolder);
        subFolder.setParentFolder(null);
    }

    public void addStudyMaterial(StudyMaterial material) {
        studyMaterials.add(material);
        material.setFolder(this);
    }

    public void removeStudyMaterial(StudyMaterial material) {
        studyMaterials.remove(material);
        material.setFolder(null);
    }

    // Get full path of the folder
    public String getFullPath() {
        if (parentFolder == null) {
            return name;
        }
        return parentFolder.getFullPath() + "/" + name;
    }

    @Override
    public String toString() {
        return "StudyFolder{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", color='" + color + '\'' +
                ", userId=" + userId +
                ", parentFolder=" + (parentFolder != null ? parentFolder.getId() : null) +
                '}';
    }
}
