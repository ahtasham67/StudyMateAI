package com.studymate.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.CreateQuizRequest;
import com.studymate.backend.dto.QuizResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.QuizService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/quizzes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal User user) {
        try {
            QuizResponse quiz = quizService.createQuiz(request, user);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate quiz: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> getUserQuizzes(
            @AuthenticationPrincipal User user) {
        try {
            List<QuizResponse> quizzes = quizService.getUserQuizzes(user);
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            QuizResponse quiz = quizService.getQuizById(id, user);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            quizService.deleteQuiz(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Quiz not found: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<QuizResponse>> searchQuizzes(
            @RequestParam String q,
            @AuthenticationPrincipal User user) {
        try {
            List<QuizResponse> quizzes = quizService.searchQuizzes(q, user);
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
