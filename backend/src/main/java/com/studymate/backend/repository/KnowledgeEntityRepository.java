package com.studymate.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.KnowledgeEntity;

@Repository
public interface KnowledgeEntityRepository extends JpaRepository<KnowledgeEntity, Long> {

        Optional<KnowledgeEntity> findByNameIgnoreCase(String name);

        // Batch query for performance optimization
        List<KnowledgeEntity> findByNameIgnoreCaseIn(List<String> names);

        List<KnowledgeEntity> findByEntityTypeIgnoreCase(String entityType);

        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "LEFT JOIN FETCH ke.relatedEntities " +
                        "LEFT JOIN FETCH ke.relatedThreads " +
                        "WHERE LOWER(ke.entityType) = LOWER(:entityType)")
        List<KnowledgeEntity> findByEntityTypeIgnoreCaseWithRelations(@Param("entityType") String entityType);

        @Query("SELECT ke FROM KnowledgeEntity ke WHERE LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
                        "OR LOWER(ke.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
        Page<KnowledgeEntity> searchEntities(@Param("searchTerm") String searchTerm, Pageable pageable);

        @Query("SELECT ke FROM KnowledgeEntity ke ORDER BY ke.frequencyCount DESC")
        Page<KnowledgeEntity> findMostFrequentEntities(Pageable pageable);

        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "LEFT JOIN FETCH ke.relatedEntities " +
                        "LEFT JOIN FETCH ke.relatedThreads " +
                        "WHERE LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
                        "OR LOWER(ke.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
        Page<KnowledgeEntity> searchEntitiesWithRelations(@Param("searchTerm") String searchTerm, Pageable pageable);

        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "LEFT JOIN FETCH ke.relatedEntities " +
                        "LEFT JOIN FETCH ke.relatedThreads " +
                        "ORDER BY ke.frequencyCount DESC")
        Page<KnowledgeEntity> findMostFrequentEntitiesWithRelations(Pageable pageable);

        @Query("SELECT ke FROM KnowledgeEntity ke WHERE ke.confidenceScore >= :minConfidence ORDER BY ke.confidenceScore DESC")
        List<KnowledgeEntity> findByMinimumConfidence(@Param("minConfidence") Double minConfidence);

        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "JOIN ke.relatedEntities re " +
                        "WHERE re.id = :entityId")
        List<KnowledgeEntity> findRelatedEntities(@Param("entityId") Long entityId);

        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "LEFT JOIN FETCH ke.relatedEntities " +
                        "LEFT JOIN FETCH ke.relatedThreads " +
                        "JOIN ke.relatedEntities re " +
                        "WHERE re.id = :entityId")
        List<KnowledgeEntity> findRelatedEntitiesWithRelations(@Param("entityId") Long entityId);

        @Query("SELECT ke FROM KnowledgeEntity ke " +
                        "JOIN ke.relatedThreads rt " +
                        "WHERE rt.id = :threadId")
        List<KnowledgeEntity> findByThreadId(@Param("threadId") Long threadId);

        @Query("SELECT COUNT(rt) FROM KnowledgeEntity ke " +
                        "JOIN ke.relatedThreads rt " +
                        "WHERE ke.id = :entityId")
        Long countRelatedThreads(@Param("entityId") Long entityId);

        @Query("SELECT ke FROM KnowledgeEntity ke " +
                        "WHERE ke.entityType IN :entityTypes " +
                        "AND ke.confidenceScore >= :minConfidence " +
                        "ORDER BY ke.frequencyCount DESC")
        List<KnowledgeEntity> findByTypesAndConfidence(
                        @Param("entityTypes") List<String> entityTypes,
                        @Param("minConfidence") Double minConfidence);

        List<KnowledgeEntity> findByNameContainingIgnoreCase(String name);

        // Fetch entity with related entities to avoid LazyInitializationException
        @Query("SELECT DISTINCT ke FROM KnowledgeEntity ke " +
                        "LEFT JOIN FETCH ke.relatedEntities " +
                        "LEFT JOIN FETCH ke.relatedThreads " +
                        "WHERE ke.id = :entityId")
        Optional<KnowledgeEntity> findByIdWithRelations(@Param("entityId") Long entityId);
}
