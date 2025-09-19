package com.studymate.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.ChatbotQuestionRequest;
import com.studymate.backend.dto.ChatbotResponse;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyMaterialRepository;
import com.studymate.backend.service.StudyMaterialChatbotService;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;

/**
 * REST Controller for Study Material Chatbot functionality
 * Provides AI-powered summarization and Q&A for study materials
 */
@RestController
@RequestMapping("/chatbot")
public class ChatbotController {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotController.class);

    @Autowired
    private StudyMaterialChatbotService chatbotService;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    public ChatbotController() {
        logger.info("ChatbotController initialized successfully!");
    }

    @PostConstruct
    public void init() {
        logger.info("ChatbotController @PostConstruct - Dependencies:");
        logger.info("  chatbotService: {}", chatbotService != null ? "INJECTED" : "NULL");
        logger.info("  studyMaterialRepository: {}", studyMaterialRepository != null ? "INJECTED" : "NULL");
        logger.info("ChatbotController ready with all endpoints registered!");
    }

    /**
     * Generate a summary of study material
     */
    @GetMapping("/materials/{materialId}/summary")
    public ResponseEntity<?> generateMaterialSummary(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User user) {

        logger.info("=== ENDPOINT HIT: generateMaterialSummary for material {} ===", materialId);

        try {
            logger.info("Generating summary for material {} by user {}", materialId,
                    user != null ? user.getUsername() : "null");

            // Verify user owns the material
            StudyMaterial material = studyMaterialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            if (user != null && !material.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: You don't own this material");
            }

            // Generate summary
            String summary = chatbotService.generateMaterialSummary(materialId);

            ChatbotResponse response = new ChatbotResponse(
                    summary,
                    "summary",
                    materialId,
                    material.getOriginalName());

            logger.info("Successfully generated summary for material {}", materialId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error generating summary for material {}: {}", materialId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to generate summary: " + e.getMessage());
        }
    }

    /**
     * Generate key topics from study material
     */
    @GetMapping("/materials/{materialId}/topics")
    public ResponseEntity<?> generateKeyTopics(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User user) {

        try {
            logger.info("Generating key topics for material {} by user {}", materialId, user.getUsername());

            // Verify user owns the material
            StudyMaterial material = studyMaterialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            if (!material.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: You don't own this material");
            }

            // Generate key topics
            String topics = chatbotService.generateKeyTopics(materialId);

            ChatbotResponse response = new ChatbotResponse(
                    topics,
                    "topics",
                    materialId,
                    material.getOriginalName());

            logger.info("Successfully generated key topics for material {}", materialId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error generating key topics for material {}: {}", materialId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to generate key topics: " + e.getMessage());
        }
    }

    /**
     * Ask a question about study material with conversation context
     */
    @PostMapping("/materials/question")
    public ResponseEntity<?> askQuestion(
            @Valid @RequestBody ChatbotQuestionRequest request,
            @AuthenticationPrincipal User user) {

        try {
            logger.info("Processing question for material {} by user {}",
                    request.getMaterialId(), user.getUsername());

            // Verify user owns the material
            StudyMaterial material = studyMaterialRepository.findById(request.getMaterialId())
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            if (!material.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: You don't own this material");
            }

            // Answer the question
            String answer = chatbotService.answerQuestionWithContext(
                    request.getMaterialId(),
                    request.getQuestion(),
                    request.getConversationHistory());
            ChatbotResponse response = new ChatbotResponse(
                    answer,
                    "answer",
                    request.getMaterialId(),
                    material.getOriginalName());
            logger.info("Successfully answered question for material {}", request.getMaterialId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error answering question for material {}: {}",
                    request.getMaterialId(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to answer question: " + e.getMessage());
        }
    }

    /**
     * Load and cache material content for improved performance
     */
    @GetMapping("/materials/{materialId}/content")
    public ResponseEntity<?> loadMaterialContent(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User user) {

        logger.info("Loading material content for caching: materialId={}, userId={}",
                materialId, user != null ? user.getId() : "null");

        try {
            // Validate user authentication
            if (user == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }

            // Verify material exists and belongs to user
            StudyMaterial material = studyMaterialRepository.findByIdAndUserId(materialId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            // Extract and process content for caching
            String content = chatbotService.extractAndCacheContent(material);

            // Prepare response with content and metadata
            var response = new java.util.HashMap<String, Object>();
            response.put("materialId", materialId);
            response.put("content", content);
            response.put("contentLength", content.length());
            response.put("timestamp", java.time.Instant.now().toString());
            response.put("materialName", material.getOriginalName());

            logger.info("Successfully loaded and cached content for material {} (length: {} chars)",
                    materialId, content.length());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error loading material content for caching {}: {}", materialId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to load material content: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint for chatbot service
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            return ResponseEntity.ok().body("{\"status\": \"Chatbot service is running\"}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Chatbot service is unavailable");
        }
    }
}
