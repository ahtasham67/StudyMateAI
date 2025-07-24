package com.studymate.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.StudyMaterial;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {

    List<StudyMaterial> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<StudyMaterial> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT sm FROM StudyMaterial sm WHERE sm.userId = :userId AND " +
            "(LOWER(sm.fileName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(sm.originalName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(sm.subject) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(sm.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<StudyMaterial> searchByUserIdAndQuery(@Param("userId") Long userId, @Param("query") String query);

    List<StudyMaterial> findByUserIdAndSubjectContainingIgnoreCase(Long userId, String subject);

    List<StudyMaterial> findByUserIdAndFileType(Long userId, StudyMaterial.FileType fileType);

    long countByUserId(Long userId);
}
