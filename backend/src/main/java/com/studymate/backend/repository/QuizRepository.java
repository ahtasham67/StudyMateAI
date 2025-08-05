package com.studymate.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.Quiz;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Quiz> findByStudyMaterialIdAndUserIdOrderByCreatedAtDesc(Long studyMaterialId, Long userId);

    Optional<Quiz> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.userId = :userId AND " +
            "(LOWER(q.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(q.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Quiz> findByUserIdAndSearchTerm(@Param("userId") Long userId,
            @Param("searchTerm") String searchTerm);

    Long countByUserId(Long userId);
}
