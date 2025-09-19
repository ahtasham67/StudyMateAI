package com.studymate.backend.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studymate.backend.model.KnowledgeEntity;

import jakarta.annotation.PostConstruct;

@Service
public class NLPService {

    @Autowired
    private OpenNLPService openNLPService;

    @PostConstruct
    public void init() {
        System.out.println("NLPService initialized using OpenNLP for fast processing!");
    }

    /**
     * Extract named entities using OpenNLP (fast and efficient)
     */
    public Set<KnowledgeEntity> extractNamedEntities(String text, String course) {
        if (openNLPService.isNlpAvailable()) {
            try {
                long startTime = System.currentTimeMillis();
                Set<KnowledgeEntity> entities = openNLPService.extractNamedEntities(text, course);
                long endTime = System.currentTimeMillis();
                System.out.println("OpenNLP extraction completed in " + (endTime - startTime) + "ms");
                return entities;
            } catch (Exception e) {
                System.err.println("OpenNLP extraction failed: " + e.getMessage());
            }
        }

        // Fallback to simple extraction
        return extractEntitiesSimple(text, course);
    }

    /**
     * Extract key phrases using simple pattern matching
     */
    public Set<String> extractKeyPhrases(String text) {
        return extractKeyPhrasesSimple(text);
    }

    /**
     * Simple fallback entity extraction
     */
    private Set<KnowledgeEntity> extractEntitiesSimple(String text, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return entities;
        }

        // Simple regex-based extraction for fallback
        String[] words = text.split("\\s+");
        for (String word : words) {
            word = word.replaceAll("[^a-zA-Z0-9]", "");
            if (word.length() > 4 && Character.isUpperCase(word.charAt(0)) && !isCommonWord(word)) {
                entities.add(new KnowledgeEntity(word, "TERM",
                        "Term from " + course, 0.5));
            }
        }

        return entities;
    }

    /**
     * Simple key phrase extraction fallback
     */
    private Set<String> extractKeyPhrasesSimple(String text) {
        Set<String> keyPhrases = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return keyPhrases;
        }

        // Extract potential key phrases using simple patterns
        String[] sentences = text.split("[.!?]+");
        for (String sentence : sentences) {
            String[] words = sentence.trim().split("\\s+");

            // Look for noun phrases (2-4 consecutive capitalized or longer words)
            for (int i = 0; i < words.length - 1; i++) {
                StringBuilder phrase = new StringBuilder();
                int wordCount = 0;

                for (int j = i; j < Math.min(i + 4, words.length); j++) {
                    String cleanWord = words[j].replaceAll("[^a-zA-Z0-9]", "");

                    if (cleanWord.length() > 3 &&
                            (Character.isUpperCase(cleanWord.charAt(0)) || cleanWord.length() > 6)) {
                        if (phrase.length() > 0)
                            phrase.append(" ");
                        phrase.append(cleanWord);
                        wordCount++;
                    } else {
                        break;
                    }
                }

                if (wordCount >= 2 && phrase.length() > 6) {
                    keyPhrases.add(phrase.toString());
                }
            }
        }

        return keyPhrases;
    }

    /**
     * Analyze sentiment of text using simple pattern matching
     */
    public String analyzeSentiment(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "NEUTRAL";
        }

        String lowerText = text.toLowerCase();

        // Simple sentiment analysis using keyword matching
        int positiveScore = 0;
        int negativeScore = 0;

        // Positive words
        String[] positiveWords = { "good", "great", "excellent", "amazing", "awesome", "helpful",
                "useful", "clear", "easy", "understand", "love", "like", "best",
                "perfect", "wonderful", "fantastic", "brilliant" };

        // Negative words
        String[] negativeWords = { "bad", "terrible", "awful", "hate", "difficult", "hard",
                "confusing", "unclear", "wrong", "problem", "issue", "error",
                "fail", "worst", "horrible", "poor" };

        for (String word : positiveWords) {
            if (lowerText.contains(word)) {
                positiveScore++;
            }
        }

        for (String word : negativeWords) {
            if (lowerText.contains(word)) {
                negativeScore++;
            }
        }

        if (positiveScore > negativeScore) {
            return "POSITIVE";
        } else if (negativeScore > positiveScore) {
            return "NEGATIVE";
        } else {
            return "NEUTRAL";
        }
    }

    /**
     * Check if word is a common word that should be ignored
     */
    private boolean isCommonWord(String word) {
        String lower = word.toLowerCase();
        Set<String> commonWords = Set.of(
                "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
                "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does",
                "did", "will", "would", "could", "should", "may", "might", "can", "this",
                "that", "these", "those", "all", "any", "some", "many", "much", "more", "most",
                "other", "another", "such", "what", "which", "who", "when", "where", "why", "how");
        return commonWords.contains(lower);
    }
}