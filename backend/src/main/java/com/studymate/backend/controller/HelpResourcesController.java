package com.studymate.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studymate.backend.dto.ContentRecommendationRequest;
import com.studymate.backend.dto.ContentRecommendationResponse;
import com.studymate.backend.dto.HelpResourcesRequest;
import com.studymate.backend.dto.HelpResourcesResponse;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.model.User;
import com.studymate.backend.service.GeminiService;
import com.studymate.backend.service.HelpResourcesService;
import com.studymate.backend.service.StudyMaterialService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/help-resources")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HelpResourcesController {

    private static final Logger logger = LoggerFactory.getLogger(HelpResourcesController.class);

    @Autowired
    private HelpResourcesService helpResourcesService;

    @Autowired
    private StudyMaterialService studyMaterialService;

    @Autowired
    private GeminiService geminiService;

    @PostConstruct
    public void init() {
        logger.info("HelpResourcesController initialized successfully!");
        logger.info("HelpResourcesController endpoints registered:");
        logger.info("  POST /api/help-resources/search");
        logger.info("  GET /api/help-resources/material/{materialId}");
        logger.info("  POST /api/help-resources/ai-suggestions");
        logger.info("  POST /api/help-resources/content-analysis");
        logger.info("  POST /api/help-resources/cancel/{requestId}");
        logger.info("  POST /api/help-resources/start");
    }

    @PostMapping("/start")
    public ResponseEntity<?> startRecommendationRequest(Authentication authentication) {
        try {
            String requestId = helpResourcesService.startRecommendationRequest();

            logger.info("Started new recommendation request: {}", requestId);

            return ResponseEntity.ok().body(Map.of(
                    "requestId", requestId,
                    "message", "Recommendation request started",
                    "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            logger.error("Error starting recommendation request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to start recommendation request", "details", e.getMessage()));
        }
    }

    @PostMapping("/cancel/{requestId}")
    public ResponseEntity<?> cancelRecommendationRequest(@PathVariable String requestId,
            Authentication authentication) {
        try {
            logger.info("Cancelling recommendation request: {}", requestId);

            helpResourcesService.cancelRecommendationRequest(requestId);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Recommendation request cancelled successfully",
                    "requestId", requestId,
                    "cancelled", true));
        } catch (Exception e) {
            logger.error("Error cancelling recommendation request {}: {}", requestId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to cancel recommendation request", "details", e.getMessage()));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<?> searchHelpResources(@RequestBody HelpResourcesRequest request,
            Authentication authentication) {
        try {
            logger.info("Searching help resources for query: {}", request.getSearchQuery());

            HelpResourcesResponse response = helpResourcesService.getHelpResources(
                    request.getMaterialContent(),
                    request.getMaterialTitle(),
                    request.getSearchQuery());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error searching help resources: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error searching help resources: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        logger.info("Test endpoint called - testing improved academic search!");

        try {
            // Test the improved academic search with a sample query
            HelpResourcesResponse response = helpResourcesService.getHelpResources("machine learning algorithms",
                    "Machine Learning Tutorial", "machine learning");

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "HelpResourcesController is working with improved academic search!",
                    "testResults", Map.of(
                            "videosFound", response.getVideos().size(),
                            "articlesFound", response.getArticles().size(),
                            "blogsFound", response.getBlogs().size(),
                            "totalResults", response.getTotalResults(),
                            "sampleArticleTitles", response.getArticles().stream()
                                    .map(article -> article.getTitle())
                                    .limit(3)
                                    .toList(),
                            "sources", response.getArticles().stream()
                                    .map(article -> article.getSource())
                                    .distinct()
                                    .toList())));

        } catch (Exception e) {
            logger.error("Test endpoint error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "status", "error",
                    "message", "Test failed: " + e.getMessage()));
        }
    }

    @GetMapping("/material/{materialId}")
    public ResponseEntity<?> getHelpResourcesForMaterial(@PathVariable Long materialId,
            @RequestParam(required = false) String customQuery,
            Authentication authentication) {
        try {
            logger.info("Getting intelligent help resources for material ID: {}", materialId);

            User user = (User) authentication.getPrincipal();
            Long userId = user.getId();

            // Verify user has access to this material
            StudyMaterial material = studyMaterialService.getMaterialById(materialId, userId);

            // Use intelligent help resources service that leverages cached content
            HelpResourcesResponse response = helpResourcesService.getIntelligentHelpResources(
                    materialId,
                    customQuery);

            logger.info("Successfully retrieved {} help resources for material: {}",
                    response.getTotalResults(), material.getOriginalName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting intelligent help resources for material {}: {}", materialId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error getting help resources: " + e.getMessage());
        }
    }

    /**
     * Get AI-powered search suggestions for a given topic
     */
    @PostMapping("/ai-suggestions")
    public ResponseEntity<?> getAiSuggestions(@RequestBody ContentRecommendationRequest request,
            Authentication authentication) {
        try {
            logger.info("Getting AI suggestions for topic: {} in subject: {}", request.getTopic(),
                    request.getSubject());

            List<String> suggestions = geminiService.generateSearchSuggestions(
                    request.getTopic() != null ? request.getTopic() : "general",
                    request.getSubject() != null ? request.getSubject() : "general",
                    request.getDifficulty() != null ? request.getDifficulty() : "intermediate");

            // Convert to structured response
            List<ContentRecommendationResponse.SearchSuggestion> searchSuggestions = new ArrayList<>();
            for (String suggestion : suggestions) {
                searchSuggestions.add(new ContentRecommendationResponse.SearchSuggestion(
                        suggestion,
                        request.getContentType() != null ? request.getContentType() : "general",
                        "AI-generated educational content suggestion"));
            }

            ContentRecommendationResponse response = new ContentRecommendationResponse(
                    request.getTopic(),
                    request.getSubject(),
                    searchSuggestions,
                    new ArrayList<>(), // Empty resources for now
                    "Successfully generated " + suggestions.size() + " AI-powered search suggestions");

            logger.info("Generated {} AI suggestions for topic: {}", suggestions.size(), request.getTopic());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting AI suggestions: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error getting AI suggestions: " + e.getMessage());
        }
    }

    /**
     * Analyze content and get AI-powered recommendations
     */
    @PostMapping("/content-analysis")
    public ResponseEntity<?> analyzeContent(@RequestBody ContentRecommendationRequest request,
            Authentication authentication) {
        try {
            logger.info("Analyzing content for AI recommendations");

            String content = request.getContext() != null ? request.getContext() : "";
            String topic = request.getTopic() != null ? request.getTopic() : "study material";

            List<String> contentSuggestions = geminiService.analyzeContentAndSuggest(content, topic);

            // If specific content type is requested, get specialized queries
            List<String> specificQueries = new ArrayList<>();
            if (request.getContentType() != null && !request.getContentType().equals("all")) {
                specificQueries = geminiService.generateSpecificQueries(topic, request.getContentType());
            }

            // Combine all suggestions
            List<ContentRecommendationResponse.SearchSuggestion> allSuggestions = new ArrayList<>();

            for (String suggestion : contentSuggestions) {
                allSuggestions.add(new ContentRecommendationResponse.SearchSuggestion(
                        suggestion,
                        "content-analysis",
                        "Based on content analysis"));
            }

            for (String query : specificQueries) {
                allSuggestions.add(new ContentRecommendationResponse.SearchSuggestion(
                        query,
                        request.getContentType(),
                        "Specialized query for " + request.getContentType()));
            }

            ContentRecommendationResponse response = new ContentRecommendationResponse(
                    topic,
                    request.getSubject(),
                    allSuggestions,
                    new ArrayList<>(), // Empty resources for now
                    "Successfully analyzed content and generated " + allSuggestions.size() + " recommendations");

            logger.info("Generated {} content analysis suggestions", allSuggestions.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error analyzing content: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error analyzing content: " + e.getMessage());
        }
    }
}