package com.studymate.backend.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.ReplyResponse;
import com.studymate.backend.dto.ThreadResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.DiscussionWebSocketService;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WebSocketTestController {

    @Autowired
    private DiscussionWebSocketService webSocketService;

    // Test endpoint to manually trigger WebSocket events
    @PostMapping("/websocket/thread-created")
    public ResponseEntity<Map<String, Object>> testThreadCreated(
            @AuthenticationPrincipal User user) {
        try {
            // Create fake thread for testing
            ThreadResponse fakeThread = new ThreadResponse();
            fakeThread.setId(999999L);
            fakeThread.setTitle("Test Thread - WebSocket Verification");
            fakeThread.setContent("This is a test thread to verify WebSocket functionality");
            fakeThread.setCourse("TEST-101");
            fakeThread.setTopic("WebSocket Testing");
            fakeThread.setAuthorName(user.getUsername());
            fakeThread.setReplyCount(0);
            fakeThread.setViewCount(1);
            fakeThread.setIsPinned(false);
            fakeThread.setIsLocked(false);
            fakeThread.setCreatedAt(LocalDateTime.now());

            // Broadcast the test event
            webSocketService.broadcastThreadCreated(fakeThread);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test THREAD_CREATED event broadcasted",
                    "threadId", fakeThread.getId(),
                    "title", fakeThread.getTitle()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/websocket/reply-created")
    public ResponseEntity<Map<String, Object>> testReplyCreated(
            @RequestParam Long threadId,
            @AuthenticationPrincipal User user) {
        try {
            // Create fake reply for testing
            ReplyResponse fakeReply = new ReplyResponse();
            fakeReply.setId(999999L);
            fakeReply.setContent("This is a test reply to verify WebSocket functionality");
            fakeReply.setAuthorName(user.getUsername());
            fakeReply.setCreatedAt(LocalDateTime.now());

            // Broadcast the test event
            webSocketService.broadcastReplyCreated(threadId, fakeReply);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test REPLY_CREATED event broadcasted for thread " + threadId,
                    "replyId", fakeReply.getId(),
                    "threadId", threadId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/websocket/thread-deleted")
    public ResponseEntity<Map<String, Object>> testThreadDeleted(
            @RequestParam Long threadId,
            @AuthenticationPrincipal User user) {
        try {
            // Broadcast the test event
            webSocketService.broadcastThreadDeleted(threadId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test THREAD_DELETED event broadcasted for thread " + threadId,
                    "threadId", threadId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/websocket/status")
    public ResponseEntity<Map<String, Object>> getWebSocketStatus() {
        try {
            // Return basic WebSocket service status
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "WebSocket service is active",
                    "service", "DiscussionWebSocketService",
                    "timestamp", java.time.LocalDateTime.now().toString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
