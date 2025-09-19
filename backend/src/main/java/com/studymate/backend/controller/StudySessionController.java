package com.studymate.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.model.StudySession;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudySessionRepository;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    @Autowired
    private StudySessionRepository studySessionRepository;

    @GetMapping
    public ResponseEntity<List<StudySession>> getAllStudySessions(@AuthenticationPrincipal User user) {
        List<StudySession> sessions = studySessionRepository.findByUserOrderByStartTimeDesc(user);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudySession> getStudySessionById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<StudySession> session = studySessionRepository.findById(id);
        if (session.isPresent() && session.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.ok(session.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<StudySession> createStudySession(@Valid @RequestBody StudySession studySession,
            @AuthenticationPrincipal User user) {
        studySession.setUser(user);
        if (studySession.getStartTime() == null) {
            studySession.setStartTime(LocalDateTime.now());
        }
        StudySession savedSession = studySessionRepository.save(studySession);
        return ResponseEntity.ok(savedSession);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudySession> updateStudySession(@PathVariable Long id,
            @Valid @RequestBody StudySession studySessionDetails,
            @AuthenticationPrincipal User user) {
        Optional<StudySession> optionalSession = studySessionRepository.findById(id);
        if (optionalSession.isPresent() && optionalSession.get().getUser().getId().equals(user.getId())) {
            StudySession session = optionalSession.get();
            session.setTitle(studySessionDetails.getTitle());
            session.setDescription(studySessionDetails.getDescription());
            session.setSubject(studySessionDetails.getSubject());
            session.setStartTime(studySessionDetails.getStartTime());
            session.setEndTime(studySessionDetails.getEndTime());
            session.setStatus(studySessionDetails.getStatus());
            session.setUpdatedAt(LocalDateTime.now());

            StudySession updatedSession = studySessionRepository.save(session);
            return ResponseEntity.ok(updatedSession);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudySession(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<StudySession> session = studySessionRepository.findById(id);
        if (session.isPresent() && session.get().getUser().getId().equals(user.getId())) {
            studySessionRepository.delete(session.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<StudySession> endStudySession(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Optional<StudySession> optionalSession = studySessionRepository.findById(id);
        if (optionalSession.isPresent() && optionalSession.get().getUser().getId().equals(user.getId())) {
            StudySession session = optionalSession.get();

            // Only end if session is currently active (no end time set)
            if (session.getEndTime() == null) {
                session.setEndTime(LocalDateTime.now());
                session.setStatus(StudySession.Status.COMPLETED);
                session.setUpdatedAt(LocalDateTime.now());

                // Calculate duration in minutes
                if (session.getStartTime() != null) {
                    long durationMinutes = java.time.Duration.between(session.getStartTime(), session.getEndTime())
                            .toMinutes();
                    session.setDurationMinutes((int) durationMinutes);
                }

                StudySession updatedSession = studySessionRepository.save(session);
                return ResponseEntity.ok(updatedSession);
            } else {
                // Session already ended
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<StudySession>> getStudySessionsBySubject(@PathVariable String subject,
            @AuthenticationPrincipal User user) {
        List<StudySession> sessions = studySessionRepository.findByUserAndSubjectOrderByStartTimeDesc(user, subject);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStudyStats(@AuthenticationPrincipal User user) {
        Long completedSessionsCount = studySessionRepository.countCompletedSessionsByUser(user);
        Long totalStudyTimeMinutes = studySessionRepository.getTotalStudyTimeByUser(user);

        Map<String, Long> stats = new HashMap<>();
        stats.put("completedSessions", completedSessionsCount != null ? completedSessionsCount : 0);
        stats.put("totalStudyTime", totalStudyTimeMinutes != null ? totalStudyTimeMinutes : 0);

        return ResponseEntity.ok(stats);
    }
}
