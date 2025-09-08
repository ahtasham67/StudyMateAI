package com.studymate.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.CreateScheduleRequest;
import com.studymate.backend.dto.ScheduleResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.StudyScheduleService;

@RestController
@RequestMapping("/schedules")
@CrossOrigin(origins = "http://localhost:3000")
public class StudyScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(StudyScheduleController.class);

    @Autowired
    private StudyScheduleService studyScheduleService;

    // Get all schedules
    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getAllSchedules(@AuthenticationPrincipal User user) {
        try {
            logger.info("Getting all schedules for user: {}", user.getUsername());
            List<ScheduleResponse> schedules = studyScheduleService.getAllSchedules(user);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            logger.error("Error getting schedules: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get schedule by ID
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleResponse> getScheduleById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Getting schedule with id: {} for user: {}", id, user.getUsername());
            ScheduleResponse schedule = studyScheduleService.getScheduleById(id, user);
            if (schedule != null) {
                return ResponseEntity.ok(schedule);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting schedule: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create a new schedule
    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @RequestBody CreateScheduleRequest request,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Creating new schedule for user: {}", user.getUsername());
            ScheduleResponse schedule = studyScheduleService.createSchedule(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
        } catch (Exception e) {
            logger.error("Error creating schedule: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update an existing schedule
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @RequestBody CreateScheduleRequest request,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Updating schedule with id: {} for user: {}", id, user.getUsername());
            ScheduleResponse schedule = studyScheduleService.updateSchedule(id, request, user);
            if (schedule != null) {
                return ResponseEntity.ok(schedule);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating schedule: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a schedule
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Deleting schedule with id: {} for user: {}", id, user.getUsername());
            studyScheduleService.deleteSchedule(id, user);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting schedule: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get schedules by date range
    @GetMapping("/range")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @AuthenticationPrincipal User user) {
        try {
            logger.info("Getting schedules between {} and {} for user: {}", start, end, user.getUsername());
            List<ScheduleResponse> schedules = studyScheduleService.getSchedulesInRange(user, start, end);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            logger.error("Error getting schedules by date range: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get upcoming schedules (next 7 days)
    @GetMapping("/upcoming")
    public ResponseEntity<List<ScheduleResponse>> getUpcomingSchedules(@AuthenticationPrincipal User user) {
        try {
            logger.info("Getting upcoming schedules for user: {}", user.getUsername());
            List<ScheduleResponse> schedules = studyScheduleService.getUpcomingSchedules(user);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            logger.error("Error getting upcoming schedules: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get today's schedules
    @GetMapping("/today")
    public ResponseEntity<List<ScheduleResponse>> getTodaySchedules(@AuthenticationPrincipal User user) {
        try {
            logger.info("Getting today's schedules for user: {}", user.getUsername());
            LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            List<ScheduleResponse> schedules = studyScheduleService.getSchedulesForDate(user, today);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            logger.error("Error getting today's schedules: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get schedule statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getScheduleStats(@AuthenticationPrincipal User user) {
        try {
            logger.info("Getting schedule statistics for user: {}", user.getUsername());
            Map<String, Object> stats = new HashMap<>();

            // Get all schedules for stats calculation
            List<ScheduleResponse> allSchedules = studyScheduleService.getAllSchedules(user);
            List<ScheduleResponse> upcomingSchedules = studyScheduleService.getUpcomingSchedules(user);

            stats.put("totalSchedules", allSchedules.size());
            stats.put("upcomingSchedules", upcomingSchedules.size());

            // Count by type
            Map<String, Long> typeCount = new HashMap<>();
            for (ScheduleResponse schedule : allSchedules) {
                String type = schedule.getType().toString();
                typeCount.put(type, typeCount.getOrDefault(type, 0L) + 1);
            }
            stats.put("schedulesByType", typeCount);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting schedule stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
