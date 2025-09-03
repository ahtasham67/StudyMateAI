package com.studymate.backend.service;

import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.studymate.backend.model.KnowledgeEntity;

import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;
import jakarta.annotation.PostConstruct;

@Service
public class NLPService {

    private StanfordCoreNLP pipeline;
    private boolean nlpAvailable = false;

    @PostConstruct
    public void init() {
        try {
            // Initialize Stanford CoreNLP with basic annotators (excluding problematic
            // ones)
            Properties props = new Properties();
            props.setProperty("annotators", "tokenize,pos,lemma,ner");
            props.setProperty("timeout", "30000");
            props.setProperty("ner.useSUTime", "false"); // Disable SUTime to avoid initialization issues

            this.pipeline = new StanfordCoreNLP(props);
            nlpAvailable = true;
            System.out.println("Stanford CoreNLP pipeline initialized successfully!");
        } catch (Exception e) {
            System.err.println("Stanford CoreNLP not available, using fallback methods: " + e.getMessage());
            nlpAvailable = false;
        }
    }

    /**
     * Extract named entities using Stanford CoreNLP or fallback methods
     */
    public Set<KnowledgeEntity> extractNamedEntities(String text, String course) {
        if (nlpAvailable && pipeline != null) {
            try {
                return extractEntitiesWithCoreNLP(text, course);
            } catch (Exception e) {
                System.err.println("CoreNLP extraction failed, using fallback: " + e.getMessage());
            }
        }

        // Fallback to simple extraction
        return extractEntitiesSimple(text, course);
    }

    private Set<KnowledgeEntity> extractEntitiesWithCoreNLP(String text, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Create an annotation object with the text
        Annotation document = new Annotation(text);

        // Run all annotators on this text
        pipeline.annotate(document);

        // Get sentences
        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);

        for (CoreMap sentence : sentences) {
            // Get tokens for each sentence
            List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);

