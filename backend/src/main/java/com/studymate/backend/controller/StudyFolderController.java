package com.studymate.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.CreateFolderRequest;
import com.studymate.backend.dto.StudyFolderDTO;
import com.studymate.backend.dto.UpdateFolderRequest;
import com.studymate.backend.model.User;
import com.studymate.backend.service.StudyFolderService;

import jakarta.validation.Valid;

/**
 * REST Controller for Study Folder management
 * Provides CRUD operations for organizing study materials in folders
 */
@RestController
@RequestMapping("/folders")
public class StudyFolderController {

    private static final Logger logger = LoggerFactory.getLogger(StudyFolderController.class);

    @Autowired
    private StudyFolderService studyFolderService;

    /**
     * Get all root folders for the authenticated user
     */
    @GetMapping("/root")
    public ResponseEntity<List<StudyFolderDTO>> getRootFolders(@AuthenticationPrincipal User user) {
        try {
            logger.info("Getting root folders for user {}", user.getUsername());
            List<StudyFolderDTO> folders = studyFolderService.getRootFolders(user.getId());
            return ResponseEntity.ok(folders);
        } catch (Exception e) {
            logger.error("Error getting root folders for user {}: {}", user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get folder by ID with its contents (subfolders and materials)
     */
    @GetMapping("/{folderId}")
    public ResponseEntity<?> getFolderWithContents(
            @PathVariable Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Getting folder {} with contents for user {}", folderId, user.getUsername());
            Optional<StudyFolderDTO> folderOpt = studyFolderService.getFolderWithContents(folderId, user.getId());

            if (folderOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Folder not found");
            }

            return ResponseEntity.ok(folderOpt.get());
        } catch (Exception e) {
            logger.error("Error getting folder {} for user {}: {}", folderId, user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to get folder: " + e.getMessage());
        }
    }

    /**
     * Get folder hierarchy (breadcrumbs) for navigation
     */
    @GetMapping("/{folderId}/hierarchy")
    public ResponseEntity<?> getFolderHierarchy(
            @PathVariable Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Getting folder hierarchy for folder {} and user {}", folderId, user.getUsername());
            List<StudyFolderDTO> hierarchy = studyFolderService.getFolderHierarchy(folderId, user.getId());
            return ResponseEntity.ok(hierarchy);
        } catch (Exception e) {
            logger.error("Error getting folder hierarchy for folder {} and user {}: {}", folderId, user.getUsername(),
                    e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to get folder hierarchy: " + e.getMessage());
        }
    }

    /**
     * Create a new folder
     */
    @PostMapping
    public ResponseEntity<?> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Creating folder '{}' for user {}", request.getName(), user.getUsername());
            StudyFolderDTO folder = studyFolderService.createFolder(request, user.getId());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            logger.error("Error creating folder for user {}: {}", user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(400).body("Failed to create folder: " + e.getMessage());
        }
    }

    /**
     * Update folder
     */
    @PutMapping("/{folderId}")
    public ResponseEntity<?> updateFolder(
            @PathVariable Long folderId,
            @Valid @RequestBody UpdateFolderRequest request,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Updating folder {} for user {}", folderId, user.getUsername());
            StudyFolderDTO folder = studyFolderService.updateFolder(folderId, request, user.getId());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            logger.error("Error updating folder {} for user {}: {}", folderId, user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(400).body("Failed to update folder: " + e.getMessage());
        }
    }

    /**
     * Delete folder and all its contents
     */
    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Deleting folder {} for user {}", folderId, user.getUsername());
            studyFolderService.deleteFolder(folderId, user.getId());
            return ResponseEntity.ok().body("Folder deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting folder {} for user {}: {}", folderId, user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(400).body("Failed to delete folder: " + e.getMessage());
        }
    }

    /**
     * Move study material to folder
     */
    @PutMapping("/materials/{materialId}/move")
    public ResponseEntity<?> moveMaterialToFolder(
            @PathVariable Long materialId,
            @RequestParam(required = false) Long folderId,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Moving material {} to folder {} for user {}", materialId, folderId, user.getUsername());
            studyFolderService.moveMaterialToFolder(materialId, folderId, user.getId());
            return ResponseEntity.ok().body("Material moved successfully");
        } catch (Exception e) {
            logger.error("Error moving material {} to folder {} for user {}: {}", materialId, folderId,
                    user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(400).body("Failed to move material: " + e.getMessage());
        }
    }

    /**
     * Search folders by name
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchFolders(
            @RequestParam String q,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Searching folders for term '{}' for user {}", q, user.getUsername());
            List<StudyFolderDTO> folders = studyFolderService.searchFolders(q, user.getId());
            return ResponseEntity.ok(folders);
        } catch (Exception e) {
            logger.error("Error searching folders for user {}: {}", user.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to search folders: " + e.getMessage());
        }
    }
}
