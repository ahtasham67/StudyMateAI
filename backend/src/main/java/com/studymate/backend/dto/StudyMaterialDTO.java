package com.studymate.backend.dto;

import java.time.LocalDateTime;

public class StudyMaterialDTO {
    private Long id;
    private String fileName;
    private String originalName;
    private String fileType;
    private Long fileSize;
    private String subject;
    private String description;
    private String category;
    private Long folderId;
    private String folderName;
    private String folderPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public StudyMaterialDTO() {
    }

    public StudyMaterialDTO(Long id, String fileName, String originalName, String fileType,
            Long fileSize, String subject, String description, String category,
            Long folderId, String folderName, String folderPath,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fileName = fileName;
        this.originalName = originalName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.subject = subject;
        this.description = description;
        this.category = category;
        this.folderId = folderId;
        this.folderName = folderName;
        this.folderPath = folderPath;
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getFolderName() {
        return folderName;
    }

    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public void setFolderPath(String folderPath) {
        this.folderPath = folderPath;
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

    @Override
    public String toString() {
        return "StudyMaterialDTO{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", originalName='" + originalName + '\'' +
                ", fileType='" + fileType + '\'' +
                ", fileSize=" + fileSize +
                ", subject='" + subject + '\'' +
                ", folderId=" + folderId +
                ", folderName='" + folderName + '\'' +
                '}';
    }
}
