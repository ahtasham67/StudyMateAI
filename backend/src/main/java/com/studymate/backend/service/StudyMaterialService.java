package com.studymate.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.repository.StudyMaterialRepository;

@Service
public class StudyMaterialService {

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public StudyMaterial saveFile(MultipartFile file, String subject, String description, Long userId)
            throws IOException {
        // Validate file
        validateFile(file);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Determine file type
        StudyMaterial.FileType fileType = determineFileType(fileExtension);

        // Create StudyMaterial entity
        StudyMaterial studyMaterial = new StudyMaterial();
        studyMaterial.setFileName(uniqueFilename);
        studyMaterial.setOriginalName(originalFilename);
        studyMaterial.setFileType(fileType);
        studyMaterial.setFileSize(file.getSize());
        studyMaterial.setFileData(file.getBytes());
        studyMaterial.setSubject(subject != null ? subject : "");
        studyMaterial.setDescription(description != null ? description : "");
        studyMaterial.setUserId(userId);

        return studyMaterialRepository.save(studyMaterial);
    }

    public List<StudyMaterial> getUserMaterials(Long userId) {
        return studyMaterialRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public StudyMaterial getMaterialById(Long id, Long userId) {
        return studyMaterialRepository.findByIdAndUserId(id, userId).orElse(null);
    }

    public boolean deleteMaterial(Long id, Long userId) {
        var material = studyMaterialRepository.findByIdAndUserId(id, userId);
        if (material.isPresent()) {
            studyMaterialRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<StudyMaterial> searchMaterials(String query, Long userId) {
        return studyMaterialRepository.searchByUserIdAndQuery(userId, query);
    }

    public List<StudyMaterial> getMaterialsBySubject(String subject, Long userId) {
        return studyMaterialRepository.findByUserIdAndSubjectContainingIgnoreCase(userId, subject);
    }

    public List<StudyMaterial> getMaterialsByFileType(StudyMaterial.FileType fileType, Long userId) {
        return studyMaterialRepository.findByUserIdAndFileType(userId, fileType);
    }

    public long getUserMaterialCount(Long userId) {
        return studyMaterialRepository.countByUserId(userId);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 50MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!isValidFileType(extension)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, PPT, and PPTX files are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private boolean isValidFileType(String extension) {
        return extension.equals("pdf") || extension.equals("ppt") || extension.equals("pptx");
    }

    private StudyMaterial.FileType determineFileType(String extension) {
        switch (extension.toLowerCase()) {
            case "pdf":
                return StudyMaterial.FileType.PDF;
            case "ppt":
                return StudyMaterial.FileType.PPT;
            case "pptx":
                return StudyMaterial.FileType.PPTX;
            default:
                throw new IllegalArgumentException("Unsupported file type: " + extension);
        }
    }
}
