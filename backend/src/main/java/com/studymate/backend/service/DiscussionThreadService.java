package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.dto.CreateReplyRequest;
import com.studymate.backend.dto.CreateThreadRequest;
import com.studymate.backend.dto.KnowledgeEntityResponse;
import com.studymate.backend.dto.ReplyResponse;
import com.studymate.backend.dto.ThreadResponse;
import com.studymate.backend.model.DiscussionThread;
import com.studymate.backend.model.KnowledgeEntity;
import com.studymate.backend.model.ReplyKeyPhrase;
import com.studymate.backend.model.ThreadReply;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.DiscussionThreadRepository;
import com.studymate.backend.repository.ReplyKeyPhraseRepository;
import com.studymate.backend.repository.ThreadReplyRepository;

@Service
@Transactional
public class DiscussionThreadService {

    @Autowired
    private DiscussionThreadRepository threadRepository;

    @Autowired
    private ThreadReplyRepository replyRepository;

    @Autowired
    private ReplyKeyPhraseRepository replyKeyPhraseRepository;

    @Autowired
    private DiscussionWebSocketService webSocketService;

    @Autowired
    private KnowledgeGraphService knowledgeGraphService;

    @Autowired
    private NLPKeyPhraseService nlpKeyPhraseService;

    // Thread Management
    public ThreadResponse createThread(CreateThreadRequest request, User author) {
        DiscussionThread thread = new DiscussionThread(
                request.getTitle(),
                request.getContent(),
                request.getCourse(),
                request.getTopic(),
                author);

        DiscussionThread savedThread = threadRepository.save(thread);

        // Process thread for knowledge graph asynchronously to improve performance
        processKnowledgeGraphAsync(savedThread);

        ThreadResponse threadResponse = convertToThreadResponse(savedThread);

        // Broadcast thread creation to all users
        webSocketService.broadcastThreadCreated(threadResponse);

        return threadResponse;
    }

