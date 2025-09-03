package com.studymate.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.StudyFolder;

@Repository
public interface StudyFolderRepository extends JpaRepository<StudyFolder, Long> {

    // Find all root folders (no parent) for a user
    List<StudyFolder> findByUserIdAndParentFolderIsNull(Long userId);

    // Find all folders for a user
    List<StudyFolder> findByUserId(Long userId);

    // Find subfolders of a parent folder
    List<StudyFolder> findByParentFolderId(Long parentFolderId);

    // Find folder by name and user (for duplicate checking)
    List<StudyFolder> findByNameAndUserId(String name, Long userId);

    // Find folder by name and parent folder (for duplicate checking in same
    // directory)
    List<StudyFolder> findByNameAndParentFolderIdAndUserId(String name, Long parentFolderId, Long userId);

    // Find folder by name in root directory (for duplicate checking)
    List<StudyFolder> findByNameAndParentFolderIsNullAndUserId(String name, Long userId);

    // Get folder hierarchy (folder and all its ancestors)
    @Query("SELECT f FROM StudyFolder f WHERE f.id = :folderId AND f.userId = :userId")
    Optional<StudyFolder> findByIdAndUserId(@Param("folderId") Long folderId, @Param("userId") Long userId);

    // Get folder with its materials and subfolders
    @Query("SELECT DISTINCT f FROM StudyFolder f " +
            "LEFT JOIN FETCH f.studyMaterials " +
            "LEFT JOIN FETCH f.subFolders " +
            "WHERE f.id = :folderId AND f.userId = :userId")
    Optional<StudyFolder> findByIdWithContentsAndUserId(@Param("folderId") Long folderId, @Param("userId") Long userId);

    // Search folders by name (case-insensitive)
    @Query("SELECT f FROM StudyFolder f WHERE f.userId = :userId AND LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<StudyFolder> searchByName(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);

    // Check if folder name exists in the same directory level
    @Query("SELECT COUNT(f) > 0 FROM StudyFolder f WHERE f.name = :name AND f.parentFolder.id = :parentFolderId AND f.userId = :userId AND f.id != :excludeId")
    boolean existsByNameInSameDirectory(@Param("name") String name, @Param("parentFolderId") Long parentFolderId,
            @Param("userId") Long userId, @Param("excludeId") Long excludeId);

    // Check if folder name exists in root directory
    @Query("SELECT COUNT(f) > 0 FROM StudyFolder f WHERE f.name = :name AND f.parentFolder IS NULL AND f.userId = :userId AND f.id != :excludeId")
    boolean existsByNameInRootDirectory(@Param("name") String name, @Param("userId") Long userId,
            @Param("excludeId") Long excludeId);

    // Get all folder IDs in a hierarchy (for deletion cascading)
    @Query(value = "WITH RECURSIVE folder_hierarchy AS (" +
            "  SELECT id FROM study_folders WHERE id = :folderId " +
            "  UNION ALL " +
            "  SELECT sf.id FROM study_folders sf " +
            "  INNER JOIN folder_hierarchy fh ON sf.parent_folder_id = fh.id" +
            ") SELECT id FROM folder_hierarchy", nativeQuery = true)
    List<Long> findAllSubfolderIds(@Param("folderId") Long folderId);
}
