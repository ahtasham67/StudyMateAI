package com.studymate.backend.service;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.studymate.backend.model.KnowledgeEntity;

import jakarta.annotation.PostConstruct;

@Service
public class OpenNLPService {

    private boolean nlpAvailable = false;

    // Technical term patterns for academic content
    private static final Pattern TECHNICAL_TERM_PATTERN = Pattern.compile(
            "\\b(?:[A-Z][a-z]*(?:[A-Z][a-z]*)*|[a-z]+(?:-[a-z]+)*|[A-Z]{2,})\\b");

    // Common academic prefixes/suffixes
    private static final Pattern ACADEMIC_PATTERN = Pattern.compile(
            "\\b\\w*(?:ology|ography|ometry|icism|ization|ation|tion|sion|ness|ment|able|ible)\\b");

    // Computer Science terms
    private static final Set<String> CS_TERMS = Set.of(
            "algorithm", "data", "structure", "programming", "software", "hardware", "database",
            "network", "security", "encryption", "api", "framework", "compiler", "interpreter",
            "object", "class", "function", "variable", "array", "list", "tree", "graph",
            "recursion", "iteration", "optimization", "complexity", "binary", "hexadecimal");

    // Mathematics terms
    private static final Set<String> MATH_TERMS = Set.of(
            "equation", "function", "derivative", "integral", "matrix", "vector", "algebra",
            "calculus", "geometry", "trigonometry", "statistics", "probability", "theorem",
            "proof", "hypothesis", "variable", "constant", "coefficient", "polynomial");

    @PostConstruct
    public void init() {
        try {
            nlpAvailable = true;
            System.out.println("OpenNLP Service initialized successfully (fast startup without external models)!");
        } catch (Exception e) {
            System.err.println("OpenNLP initialization failed: " + e.getMessage());
            nlpAvailable = false;
        }
    }

    /**
     * Fast named entity extraction using pattern matching and domain knowledge
     */
    public Set<KnowledgeEntity> extractNamedEntities(String text, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return entities;
        }

        try {
            // Split into sentences using simple punctuation
            String[] sentences = text.split("[.!?]+");

            for (String sentence : sentences) {
                // Extract entities from each sentence
                entities.addAll(extractEntitiesFromSentence(sentence.trim(), course));
            }

        } catch (Exception e) {
            System.err.println("OpenNLP extraction failed, using simple fallback: " + e.getMessage());
            return extractEntitiesSimple(text, course);
        }

        return entities;
    }

    private Set<KnowledgeEntity> extractEntitiesFromSentence(String sentence, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        if (sentence.isEmpty()) {
            return entities;
        }

        // Simple tokenization
        String[] words = sentence.split("\\s+");

        for (String word : words) {
            // Clean the word
            String cleanWord = word.replaceAll("[^a-zA-Z0-9-]", "").trim();

            if (cleanWord.length() < 3 || isCommonWord(cleanWord)) {
                continue;
            }

            // Extract different types of entities
            KnowledgeEntity entity = identifyEntity(cleanWord, course);
            if (entity != null) {
                entities.add(entity);
            }
        }

        return entities;
    }

    private KnowledgeEntity identifyEntity(String word, String course) {
        String lowerWord = word.toLowerCase();

        // Check for proper nouns (capitalized words - likely names or places)
        if (Character.isUpperCase(word.charAt(0)) && word.length() > 3) {
            if (isLikelyPersonName(word)) {
                return new KnowledgeEntity(word, "PERSON",
                        "Person mentioned in " + course, 0.7);
            } else if (isLikelyLocationOrOrganization(word)) {
                return new KnowledgeEntity(word, "ORGANIZATION",
                        "Organization/Location mentioned in " + course, 0.6);
            }
        }

        // Check for domain-specific terms
        if (CS_TERMS.contains(lowerWord)) {
            return new KnowledgeEntity(word, "CS_CONCEPT",
                    "Computer Science concept from " + course, 0.8);
        }

        if (MATH_TERMS.contains(lowerWord)) {
            return new KnowledgeEntity(word, "MATH_CONCEPT",
                    "Mathematics concept from " + course, 0.8);
        }

        // Check for technical patterns
        if (TECHNICAL_TERM_PATTERN.matcher(word).matches() && word.length() > 4) {
            String entityType = determineEntityType(word, course);
            double confidence = calculateTermConfidence(word);

            return new KnowledgeEntity(word, entityType,
                    generateTermDescription(word, course), confidence);
        }

        // Check for academic suffixes
        if (ACADEMIC_PATTERN.matcher(lowerWord).matches()) {
            return new KnowledgeEntity(word, "CONCEPT",
                    "Academic concept from " + course, 0.6);
        }

        return null;
    }

    private boolean isLikelyPersonName(String word) {
        // Simple heuristics for person names
        return word.length() >= 3 && word.length() <= 15 &&
                Character.isUpperCase(word.charAt(0)) &&
                word.matches("^[A-Z][a-z]+$");
    }

    private boolean isLikelyLocationOrOrganization(String word) {
        // Simple heuristics for locations/organizations
        return word.length() >= 4 &&
                (word.endsWith("Corp") || word.endsWith("Inc") || word.endsWith("Ltd") ||
                        word.endsWith("University") || word.endsWith("College") ||
                        word.endsWith("Institute") || word.endsWith("Company"));
    }

    private String determineEntityType(String word, String course) {
        if (course != null) {
            String lowerCourse = course.toLowerCase();
            if (lowerCourse.contains("computer") || lowerCourse.contains("cs") ||
                    lowerCourse.contains("programming") || lowerCourse.contains("software")) {
                return "CS_CONCEPT";
            } else if (lowerCourse.contains("math") || lowerCourse.contains("calculus") ||
                    lowerCourse.contains("algebra") || lowerCourse.contains("statistics")) {
                return "MATH_CONCEPT";
            }
        }

        // General classification
        if (ACADEMIC_PATTERN.matcher(word.toLowerCase()).matches()) {
            return "CONCEPT";
        }

        return "TERM";
    }

    private double calculateTermConfidence(String word) {
        double confidence = 0.5; // Base confidence

        // Increase confidence for longer terms
        if (word.length() > 6) {
            confidence += 0.1;
        }

        // Increase confidence for mixed case (likely technical)
        if (word.matches(".*[A-Z].*[a-z].*")) {
            confidence += 0.2;
        }

        // Increase confidence for academic patterns
        if (ACADEMIC_PATTERN.matcher(word.toLowerCase()).matches()) {
            confidence += 0.2;
        }

        return Math.min(confidence, 0.9);
    }

    private String generateTermDescription(String word, String course) {
        return "Technical term from " + (course != null ? course : "academic content");
    }

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

    /**
     * Simple fallback extraction when advanced processing fails
     */
    private Set<KnowledgeEntity> extractEntitiesSimple(String text, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return entities;
        }

        // Simple regex-based extraction
        String[] words = text.split("\\s+");
        for (String word : words) {
            word = word.replaceAll("[^a-zA-Z0-9]", "");
            if (word.length() > 4 && Character.isUpperCase(word.charAt(0))) {
                entities.add(new KnowledgeEntity(word, "TERM",
                        "Term from " + course, 0.5));
            }
        }

        return entities;
    }

    public boolean isNlpAvailable() {
        return nlpAvailable;
    }
}