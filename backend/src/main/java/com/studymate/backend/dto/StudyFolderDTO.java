package com.studymate.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StudyFolderDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Long parentFolderId;
    private String parentFolderName;
    private String fullPath;
    private int materialCount;
    private int subFolderCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StudyFolderDTO> subFolders;
    private List<StudyMaterialDTO> studyMaterials;

    // Constructors
    public StudyFolderDTO() {
    }

    public StudyFolderDTO(Long id, String name, String description, String color,
            Long parentFolderId, String parentFolderName, String fullPath,
            int materialCount, int subFolderCount,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.parentFolderId = parentFolderId;
        this.parentFolderName = parentFolderName;
        this.fullPath = fullPath;
        this.materialCount = materialCount;
        this.subFolderCount = subFolderCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Long getParentFolderId() {
        return parentFolderId;
    }

    public void setParentFolderId(Long parentFolderId) {
        this.parentFolderId = parentFolderId;
    }

    public String getParentFolderName() {
        return parentFolderName;
    }

    public void setParentFolderName(String parentFolderName) {
        this.parentFolderName = parentFolderName;
    }

    public String getFullPath() {
        return fullPath;
    }

    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    public int getMaterialCount() {
        return materialCount;
    }

    public void setMaterialCount(int materialCount) {
        this.materialCount = materialCount;
    }

    public int getSubFolderCount() {
        return subFolderCount;
    }

    public void setSubFolderCount(int subFolderCount) {
        this.subFolderCount = subFolderCount;
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

    public List<StudyFolderDTO> getSubFolders() {
        return subFolders;
    }

    public void setSubFolders(List<StudyFolderDTO> subFolders) {
        this.subFolders = subFolders;
    }

    public List<StudyMaterialDTO> getStudyMaterials() {
        return studyMaterials;
    }

    public void setStudyMaterials(List<StudyMaterialDTO> studyMaterials) {
        this.studyMaterials = studyMaterials;
    }

    @Override
    public String toString() {
        return "StudyFolderDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", color='" + color + '\'' +
                ", parentFolderId=" + parentFolderId +
                ", fullPath='" + fullPath + '\'' +
                ", materialCount=" + materialCount +
                ", subFolderCount=" + subFolderCount +
                '}';
    }
}
