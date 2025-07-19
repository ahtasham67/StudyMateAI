package com.studymate.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.StudySession;
import com.studymate.backend.model.User;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserOrderByStartTimeDesc(User user);

    List<StudySession> findByUserAndSubjectOrderByStartTimeDesc(User user, String subject);

    List<StudySession> findByUserAndStatusOrderByStartTimeDesc(User user, StudySession.Status status);

    @Query("SELECT s FROM StudySession s WHERE s.user = :user AND s.startTime BETWEEN :startDate AND :endDate ORDER BY s.startTime DESC")
    List<StudySession> findByUserAndDateRange(@Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.user = :user AND s.status = 'COMPLETED'")
    Long countCompletedSessionsByUser(@Param("user") User user);

    @Query("SELECT SUM(s.durationMinutes) FROM StudySession s WHERE s.user = :user AND s.status = 'COMPLETED'")
    Long getTotalStudyTimeByUser(@Param("user") User user);
}
