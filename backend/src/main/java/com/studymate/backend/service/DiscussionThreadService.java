package com.studymate.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.dto.CreateReplyRequest;
import com.studymate.backend.dto.CreateThreadRequest;
import com.studymate.backend.dto.KnowledgeEntityResponse;
import com.studymate.backend.dto.ReplyResponse;
import com.studymate.backend.dto.ThreadResponse;
import com.studymate.backend.model.DiscussionThread;
import com.studymate.backend.model.KnowledgeEntity;
import com.studymate.backend.model.ThreadReply;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.DiscussionThreadRepository;
import com.studymate.backend.repository.ThreadReplyRepository;

@Service
@Transactional
public class DiscussionThreadService {

    @Autowired
    private DiscussionThreadRepository threadRepository;

    @Autowired
    private ThreadReplyRepository replyRepository;

    @Autowired
    private DiscussionWebSocketService webSocketService;

    @Autowired
    private KnowledgeGraphService knowledgeGraphService;

    // Thread Management
    public ThreadResponse createThread(CreateThreadRequest request, User author) {
        DiscussionThread thread = new DiscussionThread(
                request.getTitle(),
                request.getContent(),
                request.getCourse(),
                request.getTopic(),
                author);

        DiscussionThread savedThread = threadRepository.save(thread);

        // Process thread for knowledge graph
        knowledgeGraphService.processThreadForKnowledgeGraph(savedThread);
        savedThread = threadRepository.save(savedThread);

        ThreadResponse threadResponse = convertToThreadResponse(savedThread);

        // Broadcast thread creation to all users
        webSocketService.broadcastThreadCreated(threadResponse);

        return threadResponse;
    }

