package com.studymate.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.dto.CreateFolderRequest;
import com.studymate.backend.dto.StudyFolderDTO;
import com.studymate.backend.dto.StudyMaterialDTO;
import com.studymate.backend.dto.UpdateFolderRequest;
import com.studymate.backend.model.StudyFolder;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.repository.StudyFolderRepository;
import com.studymate.backend.repository.StudyMaterialRepository;

@Service
@Transactional
public class StudyFolderService {

    private static final Logger logger = LoggerFactory.getLogger(StudyFolderService.class);

    @Autowired
    private StudyFolderRepository studyFolderRepository;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    /**
     * Get all root folders for a user
     */
    @Transactional(readOnly = true)
    public List<StudyFolderDTO> getRootFolders(Long userId) {
        logger.info("Getting root folders for user {}", userId);
        List<StudyFolder> folders = studyFolderRepository.findRootFoldersWithAssociations(userId);
        return folders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get folder by ID with contents
     */
    @Transactional(readOnly = true)
    public Optional<StudyFolderDTO> getFolderWithContents(Long folderId, Long userId) {
        logger.info("Getting folder {} with contents for user {}", folderId, userId);
        
        // Use the base query without fetching to avoid MultipleBagFetchException
        // The convertToDTOWithContents method will handle loading subfolders and materials separately
        Optional<StudyFolder> folderOpt = studyFolderRepository.findByIdWithContentsAndUserId(folderId, userId);
        return folderOpt.map(this::convertToDTOWithContents);
    }

    /**
     * Get folder hierarchy (breadcrumbs)
     */
    @Transactional(readOnly = true)
    public List<StudyFolderDTO> getFolderHierarchy(Long folderId, Long userId) {
        logger.info("Getting folder hierarchy for folder {} and user {}", folderId, userId);

        Optional<StudyFolder> folderOpt = studyFolderRepository.findByIdAndUserId(folderId, userId);
        if (folderOpt.isEmpty()) {
            return List.of();
        }

        List<StudyFolderDTO> hierarchy = new java.util.ArrayList<>();
        StudyFolder current = folderOpt.get();

        while (current != null) {
            hierarchy.add(0, convertToDTO(current)); // Add at beginning to maintain order
            current = current.getParentFolder();
        }

        return hierarchy;
    }

    /**
     * Create a new folder
     */
    public StudyFolderDTO createFolder(CreateFolderRequest request, Long userId) {
        logger.info("Creating folder '{}' for user {}", request.getName(), userId);

        // Validate parent folder if specified
        StudyFolder parentFolder = null;
        if (request.getParentFolderId() != null) {
            Optional<StudyFolder> parentOpt = studyFolderRepository.findByIdAndUserId(request.getParentFolderId(),
                    userId);
            if (parentOpt.isEmpty()) {
                throw new RuntimeException("Parent folder not found");
            }
            parentFolder = parentOpt.get();
        }

        // Check for duplicate names in the same directory
        boolean nameExists = false;
        if (parentFolder == null) {
            nameExists = studyFolderRepository.existsByNameInRootDirectory(request.getName(), userId, -1L);
        } else {
            nameExists = studyFolderRepository.existsByNameInSameDirectory(request.getName(), parentFolder.getId(),
                    userId, -1L);
        }

        if (nameExists) {
            throw new RuntimeException("A folder with this name already exists in the current directory");
        }

        // Create folder
        StudyFolder folder = new StudyFolder(
                request.getName(),
                request.getDescription(),
                request.getColor() != null ? request.getColor() : "#2196f3", // Default blue color
                userId,
                parentFolder);

        StudyFolder savedFolder = studyFolderRepository.save(folder);
        logger.info("Created folder with ID {}", savedFolder.getId());

        return convertToDTO(savedFolder);
    }

    /**
     * Update folder
     */
    public StudyFolderDTO updateFolder(Long folderId, UpdateFolderRequest request, Long userId) {
        logger.info("Updating folder {} for user {}", folderId, userId);

        Optional<StudyFolder> folderOpt = studyFolderRepository.findByIdAndUserId(folderId, userId);
        if (folderOpt.isEmpty()) {
            throw new RuntimeException("Folder not found");
        }

        StudyFolder folder = folderOpt.get();

        // Get current parent folder ID safely without triggering lazy loading
        Long currentParentFolderId = studyFolderRepository.getParentFolderId(folder.getId());

        // Validate parent folder if changed
        StudyFolder newParentFolder = null;
        if (request.getParentFolderId() != null) {
            if (!request.getParentFolderId().equals(currentParentFolderId)) {
                Optional<StudyFolder> parentOpt = studyFolderRepository.findByIdAndUserId(request.getParentFolderId(),
                        userId);
                if (parentOpt.isEmpty()) {
                    throw new RuntimeException("Parent folder not found");
                }
                newParentFolder = parentOpt.get();

                // Check for circular reference
                if (wouldCreateCircularReference(folder, newParentFolder)) {
                    throw new RuntimeException("Cannot move folder: would create circular reference");
                }
            }
        }

        // Check for duplicate names if name or parent changed
        if (!folder.getName().equals(request.getName()) ||
                (request.getParentFolderId() != null && !request.getParentFolderId().equals(currentParentFolderId))) {

            boolean nameExists = false;
            if (request.getParentFolderId() == null) {
                nameExists = studyFolderRepository.existsByNameInRootDirectory(request.getName(), userId, folderId);
            } else {
                nameExists = studyFolderRepository.existsByNameInSameDirectory(request.getName(),
                        request.getParentFolderId(), userId, folderId);
            }

            if (nameExists) {
                throw new RuntimeException("A folder with this name already exists in the target directory");
            }
        }

        // Update folder properties
        folder.setName(request.getName());
        folder.setDescription(request.getDescription());
        folder.setColor(request.getColor());
        if (request.getParentFolderId() != null) {
            folder.setParentFolder(newParentFolder);
        }

        StudyFolder savedFolder = studyFolderRepository.save(folder);
        logger.info("Updated folder {}", savedFolder.getId());

        return convertToDTO(savedFolder);
    }

    /**
     * Delete folder and all its contents
     */
    public void deleteFolder(Long folderId, Long userId) {
        logger.info("Deleting folder {} for user {}", folderId, userId);

        Optional<StudyFolder> folderOpt = studyFolderRepository.findByIdAndUserId(folderId, userId);
        if (folderOpt.isEmpty()) {
            throw new RuntimeException("Folder not found");
        }

        StudyFolder folder = folderOpt.get();

        // Delete folder (cascading will handle subfolders and materials)
        studyFolderRepository.delete(folder);
        logger.info("Deleted folder {} and all its contents", folderId);
    }

    /**
     * Move study material to folder
     */
    public void moveMaterialToFolder(Long materialId, Long folderId, Long userId) {
        logger.info("Moving material {} to folder {} for user {}", materialId, folderId, userId);

        Optional<StudyMaterial> materialOpt = studyMaterialRepository.findByIdAndUserId(materialId, userId);
        if (materialOpt.isEmpty()) {
            throw new RuntimeException("Study material not found");
        }

        StudyFolder targetFolder = null;
        if (folderId != null) {
            Optional<StudyFolder> folderOpt = studyFolderRepository.findByIdAndUserId(folderId, userId);
            if (folderOpt.isEmpty()) {
                throw new RuntimeException("Target folder not found");
            }
            targetFolder = folderOpt.get();
        }

        StudyMaterial material = materialOpt.get();
        material.setFolder(targetFolder);
        studyMaterialRepository.save(material);

        logger.info("Moved material {} to folder {}", materialId, folderId);
    }

    /**
     * Search folders by name
     */
    public List<StudyFolderDTO> searchFolders(String searchTerm, Long userId) {
        logger.info("Searching folders for term '{}' for user {}", searchTerm, userId);
        List<StudyFolder> folders = studyFolderRepository.searchByName(userId, searchTerm);
        return folders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper methods

    private boolean wouldCreateCircularReference(StudyFolder folder, StudyFolder newParent) {
        Long currentId = newParent.getId();
        while (currentId != null) {
            if (currentId.equals(folder.getId())) {
                return true;
            }
            currentId = studyFolderRepository.getParentFolderId(currentId);
        }
        return false;
    }

    private StudyFolderDTO convertToDTO(StudyFolder folder) {
        StudyFolderDTO dto = new StudyFolderDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setDescription(folder.getDescription());
        dto.setColor(folder.getColor());

        // Completely avoid accessing parentFolder proxy - set to null for now
        dto.setParentFolderId(null);
        dto.setParentFolderName(null);
        dto.setFullPath(folder.getName()); // Just use folder name without full path

        // Use separate queries for counts to avoid lazy loading issues
        dto.setMaterialCount((int) studyMaterialRepository.countByFolderId(folder.getId()));
        dto.setSubFolderCount((int) studyFolderRepository.countByParentFolderId(folder.getId()));
        dto.setCreatedAt(folder.getCreatedAt());
        dto.setUpdatedAt(folder.getUpdatedAt());
        return dto;
    }

    private StudyFolderDTO convertToDTOWithContents(StudyFolder folder) {
        StudyFolderDTO dto = convertToDTO(folder);

        // Load subfolders separately to avoid lazy loading issues
        List<StudyFolder> subFolders = studyFolderRepository.findByParentFolderId(folder.getId());
        List<StudyFolderDTO> subFolderDTOs = subFolders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        dto.setSubFolders(subFolderDTOs);

        // Load study materials separately to avoid lazy loading issues
        List<StudyMaterial> materials = studyMaterialRepository.findByFolderIdOrderByCreatedAtDesc(folder.getId());
        List<StudyMaterialDTO> materialDTOs = materials.stream()
                .map(this::convertMaterialToDTO)
                .collect(Collectors.toList());
        dto.setStudyMaterials(materialDTOs);

        return dto;
    }

    private StudyMaterialDTO convertMaterialToDTO(StudyMaterial material) {
        StudyMaterialDTO dto = new StudyMaterialDTO();
        dto.setId(material.getId());
        dto.setFileName(material.getFileName());
        dto.setOriginalName(material.getOriginalName());
        dto.setFileType(material.getFileType().toString());
        dto.setFileSize(material.getFileSize());
        dto.setSubject(material.getSubject());
        dto.setDescription(material.getDescription());
        dto.setCategory(material.getCategory());
        dto.setFolderId(material.getFolder() != null ? material.getFolder().getId() : null);
        dto.setFolderName(material.getFolder() != null ? material.getFolder().getName() : null);
        dto.setFolderPath(material.getFolder() != null ? material.getFolder().getFullPath() : null);
        dto.setCreatedAt(material.getCreatedAt());
        dto.setUpdatedAt(material.getUpdatedAt());
        return dto;
    }
}