    @Async("knowledgeGraphExecutor")
    public void processKnowledgeGraphAsync(DiscussionThread thread) {
        try {
            knowledgeGraphService.processThreadForKnowledgeGraph(thread);
            threadRepository.save(thread);
        } catch (Exception e) {
            System.err.println(
                    "Async knowledge graph processing failed for thread " + thread.getId() + ": " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> getAllThreads(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return threadRepository.findAll(pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> getThreadsByCourse(String course, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByCourseOrderByLastActivityAtDesc(course, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> getThreadsByTopic(String topic, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByTopicOrderByLastActivityAtDesc(topic, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> getThreadsByCourseAndTopic(String course, String topic, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.findByCourseAndTopicOrderByLastActivityAtDesc(course, topic, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> searchThreads(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreads(searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> searchThreadsWithReplies(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsWithReplies(searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> searchThreadsWithKnowledge(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Clean and prepare search term for better matching
        String cleanedSearchTerm = searchTerm.trim();

        // For comprehensive search, try multiple variations of the search term
        Page<DiscussionThread> threads;

        if (cleanedSearchTerm.length() <= 2) {
            // For very short terms, use exact matching to avoid too many results
            threads = threadRepository.searchThreadsWithKnowledge(cleanedSearchTerm, pageable);
        } else {
            // For longer terms, use the enhanced search
            threads = threadRepository.searchThreadsWithKnowledge(cleanedSearchTerm, pageable);
        }

        return threads.map(thread -> convertToThreadResponse(thread));
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> searchThreadsByCourse(String course, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsByCourse(course, searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional(readOnly = true)
    public Page<ThreadResponse> searchThreadsByCourseWithKnowledge(String course, String searchTerm, int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        return threadRepository.searchThreadsByCourseWithKnowledge(course, searchTerm, pageable)
                .map(this::convertToThreadResponse);
    }

    @Transactional
    public Optional<ThreadResponse> getThreadById(Long threadId) {
        Optional<DiscussionThread> thread = threadRepository.findById(threadId);
        if (thread.isPresent()) {
            // Increment view count
            DiscussionThread foundThread = thread.get();
            foundThread.incrementViewCount();
            threadRepository.save(foundThread);
            // Include full knowledge data for detail views
            return Optional.of(convertToThreadResponse(foundThread, true));
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

    // Reply Management - Optimized for performance
    public ReplyResponse createReply(Long threadId, CreateReplyRequest request, User author) {
        // Fast path: Get thread and validate
        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            throw new RuntimeException("Thread not found");
        }

        DiscussionThread thread = threadOpt.get();
        if (thread.getIsLocked()) {
            throw new RuntimeException("Thread is locked");
        }

        // Quick parent reply validation if needed
        ThreadReply parentReply = null;
        if (request.getParentReplyId() != null) {
            Optional<ThreadReply> parentOpt = replyRepository.findById(request.getParentReplyId());
            if (parentOpt.isEmpty()) {
                throw new RuntimeException("Parent reply not found");
            }
            parentReply = parentOpt.get();
        }

        // Create and save reply immediately (fast operation)
        ThreadReply reply = new ThreadReply(request.getContent(), thread, author, parentReply);
        ThreadReply savedReply = replyRepository.save(reply);

        // Quick thread update (minimal database operation)
        thread.incrementReplyCount();
        threadRepository.save(thread);

        // Convert to response early
        ReplyResponse replyResponse = convertToReplyResponse(savedReply);

        // Quick broadcast to users
        webSocketService.broadcastReplyCreated(threadId, replyResponse);

        // ASYNC OPERATIONS - Don't block the response
        // Process NLP and knowledge graph separately to maximize parallelism
        processNLPAsync(request.getContent(), savedReply);
        processKnowledgeGraphAsync(thread, request.getContent());

        return replyResponse;
    }

    // Asynchronous processing method for expensive operations
    @Async("replyProcessingExecutor")
    public void processReplyAsync(DiscussionThread thread, String content, ThreadReply reply) {
        try {
            // Process NLP key phrases asynchronously
            processNLPAsync(content, reply);

            // Process knowledge graph asynchronously
            processKnowledgeGraphAsync(thread, content);

        } catch (Exception e) {
            // Log error but don't fail the reply creation
            System.err.println("Error in async reply processing: " + e.getMessage());
        }
    }

    // Separate async method for NLP processing
    @Async("nlpProcessingExecutor")
    public void processNLPAsync(String content, ThreadReply reply) {
        try {
            extractAndSaveKeyPhrases(content, reply);
        } catch (Exception e) {
            System.err.println("Error in async NLP processing: " + e.getMessage());
        }
    }

    // Separate async method for knowledge graph processing
    @Async("replyProcessingExecutor")
    public void processKnowledgeGraphAsync(DiscussionThread thread, String content) {
        try {
            knowledgeGraphService.processReplyForKnowledgeGraph(thread, content);
            threadRepository.save(thread);
        } catch (Exception e) {
            System.err.println("Error in async knowledge graph processing: " + e.getMessage());
        }
    }

    // NLP Key Phrase Extraction - Optimized for performance
    private void extractAndSaveKeyPhrases(String content, ThreadReply reply) {
        try {
            // Skip NLP processing for very short content
            if (content == null || content.trim().length() < 20) {
                return;
            }

            // Limit content length to avoid excessive processing time
            String processableContent = content.length() > 2000 ? content.substring(0, 2000) + "..." : content;

            // Use NLP for key phrase extraction
            List<String> keyPhrases = nlpKeyPhraseService.extractKeyPhrases(processableContent);

            // Limit the number of key phrases to save
            List<String> limitedKeyPhrases = keyPhrases.stream()
                    .limit(15) // Only save top 15 key phrases
                    .collect(Collectors.toList());

            // Batch save key phrases to reduce database calls
            List<ReplyKeyPhrase> keyPhrasesToSave = new ArrayList<>();

            for (String keyPhrase : limitedKeyPhrases) {
                // Check if this key phrase already exists for this reply
                Optional<ReplyKeyPhrase> existingKeyPhrase = replyKeyPhraseRepository.findByKeyPhraseAndReply(keyPhrase,
                        reply);

                if (existingKeyPhrase.isPresent()) {
                    // Increment frequency if it already exists
                    existingKeyPhrase.get().incrementFrequency();
                    keyPhrasesToSave.add(existingKeyPhrase.get());
                } else {
                    // Create new key phrase entry
                    ReplyKeyPhrase newKeyPhrase = new ReplyKeyPhrase(keyPhrase, reply);
                    keyPhrasesToSave.add(newKeyPhrase);
                }
            }

            // Batch save all key phrases
            replyKeyPhraseRepository.saveAll(keyPhrasesToSave);

            System.out.println("Saved " + limitedKeyPhrases.size() + " key phrases for reply " + reply.getId());

        } catch (Exception e) {
            System.err.println("Error extracting and saving key phrases: " + e.getMessage());
        }
    }

    public Page<ReplyResponse> getRepliesByThread(Long threadId, int page, int size) {
        return getRepliesByThread(threadId, page, size, null);
    }

    public Page<ReplyResponse> getRepliesByThread(Long threadId, int page, int size, User currentUser) {
        Optional<DiscussionThread> threadOpt = threadRepository.findById(threadId);
        if (threadOpt.isEmpty()) {
            throw new RuntimeException("Thread not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        return replyRepository.findByThreadAndIsDeletedFalseOrderByCreatedAtAsc(threadOpt.get(), pageable)
                .map(reply -> convertToReplyResponse(reply, currentUser));
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

        // Get all replies for this thread
        List<ThreadReply> replies = replyRepository.findByThread(thread);

        // Delete all reply key phrases first to avoid foreign key constraint violations
        for (ThreadReply reply : replies) {
            List<ReplyKeyPhrase> keyPhrases = replyKeyPhraseRepository.findByReply(reply);
            if (!keyPhrases.isEmpty()) {
                replyKeyPhraseRepository.deleteAll(keyPhrases);
                System.out.println("Deleted " + keyPhrases.size() + " key phrases for reply " + reply.getId());
            }
        }

        // Delete all thread key phrases if any exist
        List<ReplyKeyPhrase> threadKeyPhrases = replyKeyPhraseRepository.findByThreadId(threadId);
        if (!threadKeyPhrases.isEmpty()) {
            replyKeyPhraseRepository.deleteAll(threadKeyPhrases);
            System.out.println("Deleted " + threadKeyPhrases.size() + " thread-level key phrases");
        }

        // Now delete the thread (this will cascade delete the replies)
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

        // Get the thread before deletion for broadcasting
        DiscussionThread thread = reply.getThread();

        // Delete associated key phrases first to avoid foreign key constraint violation
        List<ReplyKeyPhrase> keyPhrases = replyKeyPhraseRepository.findByReply(reply);
        if (!keyPhrases.isEmpty()) {
            replyKeyPhraseRepository.deleteAll(keyPhrases);
            System.out.println("Deleted " + keyPhrases.size() + " key phrases for reply " + replyId);
        }

        // Now delete the reply
        replyRepository.delete(reply);

        // Update thread reply count
        thread.decrementReplyCount();
        threadRepository.save(thread);

        System.out.println("Reply " + replyId + " deleted by user " + user.getUsername());

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
        return convertToThreadResponse(thread, false); // Default to lightweight conversion
    }

    private ThreadResponse convertToThreadResponse(DiscussionThread thread, boolean includeFullKnowledgeData) {
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

        // Convert knowledge entities to DTOs with performance optimization
        if (thread.getKnowledgeEntities() != null && !thread.getKnowledgeEntities().isEmpty()) {
            List<KnowledgeEntityResponse> entityResponses = thread.getKnowledgeEntities().stream()
                    .limit(5) // Limit to top 5 entities for list views
                    .map(entity -> convertToKnowledgeEntityResponse(entity, includeFullKnowledgeData))
                    .collect(Collectors.toList());
            response.setKnowledgeEntities(entityResponses);
        }

        return response;
    }

    private KnowledgeEntityResponse convertToKnowledgeEntityResponse(KnowledgeEntity entity,
            boolean includeRelatedData) {
        KnowledgeEntityResponse response = new KnowledgeEntityResponse(
                entity.getId(),
                entity.getName(),
                entity.getEntityType(),
                entity.getDescription(),
                entity.getConfidenceScore(),
                entity.getFrequencyCount(),
                entity.getCreatedAt());

        // Only include expensive related data when specifically requested (e.g., detail
        // views)
        if (includeRelatedData) {
            // Add related entity names
            List<String> relatedNames = entity.getRelatedEntities().stream()
                    .limit(5)
                    .map(KnowledgeEntity::getName)
                    .collect(Collectors.toList());
            response.setRelatedEntityNames(relatedNames);

            response.setRelatedThreadCount((long) entity.getRelatedThreads().size());
        } else {
            // For list views, use empty lists to avoid N+1 queries
            response.setRelatedEntityNames(List.of());
            response.setRelatedThreadCount(0L);
        }

        return response;
    }

    private ReplyResponse convertToReplyResponse(ThreadReply reply) {
        return new ReplyResponse(
                reply.getId(),
                reply.getContent(),
                reply.getAuthor().getUsername(),
                reply.getParentReply() != null ? reply.getParentReply().getId() : null,
                reply.getCreatedAt(),
                reply.getUpdatedAt(),
                0.0, // averageRating placeholder
                0, // ratingCount placeholder
                null); // userRating placeholder
    }

    private ReplyResponse convertToReplyResponse(ThreadReply reply, User currentUser) {
        return new ReplyResponse(
                reply.getId(),
                reply.getContent(),
                reply.getAuthor().getUsername(),
                reply.getParentReply() != null ? reply.getParentReply().getId() : null,
                reply.getCreatedAt(),
                reply.getUpdatedAt(),
                0.0, // averageRating placeholder
                0, // ratingCount placeholder
                null); // userRating placeholder
    }
}
