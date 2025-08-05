package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.model.QuizOption;
import com.studymate.backend.model.QuizQuestion;
import com.studymate.backend.model.StudyMaterial;

import reactor.core.publisher.Mono;

/**
 * Real AI Quiz Generator Service using Google Gemini API
 */
@Service
public class GeminiAIQuizGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIQuizGeneratorService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public GeminiAIQuizGeneratorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Generate quiz questions using Gemini AI from extracted text content
     */
    public List<QuizQuestion> generateQuizQuestionsFromText(StudyMaterial studyMaterial, String extractedText,
            int numberOfQuestions, int durationMinutes) {

        logger.info("Generating quiz with {} questions from study material: {}",
                numberOfQuestions, studyMaterial.getFileName());

        try {
            // Create AI prompt for quiz generation
            String prompt = createQuizPrompt(extractedText, numberOfQuestions);

            // Call Gemini AI API
            String aiResponse = callGeminiAPI(prompt);

            // Parse AI response and create questions
            List<QuizQuestion> questions = parseAIResponseToQuestions(aiResponse, numberOfQuestions);

            logger.info("Successfully generated {} questions", questions.size());

            return questions;

        } catch (Exception e) {
            logger.error("Error generating quiz from AI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate quiz using AI: " + e.getMessage(), e);
        }
    }

    /**
     * Create a structured prompt for quiz generation
     */
    private String createQuizPrompt(String content, int numberOfQuestions) {
        return String.format(
                """
                        Based on the following educational content, generate exactly %d multiple-choice questions for a quiz.

                        CONTENT:
                        %s

                        INSTRUCTIONS:
                        - Generate exactly %d questions
                        - Each question should have 4 answer options
                        - Only one option should be correct
                        - Questions should test understanding, not just memorization
                        - Vary difficulty levels (easy, medium, hard)
                        - Focus on key concepts and important information

                        IMPORTANT: Respond ONLY with valid JSON in the exact format below. Do not include any explanatory text, markdown formatting, or code blocks.

                        REQUIRED JSON FORMAT:
                        {
                          "questions": [
                            {
                              "question": "Question text here?",
                              "options": [
                                {"text": "Option A text", "correct": false},
                                {"text": "Option B text", "correct": true},
                                {"text": "Option C text", "correct": false},
                                {"text": "Option D text", "correct": false}
                              ]
                            }
                          ]
                        }
                        """,
                numberOfQuestions, content, numberOfQuestions);
    }

    /**
     * Call Gemini AI API with retry logic for service unavailable errors
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
                            errorMessage = "Gemini AI service is temporarily unavailable after multiple attempts. Please try again in a few minutes.";
                            break;
                        case 429:
                            errorMessage = "API rate limit exceeded. Please wait before making another request.";
                            break;
                        case 401:
                            errorMessage = "Invalid API key. Please check your Gemini API configuration.";
                            break;
                        case 400:
                            errorMessage = "Invalid request to Gemini API. Please check the input data.";
                            break;
                        default:
                            errorMessage = "Gemini AI service error: " + e.getMessage();
                    }
                    throw new RuntimeException(errorMessage);
                }
            }
        }
        throw new RuntimeException("Failed to call Gemini API after " + maxRetries + " attempts");
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

            logger.info("Calling Gemini AI API...");

            // Make API call
            Mono<String> response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class);

            String responseBody = response.block();
            // System.out.println(responseBody);
            logger.info("Received response from Gemini AI API");

            // Extract text from Gemini response
            return extractTextFromGeminiResponse(responseBody);

        } catch (WebClientResponseException e) {
            logger.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());

            // Throw the exception as-is so retry logic can handle it appropriately
            throw e;
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException(
                    "Failed to generate quiz. The AI service may be temporarily unavailable. Please try again later.");
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

        throw new RuntimeException("No valid response content from Gemini API");
    }

    /**
     * Parse AI response to Questions list
     */
    private List<QuizQuestion> parseAIResponseToQuestions(String aiResponse, int numberOfQuestions) throws Exception {

        logger.info("Parsing AI response to questions format");

        try {
            // Extract JSON from AI response (in case there's additional text)
            String jsonContent = extractJSONFromResponse(aiResponse);
            // System.out.println(jsonContent);
            if (jsonContent == null || jsonContent.trim().isEmpty()) {
                throw new RuntimeException("No JSON content found in AI response");
            }

            logger.debug("Attempting to parse JSON: {}", jsonContent);

            // Parse JSON response
            AIQuizResponse aiQuizResponse;
            try {
                aiQuizResponse = objectMapper.readValue(jsonContent, AIQuizResponse.class);
            } catch (Exception jsonException) {
                logger.error("Failed to parse JSON content: {}", jsonContent);
                logger.error("JSON parsing error: {}", jsonException.getMessage());
                throw new RuntimeException("Invalid JSON format from AI response: " + jsonException.getMessage());
            }

            if (aiQuizResponse.questions == null || aiQuizResponse.questions.isEmpty()) {
                throw new RuntimeException("No questions found in AI response");
            }

            // Create questions
            List<QuizQuestion> questions = new ArrayList<>();
            int questionOrder = 1;

            for (AIQuestion aiQuestion : aiQuizResponse.questions) {
                QuizQuestion question = new QuizQuestion();
                question.setQuestionText(aiQuestion.question);
                question.setQuestionType(QuizQuestion.QuestionType.MULTIPLE_CHOICE);
                question.setQuestionNumber(questionOrder++);

                // Create options
                List<QuizOption> options = new ArrayList<>();
                int optionOrder = 1;

                for (AIOption aiOption : aiQuestion.options) {
                    QuizOption option = new QuizOption();
                    option.setQuestion(question);
                    option.setOptionText(aiOption.text);
                    option.setIsCorrect(aiOption.correct);
                    option.setOptionNumber(optionOrder++);
                    options.add(option);
                }

                question.setOptions(options);
                questions.add(question);
            }

            // Validate questions
            if (questions.size() != numberOfQuestions) {
                logger.warn("Generated {} questions instead of requested {}", questions.size(), numberOfQuestions);
            }

            logger.info("Successfully parsed AI response into {} questions", questions.size());
            return questions;

        } catch (Exception e) {
            logger.error("Error parsing AI response to questions: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    /**
     * Extract JSON content from AI response
     */
    private String extractJSONFromResponse(String response) {
        logger.debug("AI Response to parse: {}", response);

        // First, try to find JSON block markers (```json or just ```)
        Pattern codeBlockPattern = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
        Matcher codeBlockMatcher = codeBlockPattern.matcher(response);

        if (codeBlockMatcher.find()) {
            String jsonContent = codeBlockMatcher.group(1).trim();
            logger.debug("Found JSON in code block: {}", jsonContent);
            return jsonContent;
        }

        // Try to find complete JSON object with questions array
        Pattern jsonPattern = Pattern.compile("\\{[\\s\\S]*?\"questions\"[\\s\\S]*?\\}", Pattern.DOTALL);
        Matcher jsonMatcher = jsonPattern.matcher(response);

        if (jsonMatcher.find()) {
            String jsonContent = jsonMatcher.group();
            logger.debug("Found JSON with questions: {}", jsonContent);
            return jsonContent;
        }

        // Try to extract between first { and last } (more robust)
        int firstBrace = response.indexOf('{');
        int lastBrace = response.lastIndexOf('}');

        if (firstBrace != -1 && lastBrace != -1 && firstBrace < lastBrace) {
            String jsonContent = response.substring(firstBrace, lastBrace + 1);
            logger.debug("Extracted JSON between braces: {}", jsonContent);
            return jsonContent;
        }

        // If no JSON structure found, log and return original
        logger.warn("No JSON structure found in AI response. Full response: {}", response);
        return response;
    }

    // DTOs for API responses
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

    private static class AIQuizResponse {
        @JsonProperty("questions")
        public List<AIQuestion> questions;
    }

    private static class AIQuestion {
        @JsonProperty("question")
        public String question;

        @JsonProperty("options")
        public List<AIOption> options;
    }

    private static class AIOption {
        @JsonProperty("text")
        public String text;

        @JsonProperty("correct")
        public boolean correct;
    }
}
