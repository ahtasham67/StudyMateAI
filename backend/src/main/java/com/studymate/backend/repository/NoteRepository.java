package com.studymate.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.Note;
import com.studymate.backend.model.User;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByUpdatedAtDesc(User user);

    List<Note> findByUserAndSubjectOrderByUpdatedAtDesc(User user, String subject);

    List<Note> findByUserAndCategoryOrderByUpdatedAtDesc(User user, String category);

    @Query("SELECT n FROM Note n WHERE n.user = :user AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Note> searchByKeyword(@Param("user") User user, @Param("keyword") String keyword);

    @Query("SELECT DISTINCT n.subject FROM Note n WHERE n.user = :user ORDER BY n.subject")
    List<String> findDistinctSubjectsByUser(@Param("user") User user);

    @Query("SELECT DISTINCT n.category FROM Note n WHERE n.user = :user AND n.category IS NOT NULL ORDER BY n.category")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);
}
