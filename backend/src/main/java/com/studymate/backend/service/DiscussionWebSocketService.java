package com.studymate.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.studymate.backend.dto.ReplyResponse;
import com.studymate.backend.dto.ThreadResponse;

@Service
public class DiscussionWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Event types
    public static final String THREAD_CREATED = "thread_created";
    public static final String THREAD_UPDATED = "thread_updated";
    public static final String THREAD_DELETED = "thread_deleted";
    public static final String REPLY_CREATED = "reply_created";
    public static final String REPLY_UPDATED = "reply_updated";
    public static final String REPLY_DELETED = "reply_deleted";
    public static final String THREAD_PINNED = "thread_pinned";
    public static final String THREAD_LOCKED = "thread_locked";

    /**
     * Broadcast thread creation to all users
     */
    public void broadcastThreadCreated(ThreadResponse thread) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", THREAD_CREATED);
        message.put("payload", thread);

        System.out.println("🚀 Broadcasting thread creation: " + thread.getTitle());
        System.out.println("📨 Message: " + message);
        messagingTemplate.convertAndSend("/topic/discussions", message);
        System.out.println("✅ Thread creation broadcast sent");
    }

    /**
     * Broadcast thread update to all users
     */
    public void broadcastThreadUpdated(ThreadResponse thread) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", THREAD_UPDATED);
        message.put("payload", thread);

        messagingTemplate.convertAndSend("/topic/discussions", message);
    }

    /**
     * Broadcast thread deletion to all users
     */
    public void broadcastThreadDeleted(Long threadId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", THREAD_DELETED);
        message.put("payload", Map.of("threadId", threadId));

        messagingTemplate.convertAndSend("/topic/discussions", message);
    }

    /**
     * Broadcast reply creation to all users following the thread
     */
    public void broadcastReplyCreated(Long threadId, ReplyResponse reply) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", REPLY_CREATED);
        message.put("payload", Map.of(
                "threadId", threadId,
                "reply", reply,
                "createdAt", reply.getCreatedAt()));

        System.out.println("🚀 Broadcasting reply creation for thread: " + threadId);
        System.out.println("📨 Reply content: " + reply.getContent());

        // Broadcast to all discussion listeners
        messagingTemplate.convertAndSend("/topic/discussions", message);

        // Also broadcast to specific thread listeners
        messagingTemplate.convertAndSend("/topic/discussions/thread/" + threadId, message);
        System.out.println("✅ Reply creation broadcast sent");
    }

    /**
     * Broadcast reply update to thread followers
     */
    public void broadcastReplyUpdated(Long threadId, ReplyResponse reply) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", REPLY_UPDATED);
        message.put("payload", Map.of(
                "threadId", threadId,
                "reply", reply));

        messagingTemplate.convertAndSend("/topic/discussions/thread/" + threadId, message);
    }

    /**
     * Broadcast reply deletion to thread followers
     */
    public void broadcastReplyDeleted(Long threadId, Long replyId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", REPLY_DELETED);
        message.put("payload", Map.of(
                "threadId", threadId,
                "replyId", replyId));

        messagingTemplate.convertAndSend("/topic/discussions/thread/" + threadId, message);
    }

    /**
     * Broadcast thread pin/unpin to all users
     */
    public void broadcastThreadPinned(ThreadResponse thread) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", THREAD_PINNED);
        message.put("payload", thread);

        messagingTemplate.convertAndSend("/topic/discussions", message);
    }

    /**
     * Broadcast thread lock/unlock to all users
     */
    public void broadcastThreadLocked(ThreadResponse thread) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", THREAD_LOCKED);
        message.put("payload", thread);

        messagingTemplate.convertAndSend("/topic/discussions", message);
    }

    /**
     * Send notification to specific user
     */
    public void sendNotificationToUser(String username, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", message);
    }
}