    public Page<ThreadResponse> getAllThreads(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return threadRepository.findAll(pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> getThreadsByCourse(String course, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByCourseOrderByLastActivityAtDesc(course, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> getThreadsByTopic(String topic, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByTopicOrderByLastActivityAtDesc(topic, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> getThreadsByCourseAndTopic(String course, String topic, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByCourseAndTopicOrderByLastActivityAtDesc(course, topic, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> searchThreads(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreads(searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> searchThreadsWithReplies(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsWithReplies(searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> searchThreadsWithKnowledge(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsWithKnowledge(searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> searchThreadsByCourse(String course, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsByCourse(course, searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> searchThreadsByCourseWithKnowledge(String course, String searchTerm, int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsByCourseWithKnowledge(course, searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    public Optional<ThreadResponse> getThreadById(Long threadId) {
        Optional<DiscussionThread> thread = threadRepository.findById(threadId);
        if (thread.isPresent()) {
            // Increment view count
            DiscussionThread foundThread = thread.get();
            foundThread.incrementViewCount();
            threadRepository.save(foundThread);
            return Optional.of(convertToThreadResponse(foundThread));
        }
        return Optional.empty();
    }

    public List<String> getAllCourses() {
        return threadRepository.findAllUniqueCourses();
    }

    public List<String> getTopicsByCourse(String course) {
        return threadRepository.findUniqueTopicsByCourse(course);
    }

    public Page<ThreadResponse> getPinnedThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByIsPinnedTrueOrderByCreatedAtDesc(pageable)
                .map(this::convertToThreadResponse);
    }

    public Page<ThreadResponse> getRecentActivityThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findRecentActivityThreads(pageable)
                .map(this::convertToThreadResponse);
    }

    // Reply Management
    public ReplyResponse createReply(Long threadId, CreateReplyRequest request, User author) {
        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            throw new RuntimeException("Thread not found");
        }

        DiscussionThread thread = threadOpt.get();
        if (thread.getIsLocked()) {
            throw new RuntimeException("Thread is locked");
        }

        ThreadReply parentReply = null;
        if (request.getParentReplyId() != null) {
            Optional<ThreadReply> parentOpt = replyRepository.findById(request.getParentReplyId());
            if (parentOpt.isEmpty()) {
                throw new RuntimeException("Parent reply not found");
            }
            parentReply = parentOpt.get();
        }

        ThreadReply reply = new ThreadReply(request.getContent(), thread, author, parentReply);
        ThreadReply savedReply = replyRepository.save(reply);

        // Update thread reply count and last activity
        thread.incrementReplyCount();

        // Process the new reply for knowledge graph extraction
        knowledgeGraphService.processReplyForKnowledgeGraph(thread, request.getContent());

        // Save the updated thread with new knowledge entities
        threadRepository.save(thread);

        ReplyResponse replyResponse = convertToReplyResponse(savedReply);

        // Broadcast reply creation to all users
        webSocketService.broadcastReplyCreated(threadId, replyResponse);

        return replyResponse;
    }

    public Page<ReplyResponse> getRepliesByThread(Long threadId, int page, int size) {
        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            throw new RuntimeException("Thread not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        return replyRepository.findByThreadAndIsDeletedFalseOrderByCreatedAtAsc(threadOpt.get(), pageable)
                .map(this::convertToReplyResponse);
    }

    public boolean deleteThread(Long threadId, User user) {
        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            return false;
        }

        DiscussionThread thread = threadOpt.get();

        // Only thread owner or admin can delete
        if (!thread.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this thread");
        }

        // First, get count of replies that will be deleted
        long replyCount = replyRepository.countByThreadAndIsDeletedFalse(thread);
        System.out.println(
                "Deleting thread " + threadId + " with " + replyCount + " replies by user " + user.getUsername());

        // The cascade delete will automatically handle all replies
        // when we delete the thread due to CascadeType.ALL configuration
        threadRepository.delete(thread);

        System.out.println("Thread " + threadId + " and all its " + replyCount + " replies have been deleted");

        // Broadcast thread deletion to all users
        webSocketService.broadcastThreadDeleted(threadId);

        return true;
    }

    public boolean deleteReply(Long replyId, User user) {
        Optional<ThreadReply> replyOpt = replyRepository.findById(replyId);
        if (replyOpt.isEmpty()) {
            return false;
        }

        ThreadReply reply = replyOpt.get();

        // Only reply owner or admin can delete
        if (!reply.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this reply");
        }

        reply.setIsDeleted(true);
        replyRepository.save(reply);

        // Update thread reply count
        DiscussionThread thread = reply.getThread();
        thread.decrementReplyCount();
        threadRepository.save(thread);

        System.out.println("Reply " + replyId + " marked as deleted by user " + user.getUsername());

        // Broadcast reply deletion to thread followers
        webSocketService.broadcastReplyDeleted(thread.getId(), replyId);

        return true;
    }

    // Moderation
    public boolean pinThread(Long threadId, User user) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to pin threads");
        }

        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            return false;
        }

        DiscussionThread thread = threadOpt.get();
        thread.setIsPinned(!thread.getIsPinned());
        DiscussionThread savedThread = threadRepository.save(thread);

        // Broadcast thread pin/unpin to all users
        webSocketService.broadcastThreadPinned(convertToThreadResponse(savedThread));

        return true;
    }

    public boolean lockThread(Long threadId, User user) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to lock threads");
        }

        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            return false;
        }

        DiscussionThread thread = threadOpt.get();
        thread.setIsLocked(!thread.getIsLocked());
        DiscussionThread savedThread = threadRepository.save(thread);

        // Broadcast thread lock/unlock to all users
        webSocketService.broadcastThreadLocked(convertToThreadResponse(savedThread));

        return true;
    }

    // Helper methods
    private ThreadResponse convertToThreadResponse(DiscussionThread thread) {
        String authorName = thread.getAuthor() != null ? thread.getAuthor().getUsername() : "Unknown";

        ThreadResponse response = new ThreadResponse(
                thread.getId(),
                thread.getTitle(),
                thread.getContent(),
                thread.getCourse(),
                thread.getTopic(),
                authorName,
                thread.getIsPinned(),
                thread.getIsLocked(),
                thread.getViewCount(),
                thread.getReplyCount(),
                thread.getCreatedAt(),
                thread.getLastActivityAt());

        // Add knowledge graph data
        response.setAiGeneratedSummary(thread.getAiGeneratedSummary());
        response.setKnowledgeScore(thread.getKnowledgeScore());

        // Convert knowledge entities to DTOs
        if (thread.getKnowledgeEntities() != null) {
            List<KnowledgeEntityResponse> entityResponses = thread.getKnowledgeEntities().stream()
                    .map(this::convertToKnowledgeEntityResponse)
                    .collect(Collectors.toList());
            response.setKnowledgeEntities(entityResponses);
        }

        return response;
    }

    private KnowledgeEntityResponse convertToKnowledgeEntityResponse(KnowledgeEntity entity) {
        KnowledgeEntityResponse response = new KnowledgeEntityResponse(
                entity.getId(),
                entity.getName(),
                entity.getEntityType(),
                entity.getDescription(),
                entity.getConfidenceScore(),
                entity.getFrequencyCount(),
                entity.getCreatedAt());

        // Add related entity names
        List<String> relatedNames = entity.getRelatedEntities().stream()
                .limit(5)
                .map(KnowledgeEntity::getName)
                .collect(Collectors.toList());
        response.setRelatedEntityNames(relatedNames);

        response.setRelatedThreadCount((long) entity.getRelatedThreads().size());

        return response;
    }

    private ReplyResponse convertToReplyResponse(ThreadReply reply) {
        return new ReplyResponse(
                reply.getId(),
                reply.getContent(),
                reply.getAuthor().getUsername(),
                reply.getParentReply() != null ? reply.getParentReply().getId() : null,
                reply.getCreatedAt(),
                reply.getUpdatedAt());
    }
}
