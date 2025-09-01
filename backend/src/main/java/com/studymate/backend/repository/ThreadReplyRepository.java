package com.studymate.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.DiscussionThread;
import com.studymate.backend.model.ThreadReply;
import com.studymate.backend.model.User;

@Repository
public interface ThreadReplyRepository extends JpaRepository<ThreadReply, Long> {

    // Find replies by thread
    Page<ThreadReply> findByThreadAndIsDeletedFalseOrderByCreatedAtAsc(DiscussionThread thread, Pageable pageable);

    // Find replies by author
    Page<ThreadReply> findByAuthorAndIsDeletedFalseOrderByCreatedAtDesc(User author, Pageable pageable);

    // Find child replies for a parent reply
    List<ThreadReply> findByParentReplyAndIsDeletedFalseOrderByCreatedAtAsc(ThreadReply parentReply);

    // Count replies for a thread
    long countByThreadAndIsDeletedFalse(DiscussionThread thread);

    // Find replies that need moderation
    Page<ThreadReply> findByIsModeratedTrueAndIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    // Search replies by content
    @Query("SELECT r FROM ThreadReply r WHERE " +
            "LOWER(r.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND " +
            "r.isDeleted = false AND r.isModerated = false " +
            "ORDER BY r.createdAt DESC")
    Page<ThreadReply> searchReplies(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Find recent replies for a user's threads
    @Query("SELECT r FROM ThreadReply r WHERE " +
            "r.thread.author = :user AND " +
            "r.author != :user AND " +
            "r.isDeleted = false AND r.isModerated = false " +
            "ORDER BY r.createdAt DESC")
    Page<ThreadReply> findRepliesOnUserThreads(@Param("user") User user, Pageable pageable);

    // Find all replies for a thread (used for cascading deletes)
    List<ThreadReply> findByThread(DiscussionThread thread);
}
