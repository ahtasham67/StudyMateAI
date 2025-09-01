package com.studymate.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-discussions")
@CrossOrigin(origins = "http://localhost:3000")
public class TestDiscussionController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Discussion controller is working!");
    }

    @GetMapping("/courses")
    public ResponseEntity<String> getCourses() {
        return ResponseEntity.ok("Courses endpoint working");
    }

    @GetMapping("/threads")
    public ResponseEntity<String> getThreads() {
        return ResponseEntity.ok("Threads endpoint working");
    }
}
