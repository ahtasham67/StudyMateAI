package com.studymate.backend.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate intelligent search suggestions for educational content based on a
     * topic
     */
    public List<String> generateSearchSuggestions(String topic, String subject, String difficulty) {
        try {
            String prompt = buildSearchSuggestionsPrompt(topic, subject, difficulty);
            String response = callGeminiAPI(prompt);
            return parseSearchSuggestions(response);

        } catch (Exception e) {
            logger.error("Error generating search suggestions with Gemini: {}", e.getMessage());
            return getDefaultSearchSuggestions(topic);
        }
    }

    /**
     * Analyze content and suggest relevant educational resources
     */
    public List<String> analyzeContentAndSuggest(String content, String context) {
        try {
            String prompt = buildContentAnalysisPrompt(content, context);
            String response = callGeminiAPI(prompt);
            return parseContentSuggestions(response);

        } catch (Exception e) {
            logger.error("Error analyzing content with Gemini: {}", e.getMessage());
            return getDefaultContentSuggestions(content);
        }
    }

    /**
     * Generate specific search queries for different content types
     */
    public List<String> generateSpecificQueries(String topic, String contentType) {
        try {
            String prompt = buildSpecificQueriesPrompt(topic, contentType);
            String response = callGeminiAPI(prompt);
            return parseSpecificQueries(response);

        } catch (Exception e) {
            logger.error("Error generating specific queries with Gemini: {}", e.getMessage());
            return getDefaultSpecificQueries(topic, contentType);
        }
    }

    private String callGeminiAPI(String prompt) {
        try {
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();

            // Contents array
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();

            // Parts array
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            parts.add(part);

            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 1000);
            requestBody.put("generationConfig", generationConfig);

            String response = webClient.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key="
                            + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            // Parse response
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode candidates = jsonResponse.get("candidates");
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content1 = firstCandidate.get("content");
                if (content1 != null) {
                    JsonNode parts1 = content1.get("parts");
                    if (parts1 != null && parts1.isArray() && parts1.size() > 0) {
                        JsonNode firstPart = parts1.get(0);
                        JsonNode text = firstPart.get("text");
                        if (text != null) {
                            return text.asText();
                        }
                    }
                }
            }

            return "";

        } catch (WebClientResponseException e) {
            logger.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API call failed", e);
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed", e);
        }
    }

    private String buildSearchSuggestionsPrompt(String topic, String subject, String difficulty) {
        return String.format(
                """
                        As an expert educational content curator, generate 5-7 highly specific and precise search queries for finding quality learning resources about "%s" in "%s" at %s level.

                        CRITICAL REQUIREMENTS for precision:
                        - Use exact technical terminology and domain-specific keywords
                        - Include specific content format indicators (tutorial, guide, explanation, example)
                        - Add difficulty level modifiers (beginner, intermediate, advanced, complete)
                        - Focus on actionable learning outcomes rather than broad topics
                        - Generate clean, platform-agnostic queries suitable for any educational platform

                        Optimal query patterns:
                        - "[topic] tutorial [level]"
                        - "learn [specific concept] [format]"
                        - "[topic] explained [style]"
                        - "[topic] [methodology/approach]"
                        - "[concept] analysis [domain]"
                        - "[technique] implementation [field]"
                        - "[topic] guide [practical/complete]"
                        - "how to [specific action] [context]"
                        - "[tool/method] walkthrough"

                        Generate queries that are:
                        1. Specific enough to avoid irrelevant results
                        2. Technical enough to find quality educational content
                        3. Structured to match how educators and students actually search
                        4. Clean and without platform-specific prefixes or indicators

                        Format as numbered list. Each query should be 3-8 words and immediately actionable.
                        Do NOT include platform names or prefixes like "YouTube:", "Google Scholar:", etc.

                        Example quality level:
                        ❌ Bad: "machine learning"
                        ❌ Bad: "YouTube: machine learning tutorial"
                        ✅ Good: "supervised learning algorithms explained python"
                        ✅ Good: "neural network backpropagation tutorial beginner"
                        ✅ Good: "classification algorithms comparison guide"
                        """,
                topic, subject, difficulty);
    }

    private String buildContentAnalysisPrompt(String content, String context) {
        return String.format(
                """
                        PRECISE CONTENT ANALYSIS FOR EDUCATIONAL RESOURCE DISCOVERY

                        Analyze this educational content and generate 5-6 laser-focused search queries that will find the most relevant supplementary resources:

                        Content Sample: "%s"
                        Context/Source: "%s"

                        Extract and target these specific elements:
                        🎯 KEY CONCEPTS: Identify 2-3 core technical terms or concepts
                        🎯 SKILL LEVEL: Determine prerequisite knowledge and target difficulty
                        🎯 PRACTICAL APPLICATIONS: Find specific use cases or examples mentioned
                        🎯 RELATED TECHNOLOGIES/TOOLS: Identify software, frameworks, or methodologies
                        🎯 LEARNING GAPS: Determine what supporting knowledge students need

                        Generate clean, platform-agnostic search queries optimized for educational content discovery:
                        - "[core concept] [practical application] tutorial [skill level]"
                        - "[technique/method] [domain application] analysis"
                        - "how to implement [specific approach] [context]"
                        - "[challenge type] solution [technology/field]"
                        - "[concept] explained [level]"
                        - "[tool/method] walkthrough [application]"

                        Requirements:
                        - Each query must be 4-8 words maximum
                        - Include specific technical terms found in the content
                        - Target the exact knowledge gaps this content creates
                        - Generate clean queries without platform prefixes or indicators
                        - Do NOT include platform names like "YouTube:", "Google Scholar:", etc.
                        - Use search terms that educational content creators actually use
                        - Prioritize queries that will find step-by-step guidance

                        Format as numbered list with actionable, specific queries only.
                        """,
                content.length() > 800 ? content.substring(0, 800) + "..." : content, context);
    }

    private String buildSpecificQueriesPrompt(String topic, String contentType) {
        return String.format("""
                PLATFORM-OPTIMIZED QUERY GENERATION

                Generate 4-5 ultra-specific search queries optimized for finding "%s" content about "%s".

                Target Content Type: %s

                Platform-Specific Optimization Rules:

                🎥 For VIDEO content (YouTube, Vimeo):
                - Include: "tutorial", "explained", "how to", "step by step", "complete guide"
                - Add engagement terms: "easy", "quick", "comprehensive", "practical"
                - Include skill indicators: "beginner", "advanced", "from scratch"

                📄 For ARTICLE/RESEARCH content (Scholar, journals):
                - Include: "analysis", "study", "research", "methodology", "implementation"
                - Add academic terms: "comprehensive", "systematic", "empirical", "evaluation"
                - Include domain specifics: field-specific terminology

                📝 For BLOG/TUTORIAL content (Medium, dev blogs):
                - Include: "guide", "walkthrough", "hands-on", "practical", "real-world"
                - Add project terms: "build", "create", "implement", "develop"
                - Include tool specifics: programming languages, frameworks, platforms

                Each query must:
                ✅ Be 3-7 words long
                ✅ Include the main topic + specific learning objective
                ✅ Use terms that content creators actually tag their content with
                ✅ Target the specific content format requested
                ✅ Be precise enough to filter out irrelevant results

                Format as numbered list with immediately searchable queries.
                """, contentType, topic, contentType);
    }

    private List<String> parseSearchSuggestions(String suggestions) {
        List<String> result = new ArrayList<>();
        String[] lines = suggestions.split("\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.matches("^\\d+\\.\\s*(.+)")) {
                // Extract the text after the number and dot
                String suggestion = line.replaceFirst("^\\d+\\.\\s*", "").trim();

                // Clean any platform prefixes that might have slipped through
                suggestion = cleanPlatformPrefixes(suggestion);

                if (!suggestion.isEmpty()) {
                    result.add(suggestion);
                }
            }
        }

        return result.isEmpty() ? getDefaultSearchSuggestions("general") : result;
    }

    /**
     * Clean platform-specific prefixes from search suggestions
     */
    private String cleanPlatformPrefixes(String suggestion) {
        // Remove platform prefixes like "YouTube:", "Google Scholar:", etc.
        suggestion = suggestion.replaceAll("^\\*\\*[^:]+:\\*\\*\\s*", ""); // **Platform:** prefix
        suggestion = suggestion.replaceAll("^[^:]+:\\s*", ""); // Platform: prefix
        suggestion = suggestion.replaceAll("^📺\\s*", ""); // YouTube emoji
        suggestion = suggestion.replaceAll("^📚\\s*", ""); // Scholar emoji
        suggestion = suggestion.replaceAll("^📝\\s*", ""); // Blog emoji
        suggestion = suggestion.replaceAll("^YouTube:\\s*", ""); // Explicit YouTube prefix
        suggestion = suggestion.replaceAll("^Google Scholar:\\s*", ""); // Explicit Scholar prefix
        suggestion = suggestion.replaceAll("^Blogs?/Articles?:\\s*", ""); // Blog/Article prefix

        // Remove quotes if the entire suggestion is quoted
        if (suggestion.startsWith("\"") && suggestion.endsWith("\"")) {
            suggestion = suggestion.substring(1, suggestion.length() - 1);
        }

        return suggestion.trim();
    }

    private List<String> parseContentSuggestions(String suggestions) {
        List<String> result = new ArrayList<>();
        String[] lines = suggestions.split("\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.matches("^\\d+\\.\\s*(.+)") || line.matches("^-\\s*(.+)")) {
                // Extract the text after the number/bullet and dot/dash
                String suggestion = line.replaceFirst("^[\\d\\-]+\\.?\\s*", "").trim();

                // Clean any platform prefixes that might have slipped through
                suggestion = cleanPlatformPrefixes(suggestion);

                if (!suggestion.isEmpty()) {
                    result.add(suggestion);
                }
            }
        }

        return result.isEmpty() ? getDefaultContentSuggestions("general") : result;
    }

    private List<String> parseSpecificQueries(String queries) {
        List<String> result = new ArrayList<>();
        String[] lines = queries.split("\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.matches("^\\d+\\.\\s*(.+)")) {
                String query = line.replaceFirst("^\\d+\\.\\s*", "").trim();
                if (!query.isEmpty()) {
                    result.add(query);
                }
            }
        }

        return result.isEmpty() ? getDefaultSpecificQueries("general", "tutorial") : result;
    }

    private List<String> getDefaultSearchSuggestions(String topic) {
        return Arrays.asList(
                topic + " tutorial for beginners",
                topic + " explained simply",
                topic + " step by step guide",
                "learn " + topic + " basics",
                topic + " practice problems");
    }

    private List<String> getDefaultContentSuggestions(String content) {
        return Arrays.asList(
                "tutorial basics explanation",
                "practice examples",
                "step by step guide",
                "beginner friendly",
                "comprehensive overview");
    }

    private List<String> getDefaultSpecificQueries(String topic, String contentType) {
        return Arrays.asList(
                topic + " " + contentType,
                "learn " + topic + " " + contentType,
                topic + " " + contentType + " guide",
                "best " + topic + " " + contentType);
    }
}