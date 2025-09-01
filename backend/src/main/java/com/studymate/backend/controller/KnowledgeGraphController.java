package com.studymate.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.KnowledgeEntityResponse;
import com.studymate.backend.dto.KnowledgeSummaryResponse;
import com.studymate.backend.dto.ThreadResponse;
import com.studymate.backend.model.KnowledgeEntity;
import com.studymate.backend.repository.KnowledgeEntityRepository;
import com.studymate.backend.service.DiscussionThreadService;
import com.studymate.backend.service.KnowledgeGraphService;

@RestController
@RequestMapping("/knowledge")
@CrossOrigin(origins = "*", maxAge = 3600)
public class KnowledgeGraphController {

    @Autowired
    private KnowledgeGraphService knowledgeGraphService;

    @Autowired
    private KnowledgeEntityRepository entityRepository;

    @Autowired
    private DiscussionThreadService threadService;

    /**
     * Get knowledge summary for a specific thread
     */
    @GetMapping("/threads/{threadId}/summary")
    public ResponseEntity<KnowledgeSummaryResponse> getThreadKnowledgeSummary(@PathVariable Long threadId) {
        Optional<ThreadResponse> threadOpt = threadService.getThreadById(threadId);
        if (threadOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ThreadResponse thread = threadOpt.get();

        // Get related threads (simplified - would need to implement in service)
        List<ThreadResponse> relatedThreads = List.of(); // TODO: Implement related threads logic

        // Get suggested topics
        List<String> suggestedTopics = thread.getKnowledgeEntities().stream()
                .flatMap(entity -> entity.getRelatedEntityNames().stream())
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        KnowledgeSummaryResponse summary = new KnowledgeSummaryResponse(
                thread.getAiGeneratedSummary(),
                thread.getKnowledgeScore(),
                thread.getKnowledgeEntities(),
                relatedThreads,
                suggestedTopics);

        return ResponseEntity.ok(summary);
    }

    /**
     * Search knowledge entities
     */
    @GetMapping("/entities/search")
    public ResponseEntity<Page<KnowledgeEntityResponse>> searchEntities(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeEntity> entities = entityRepository.searchEntities(query, pageable);

        Page<KnowledgeEntityResponse> response = entities.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * Get most frequent knowledge entities
     */
    @GetMapping("/entities/popular")
    public ResponseEntity<Page<KnowledgeEntityResponse>> getPopularEntities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeEntity> entities = entityRepository.findMostFrequentEntities(pageable);

        Page<KnowledgeEntityResponse> response = entities.map(this::convertToResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * Get entities by type
     */
    @GetMapping("/entities/type/{entityType}")
    public ResponseEntity<List<KnowledgeEntityResponse>> getEntitiesByType(@PathVariable String entityType) {
        List<KnowledgeEntity> entities = entityRepository.findByEntityTypeIgnoreCase(entityType);

        List<KnowledgeEntityResponse> response = entities.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get related entities for a specific entity
     */
    @GetMapping("/entities/{entityId}/related")
    public ResponseEntity<List<KnowledgeEntityResponse>> getRelatedEntities(@PathVariable Long entityId) {
        List<KnowledgeEntity> relatedEntities = entityRepository.findRelatedEntities(entityId);

        List<KnowledgeEntityResponse> response = relatedEntities.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get entity details by ID
     */
    @GetMapping("/entities/{entityId}")
    public ResponseEntity<KnowledgeEntityResponse> getEntityById(@PathVariable Long entityId) {
        Optional<KnowledgeEntity> entityOpt = entityRepository.findById(entityId);
        if (entityOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        KnowledgeEntityResponse response = convertToResponse(entityOpt.get());
        return ResponseEntity.ok(response);
    }

    /**
     * Get knowledge graph statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getKnowledgeGraphStats() {
        long totalEntities = entityRepository.count();
        List<KnowledgeEntity> topEntities = entityRepository.findMostFrequentEntities(PageRequest.of(0, 5))
                .getContent();

        return ResponseEntity.ok(Map.of(
                "totalEntities", totalEntities,
                "topEntities", topEntities.stream()
                        .map(entity -> Map.of(
                                "name", entity.getName(),
                                "frequency", entity.getFrequencyCount(),
                                "type", entity.getEntityType()))
                        .collect(Collectors.toList())));
    }

    /**
     * Generate AI summary for a topic/query
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, String>> generateTopicSummary(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String summary = knowledgeGraphService.generateTopicSummary(query.trim());

        return ResponseEntity.ok(Map.of("summary", summary));
    }

    // Helper method to convert entity to response
    private KnowledgeEntityResponse convertToResponse(KnowledgeEntity entity) {
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
}
