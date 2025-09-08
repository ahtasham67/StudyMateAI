package com.studymate.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studymate.backend.model.StudySchedule;
import com.studymate.backend.model.User;

@Repository
public interface StudyScheduleRepository extends JpaRepository<StudySchedule, Long> {

    List<StudySchedule> findByUserOrderByStartTimeAsc(User user);

    List<StudySchedule> findByUserAndStartTimeBetweenOrderByStartTimeAsc(
            User user, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT s FROM StudySchedule s WHERE s.user = :user AND s.startTime >= :startDate AND s.endTime <= :endDate ORDER BY s.startTime ASC")
    List<StudySchedule> findSchedulesInDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM StudySchedule s WHERE s.user = :user AND s.status = 'SCHEDULED' AND s.startTime >= :now ORDER BY s.startTime ASC")
    List<StudySchedule> findUpcomingSchedules(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT s FROM StudySchedule s WHERE s.user = :user AND DATE(s.startTime) = DATE(:date) ORDER BY s.startTime ASC")
    List<StudySchedule> findSchedulesForDate(@Param("user") User user, @Param("date") LocalDateTime date);

    @Query("SELECT COUNT(s) FROM StudySchedule s WHERE s.user = :user AND s.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") StudySchedule.ScheduleStatus status);

    @Query("SELECT s FROM StudySchedule s WHERE s.user = :user AND s.isRecurring = true AND s.recurrenceEndDate > :now")
    List<StudySchedule> findActiveRecurringSchedules(@Param("user") User user, @Param("now") LocalDateTime now);
}