            for (CoreLabel token : tokens) {
                String word = token.get(CoreAnnotations.TextAnnotation.class);
                String nerTag = token.get(CoreAnnotations.NamedEntityTagAnnotation.class);
                String pos = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
                String lemma = token.get(CoreAnnotations.LemmaAnnotation.class);

                // Process named entities
                if (nerTag != null && !nerTag.equals("O") && word.length() > 2) {
                    double confidence = calculateEntityConfidence(nerTag, pos, word);
                    String entityType = mapNERTagToEntityType(nerTag);
                    String description = generateEntityDescription(nerTag, course);

                    entities.add(new KnowledgeEntity(word, entityType, description, confidence));
                }

                // Extract important nouns and technical terms
                if (isImportantTerm(pos, lemma, word)) {
                    entities.add(new KnowledgeEntity(lemma, "TERM",
                            "Important term from " + course, 0.7));
                }
            }
        }

        return entities;
    }

    /**
     * Fallback entity extraction when CoreNLP is not available
     */
    private Set<KnowledgeEntity> extractEntitiesSimple(String text, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Simple regex-based extraction
        String[] words = text.split("\\s+");

        for (String word : words) {
            // Look for capitalized words that might be entities
            if (word.matches("[A-Z][a-z]+") && word.length() > 3 && !isCommonWord(word)) {
                entities.add(new KnowledgeEntity(word, "TERM",
                        "Potential entity from " + course, 0.6));
            }

            // Look for technical terms (words with mixed case or containing numbers)
            if (word.matches(".*[A-Z].*[a-z].*") || word.matches(".*\\d.*")) {
                if (word.length() > 3 && !isCommonWord(word)) {
                    entities.add(new KnowledgeEntity(word, "TECHNICAL_TERM",
                            "Technical term from " + course, 0.7));
                }
            }
        }

        return entities;
    }

    /**
     * Extract key phrases using Stanford CoreNLP
     */
    public Set<String> extractKeyPhrases(String text) {
        if (nlpAvailable && pipeline != null) {
            try {
                return extractKeyPhrasesWithCoreNLP(text);
            } catch (Exception e) {
                System.err.println("CoreNLP key phrase extraction failed, using simple method: " + e.getMessage());
            }
        }

        // Simple key phrase extraction
        return extractKeyPhrasesSimple(text);
    }

    private Set<String> extractKeyPhrasesWithCoreNLP(String text) {
        Set<String> keyPhrases = new HashSet<>();

        Annotation document = new Annotation(text);
        pipeline.annotate(document);

        List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);

        for (CoreMap sentence : sentences) {
            List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);

            // Extract noun phrases
            StringBuilder currentPhrase = new StringBuilder();
            boolean inNounPhrase = false;

            for (CoreLabel token : tokens) {
                String pos = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
                String word = token.get(CoreAnnotations.TextAnnotation.class);

                if (pos.startsWith("NN") || pos.startsWith("JJ")) {
                    if (!inNounPhrase) {
                        currentPhrase = new StringBuilder();
                        inNounPhrase = true;
                    }
                    currentPhrase.append(word).append(" ");
                } else {
                    if (inNounPhrase && currentPhrase.length() > 0) {
                        String phrase = currentPhrase.toString().trim();
                        if (phrase.length() > 3 && phrase.split(" ").length <= 4) {
                            keyPhrases.add(phrase);
                        }
                    }
                    inNounPhrase = false;
                }
            }

            // Don't forget the last phrase
            if (inNounPhrase && currentPhrase.length() > 0) {
                String phrase = currentPhrase.toString().trim();
                if (phrase.length() > 3) {
                    keyPhrases.add(phrase);
                }
            }
        }

        return keyPhrases;
    }

    private Set<String> extractKeyPhrasesSimple(String text) {
        Set<String> keyPhrases = new HashSet<>();

        // Extract noun phrases using simple patterns
        String[] sentences = text.split("\\. ");

        for (String sentence : sentences) {
            String[] words = sentence.split("\\s+");

            for (int i = 0; i < words.length - 1; i++) {
                // Look for adjective + noun combinations
                if (words[i].matches("[A-Z][a-z]+") && words[i + 1].matches("[a-z]+")) {
                    String phrase = words[i] + " " + words[i + 1];
                    if (phrase.length() > 5 && !containsCommonWord(phrase)) {
                        keyPhrases.add(phrase);
                    }
                }

                // Look for noun + noun combinations
                if (words[i].matches("[a-z]+") && words[i + 1].matches("[a-z]+") &&
                        words[i].length() > 3 && words[i + 1].length() > 3) {
                    String phrase = words[i] + " " + words[i + 1];
                    if (!containsCommonWord(phrase)) {
                        keyPhrases.add(phrase);
                    }
                }
            }
        }

        return keyPhrases;
    }

    /**
     * Analyze sentiment using simple heuristics
     */
    public String analyzeSentiment(String text) {
        String lowerText = text.toLowerCase();

        // Simple sentiment analysis based on keywords
        int positiveCount = 0;
        int negativeCount = 0;

        String[] positiveWords = { "good", "great", "excellent", "amazing", "wonderful", "helpful", "useful", "clear" };
        String[] negativeWords = { "bad", "terrible", "awful", "confusing", "difficult", "hard", "problem", "issue" };

        for (String word : positiveWords) {
            if (lowerText.contains(word))
                positiveCount++;
        }

        for (String word : negativeWords) {
            if (lowerText.contains(word))
                negativeCount++;
        }

        if (positiveCount > negativeCount)
            return "Positive";
        if (negativeCount > positiveCount)
            return "Negative";
        return "Neutral";
    }

    // Helper methods
    private double calculateEntityConfidence(String nerTag, String pos, String word) {
        double confidence = 0.5;

        switch (nerTag) {
            case "PERSON":
                confidence = 0.9;
                break;
            case "ORGANIZATION":
                confidence = 0.85;
                break;
            case "LOCATION":
                confidence = 0.8;
                break;
            case "MISC":
                confidence = 0.6;
                break;
            case "MONEY":
                confidence = 0.75;
                break;
            case "NUMBER":
                confidence = 0.7;
                break;
            case "ORDINAL":
                confidence = 0.65;
                break;
            case "PERCENT":
                confidence = 0.7;
                break;
            case "DATE":
                confidence = 0.8;
                break;
            case "TIME":
                confidence = 0.75;
                break;
        }

        if (pos != null && pos.startsWith("NNP"))
            confidence += 0.1;
        if (word.length() > 6)
            confidence += 0.05;

        return Math.min(1.0, confidence);
    }

    private String mapNERTagToEntityType(String nerTag) {
        switch (nerTag) {
            case "PERSON":
                return "PERSON";
            case "ORGANIZATION":
                return "ORGANIZATION";
            case "LOCATION":
                return "LOCATION";
            case "MISC":
                return "CONCEPT";
            case "MONEY":
                return "MONETARY";
            case "NUMBER":
                return "NUMERIC";
            case "ORDINAL":
                return "NUMERIC";
            case "PERCENT":
                return "NUMERIC";
            case "DATE":
                return "TEMPORAL";
            case "TIME":
                return "TEMPORAL";
            default:
                return "TERM";
        }
    }

    private String generateEntityDescription(String nerTag, String course) {
        switch (nerTag) {
            case "PERSON":
                return "Person mentioned in " + course + " discussion";
            case "ORGANIZATION":
                return "Organization relevant to " + course;
            case "LOCATION":
                return "Location mentioned in " + course + " context";
            case "MONEY":
                return "Monetary value from " + course;
            case "DATE":
            case "TIME":
                return "Date/time reference in " + course;
            case "NUMBER":
            case "ORDINAL":
            case "PERCENT":
                return "Numerical data from " + course;
            default:
                return "Entity identified in " + course + " discussion";
        }
    }

    private boolean isImportantTerm(String pos, String lemma, String word) {
        if (pos == null || lemma == null || word == null) {
            return false;
        }

        return (pos.startsWith("NN") && word.length() > 4 &&
                !isCommonWord(word) &&
                (word.matches(".*[A-Z].*") || // Contains uppercase (might be technical)
                        word.matches(".*\\d.*") || // Contains numbers (might be version/model)
                        lemma.length() > 5)); // Long lemma (likely specific term)
    }

    private boolean isCommonWord(String word) {
        Set<String> commonWords = Set.of(
                "The", "This", "That", "With", "From", "When", "Where", "What", "How", "Why",
                "And", "But", "For", "Not", "You", "All", "Can", "Had", "Her", "Was", "One",
                "Will", "Would", "Could", "Should", "May", "Might", "Must", "Shall");
        return commonWords.contains(word);
    }

    private boolean containsCommonWord(String phrase) {
        String[] words = phrase.split("\\s+");
        for (String word : words) {
            if (isCommonWord(word))
                return true;
        }
        return false;
    }
}
