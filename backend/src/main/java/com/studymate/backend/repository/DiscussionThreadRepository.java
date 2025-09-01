package com.studymate.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.DiscussionThread;
import com.studymate.backend.model.User;

@Repository
public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {

    // Find threads by course
    Page<DiscussionThread> findByCourseOrderByLastActivityAtDesc(String course, Pageable pageable);

    // Find threads by topic
    Page<DiscussionThread> findByTopicOrderByLastActivityAtDesc(String topic, Pageable pageable);

    // Find threads by course and topic
    Page<DiscussionThread> findByCourseAndTopicOrderByLastActivityAtDesc(String course, String topic,
            Pageable pageable);

    // Find threads by author
    Page<DiscussionThread> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    // Search threads by title or content
    @Query("SELECT t FROM DiscussionThread t WHERE " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "t.isModerated = false " +
            "ORDER BY t.lastActivityAt DESC")
    Page<DiscussionThread> searchThreads(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Enhanced search including replies
    @Query("SELECT DISTINCT t FROM DiscussionThread t LEFT JOIN t.replies r WHERE " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(r.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "t.isModerated = false AND " +
            "(r.isDeleted = false OR r IS NULL) AND " +
            "(r.isModerated = false OR r IS NULL) " +
            "ORDER BY t.lastActivityAt DESC")
    Page<DiscussionThread> searchThreadsWithReplies(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Knowledge graph enhanced search
    @Query("SELECT DISTINCT t FROM DiscussionThread t LEFT JOIN t.replies r LEFT JOIN t.knowledgeEntities ke WHERE " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(r.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(ke.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "t.isModerated = false AND " +
            "(r.isDeleted = false OR r IS NULL) AND " +
            "(r.isModerated = false OR r IS NULL) " +
            "ORDER BY CASE WHEN LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 1 " +
            "WHEN LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 2 " +
            "WHEN LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 3 " +
            "ELSE 4 END, t.lastActivityAt DESC")
    Page<DiscussionThread> searchThreadsWithKnowledge(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Search threads by course and search term
    @Query("SELECT t FROM DiscussionThread t WHERE " +
            "t.course = :course AND " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "t.isModerated = false " +
            "ORDER BY t.lastActivityAt DESC")
    Page<DiscussionThread> searchThreadsByCourse(@Param("course") String course,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    // Enhanced search by course including replies and knowledge
    @Query("SELECT DISTINCT t FROM DiscussionThread t LEFT JOIN t.replies r LEFT JOIN t.knowledgeEntities ke WHERE " +
            "t.course = :course AND " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(r.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(ke.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "t.isModerated = false AND " +
            "(r.isDeleted = false OR r IS NULL) AND " +
            "(r.isModerated = false OR r IS NULL) " +
            "ORDER BY CASE WHEN LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 1 " +
            "WHEN LOWER(ke.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 2 " +
            "WHEN LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) THEN 3 " +
            "ELSE 4 END, t.lastActivityAt DESC")
    Page<DiscussionThread> searchThreadsByCourseWithKnowledge(@Param("course") String course,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    // Find pinned threads
    Page<DiscussionThread> findByIsPinnedTrueOrderByCreatedAtDesc(Pageable pageable);

    // Find pinned threads by course
    Page<DiscussionThread> findByCourseAndIsPinnedTrueOrderByCreatedAtDesc(String course, Pageable pageable);

    // Get all unique courses
    @Query("SELECT DISTINCT t.course FROM DiscussionThread t ORDER BY t.course")
    List<String> findAllUniqueCourses();

    // Get all unique topics for a course
    @Query("SELECT DISTINCT t.topic FROM DiscussionThread t WHERE t.course = :course ORDER BY t.topic")
    List<String> findUniqueTopicsByCourse(@Param("course") String course);

    // Find threads that need moderation
    Page<DiscussionThread> findByIsModeratedTrueOrderByCreatedAtDesc(Pageable pageable);

    // Get recent activity threads (for dashboard)
    @Query("SELECT t FROM DiscussionThread t WHERE t.isModerated = false ORDER BY t.lastActivityAt DESC")
    Page<DiscussionThread> findRecentActivityThreads(Pageable pageable);
}
