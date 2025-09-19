package com.studymate.backend.controller;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.CreateReplyRequest;
import com.studymate.backend.dto.CreateThreadRequest;
import com.studymate.backend.dto.ReplyResponse;
import com.studymate.backend.dto.ThreadResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.DiscussionThreadService;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/discussions")
@CrossOrigin(origins = "http://localhost:3000")
public class DiscussionThreadController {

    @Autowired
    private DiscussionThreadService discussionThreadService;

    @PostConstruct
    public void init() {
        System.out.println("DiscussionThreadController initialized successfully!");
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("DiscussionThreadController is working!");
    }

    // Thread endpoints
    @PostMapping("/threads")
    public ResponseEntity<Map<String, Object>> createThread(
            @Valid @RequestBody CreateThreadRequest request,
            @AuthenticationPrincipal User user) {
        try {
            ThreadResponse thread = discussionThreadService.createThread(request, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "thread", thread));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads")
    public ResponseEntity<Map<String, Object>> getAllThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastActivityAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            var result = discussionThreadService.getAllThreads(page, size, sortBy, sortDirection);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getAllCourses() {
        try {
            List<String> courses = discussionThreadService.getAllCourses();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "courses", courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/courses/{course}/topics")
    public ResponseEntity<Map<String, Object>> getTopicsByCourse(@PathVariable String course) {
        try {
            List<String> topics = discussionThreadService.getTopicsByCourse(course);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "topics", topics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/{id}")
    public ResponseEntity<Map<String, Object>> getThreadById(@PathVariable Long id) {
        try {
            Optional<ThreadResponse> thread = discussionThreadService.getThreadById(id);
            if (thread.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "thread", thread.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Map<String, Object>> deleteThread(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            boolean deleted = discussionThreadService.deleteThread(id, user);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Thread deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/search")
    public ResponseEntity<Map<String, Object>> searchThreads(
            @RequestParam String q,
            @RequestParam(required = false) String course,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = course != null
                    ? discussionThreadService.searchThreadsByCourse(course, q, page, size)
                    : discussionThreadService.searchThreads(q, page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/search/enhanced")
    public ResponseEntity<Map<String, Object>> searchThreadsWithReplies(
            @RequestParam String q,
            @RequestParam(required = false) String course,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = course != null
                    ? discussionThreadService.searchThreadsByCourseWithKnowledge(course, q, page, size)
                    : discussionThreadService.searchThreadsWithKnowledge(q, page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber(),
                    "searchType", "enhanced"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/course/{course}")
    public ResponseEntity<Map<String, Object>> getThreadsByCourse(
            @PathVariable String course,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = discussionThreadService.getThreadsByCourse(course, page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/topic/{topic}")
    public ResponseEntity<Map<String, Object>> getThreadsByTopic(
            @PathVariable String topic,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = discussionThreadService.getThreadsByTopic(topic, page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/course/{course}/topic/{topic}")
    public ResponseEntity<Map<String, Object>> getThreadsByCourseAndTopic(
            @PathVariable String course,
            @PathVariable String topic,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = discussionThreadService.getThreadsByCourseAndTopic(course, topic, page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    // Reply endpoints
    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<Map<String, Object>> createReply(
            @PathVariable Long threadId,
            @Valid @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User user) {
        try {
            ReplyResponse reply = discussionThreadService.createReply(threadId, request, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "reply", reply));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<Map<String, Object>> getRepliesByThread(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        try {
            var result = discussionThreadService.getRepliesByThread(threadId, page, size, currentUser);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "content", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @DeleteMapping("/replies/{id}")
    public ResponseEntity<Map<String, Object>> deleteReply(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            boolean deleted = discussionThreadService.deleteReply(id, user);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Reply deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    // Moderation endpoints (Admin only)
    @PostMapping("/threads/{id}/pin")
    public ResponseEntity<Map<String, Object>> pinThread(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            boolean pinned = discussionThreadService.pinThread(id, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", pinned ? "Thread pinned successfully" : "Thread unpinned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @PostMapping("/threads/{id}/lock")
    public ResponseEntity<Map<String, Object>> lockThread(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            boolean locked = discussionThreadService.lockThread(id, user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", locked ? "Thread locked successfully" : "Thread unlocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/pinned")
    public ResponseEntity<Map<String, Object>> getPinnedThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            var result = discussionThreadService.getPinnedThreads(page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }

    @GetMapping("/threads/recent")
    public ResponseEntity<Map<String, Object>> getRecentActivityThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            var result = discussionThreadService.getRecentActivityThreads(page, size);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "threads", result.getContent(),
                    "totalElements", result.getTotalElements(),
                    "totalPages", result.getTotalPages(),
                    "currentPage", result.getNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
