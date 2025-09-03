package com.studymate.backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.model.StudyMaterial;
import com.studymate.backend.repository.StudyMaterialRepository;

import reactor.core.publisher.Mono;

/**
 * AI Chatbot Service for Study Materials using Google Gemini API
 * Provides material summarization and Q&A capabilities
 */
@Service
public class StudyMaterialChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(StudyMaterialChatbotService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private DocumentTextExtractorService documentTextExtractorService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public StudyMaterialChatbotService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Generate a comprehensive summary of study material
     */
    public String generateMaterialSummary(Long materialId) {
        try {
            StudyMaterial material = studyMaterialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            // Extract text from the material
            String contentType = getContentTypeFromFileType(material.getFileType());
            String extractedText = documentTextExtractorService.extractTextFromBytes(
                    material.getFileData(), contentType, material.getOriginalName());

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new RuntimeException("No text content found in the material");
            }

            // Create summary prompt
            String prompt = createSummaryPrompt(extractedText, material.getFileName());

            // Call Gemini AI API
            String aiResponse = callGeminiAPI(prompt);

            logger.info("Generated summary for material: {}", material.getFileName());
            return aiResponse;

        } catch (Exception e) {
            logger.error("Error generating material summary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate summary: " + e.getMessage(), e);
        }
    }

    /**
     * Answer questions about study material with context
     */
    public String answerQuestionWithContext(Long materialId, String question, String conversationHistory) {
        try {
            StudyMaterial material = studyMaterialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            // Extract text from the material
            String contentType = getContentTypeFromFileType(material.getFileType());
            String extractedText = documentTextExtractorService.extractTextFromBytes(
                    material.getFileData(), contentType, material.getOriginalName());

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new RuntimeException("No text content found in the material");
            }

            // Create Q&A prompt with context
            String prompt = createQuestionAnswerPrompt(extractedText, question, conversationHistory,
                    material.getFileName());

            // Call Gemini AI API
            String aiResponse = callGeminiAPI(prompt);

            logger.info("Answered question about material: {}", material.getFileName());
            return aiResponse;

        } catch (Exception e) {
            logger.error("Error answering question: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to answer question: " + e.getMessage(), e);
        }
    }

    /**
     * Extract and cache material content for improved performance
     * This method processes the material once and provides content for subsequent
     * operations
     */
    public String extractAndCacheContent(StudyMaterial material) {
        try {
            logger.info("Extracting and caching content for material: {}", material.getFileName());

            // Extract text content from the material
            String contentType = getContentTypeFromFileType(material.getFileType());
            String extractedText = documentTextExtractorService.extractTextFromBytes(
                    material.getFileData(), contentType, material.getOriginalName());

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new RuntimeException("No text content found in the material");
            }

            // Clean and prepare content for caching
            String cleanedContent = extractedText.trim();

            // Log content statistics
            int wordCount = cleanedContent.split("\\s+").length;
            logger.info("Successfully cached content for {}: {} characters, {} words",
                    material.getFileName(), cleanedContent.length(), wordCount);

            return cleanedContent;

        } catch (Exception e) {
            logger.error("Error extracting content for caching: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract material content: " + e.getMessage(), e);
        }
    }

    /**
     * Generate key concepts and topics from study material
     */
    public String generateKeyTopics(Long materialId) {
        try {
            StudyMaterial material = studyMaterialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));

            // Extract text from the material
            String contentType = getContentTypeFromFileType(material.getFileType());
            String extractedText = documentTextExtractorService.extractTextFromBytes(
                    material.getFileData(), contentType, material.getOriginalName());

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new RuntimeException("No text content found in the material");
            }

            // Create key topics prompt
            String prompt = createKeyTopicsPrompt(extractedText, material.getFileName());

            // Call Gemini AI API
            String aiResponse = callGeminiAPI(prompt);

            logger.info("Generated key topics for material: {}", material.getFileName());
            return aiResponse;

        } catch (Exception e) {
            logger.error("Error generating key topics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate key topics: " + e.getMessage(), e);
        }
    }

    /**
     * Create summary prompt for AI
     */
    private String createSummaryPrompt(String content, String fileName) {
        return String.format(
                """
                        Please create a comprehensive but concise summary of the following study material.

                        MATERIAL: %s

                        CONTENT:
                        %s

                        INSTRUCTIONS:
                        - Provide a clear, well-structured summary
                        - Highlight the main concepts and key points
                        - Organize information logically with headings if appropriate
                        - Focus on the most important information for studying
                        - Use bullet points or numbered lists where helpful
                        - Keep it academic and educational in tone
                        - Aim for 300-500 words unless the content requires more detail

                        Please provide the summary in a clear, readable format.
                        """,
                fileName, content);
    }

    /**
     * Create Q&A prompt with conversation context
     */
    private String createQuestionAnswerPrompt(String content, String question, String conversationHistory,
            String fileName) {
        String contextSection = "";
        if (conversationHistory != null && !conversationHistory.trim().isEmpty()) {
            contextSection = String.format(
                    """

                            PREVIOUS CONVERSATION:
                            %s

                            """, conversationHistory);
        }

        return String.format(
                """
                        You are an AI tutor helping a student understand their study material. Please answer the student's question based on the provided content.

                        STUDY MATERIAL: %s

                        CONTENT:
                        %s
                        %s
                        STUDENT'S QUESTION:
                        %s

                        INSTRUCTIONS:
                        - Answer the question directly and clearly
                        - Base your answer primarily on the provided study material
                        - If the question cannot be fully answered from the material, mention this
                        - Provide examples or explanations to help understanding
                        - Be encouraging and supportive in your tone
                        - If referencing previous conversation, maintain continuity
                        - Keep responses focused and educational

                        Please provide a helpful and informative answer.
                        """,
                fileName, content, contextSection, question);
    }

    /**
     * Create key topics extraction prompt
     */
    private String createKeyTopicsPrompt(String content, String fileName) {
        return String.format(
                """
                        Please analyze the following study material and extract the key topics, concepts, and themes.

                        MATERIAL: %s

                        CONTENT:
                        %s

                        INSTRUCTIONS:
                        - Identify the main topics and subtopics
                        - List important concepts and definitions
                        - Highlight key theories, principles, or methods
                        - Organize information hierarchically if possible
                        - Include relevant formulas, equations, or technical terms
                        - Focus on items that would be important for studying or exams
                        - Present information in a structured, easy-to-review format

                        Please provide a well-organized overview of the key topics.
                        """,
                fileName, content);
    }

    /**
     * Call Gemini AI API with retry logic
     */
    private String callGeminiAPI(String prompt) {
        return callGeminiAPIWithRetry(prompt, 3, 2000); // 3 retries with 2 second delay
    }

    /**
     * Call Gemini AI API with retry mechanism
     */
    private String callGeminiAPIWithRetry(String prompt, int maxRetries, long delayMs) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return executeGeminiAPICall(prompt);
            } catch (WebClientResponseException e) {
                // Only retry for 503 Service Unavailable errors
                if (e.getStatusCode().value() == 503 && attempt < maxRetries) {
                    logger.warn("Gemini API unavailable (attempt {}/{}), retrying in {}ms...",
                            attempt, maxRetries, delayMs);
                    try {
                        Thread.sleep(delayMs);
                        delayMs *= 2; // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted while waiting to retry Gemini API call", ie);
                    }
                } else {
                    // Re-throw with user-friendly message for non-503 errors or final attempt
                    String errorMessage;
                    switch (e.getStatusCode().value()) {
                        case 503:
                            errorMessage = "AI service is temporarily unavailable. Please try again in a few minutes.";
                            break;
                        case 429:
                            errorMessage = "API rate limit exceeded. Please wait before making another request.";
                            break;
                        case 401:
                            errorMessage = "Invalid API configuration. Please contact support.";
                            break;
                        case 400:
                            errorMessage = "Invalid request. Please check your input.";
                            break;
                        default:
                            errorMessage = "AI service error: " + e.getMessage();
                    }
                    throw new RuntimeException(errorMessage);
                }
            }
        }
        throw new RuntimeException("Failed to call AI service after " + maxRetries + " attempts");
    }

    /**
     * Execute the actual Gemini AI API call
     */
    private String executeGeminiAPICall(String prompt) {
        try {
            // Prepare request body for Gemini API
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "topK", 40,
                            "topP", 0.95,
                            "maxOutputTokens", 8192));

            logger.info("Calling Gemini AI API for chatbot...");

            // Make API call
            Mono<String> response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class);

            String responseBody = response.block();
            logger.info("Received response from Gemini AI API");

            // Extract text from Gemini response
            return extractTextFromGeminiResponse(responseBody);

        } catch (WebClientResponseException e) {
            logger.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("AI service is temporarily unavailable. Please try again later.");
        }
    }

    /**
     * Extract text content from Gemini API response
     */
    private String extractTextFromGeminiResponse(String responseBody) throws Exception {
        GeminiResponse geminiResponse = objectMapper.readValue(responseBody, GeminiResponse.class);

        if (geminiResponse.candidates != null && !geminiResponse.candidates.isEmpty()) {
            GeminiCandidate candidate = geminiResponse.candidates.get(0);
            if (candidate.content != null && candidate.content.parts != null &&
                    !candidate.content.parts.isEmpty()) {
                return candidate.content.parts.get(0).text;
            }
        }

        throw new RuntimeException("No valid response content from AI service");
    }

    /**
     * Convert StudyMaterial.FileType to content type string
     */
    private String getContentTypeFromFileType(StudyMaterial.FileType fileType) {
        switch (fileType) {
            case PDF:
                return "application/pdf";
            case PPTX:
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case PPT:
                return "application/vnd.ms-powerpoint";
            default:
                throw new RuntimeException("Unsupported file type: " + fileType);
        }
    }

    // DTOs for Gemini API responses
    private static class GeminiResponse {
        @JsonProperty("candidates")
        public List<GeminiCandidate> candidates;
    }

    private static class GeminiCandidate {
        @JsonProperty("content")
        public GeminiContent content;
    }

    private static class GeminiContent {
        @JsonProperty("parts")
        public List<GeminiPart> parts;
    }

    private static class GeminiPart {
        @JsonProperty("text")
        public String text;
    }
}
