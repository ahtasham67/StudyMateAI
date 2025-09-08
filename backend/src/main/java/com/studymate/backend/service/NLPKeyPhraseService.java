package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;

@Service
public class NLPKeyPhraseService {

    private final StanfordCoreNLP pipeline;

    public NLPKeyPhraseService() {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner");
        props.setProperty("ner.useSUTime", "false");
        this.pipeline = new StanfordCoreNLP(props);
    }

    public List<String> extractKeyPhrases(String text) {
        List<String> keyPhrases = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return keyPhrases;
        }

        // For very large texts, use fast simple extraction instead of full NLP
        if (text.length() > 3000) {
            return extractKeyPhrasesSimple(text);
        }

        try {
            // Optimize for performance: process in smaller chunks if text is very long
            String processableText = text.length() > 1500 ? text.substring(0, 1500) : text;

            // Create annotation
            Annotation document = new Annotation(processableText);
            pipeline.annotate(document);

            // Extract sentences
            List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);

            for (CoreMap sentence : sentences) {
                List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);

                // Extract named entities
                extractNamedEntities(tokens, keyPhrases);

                // Extract important noun phrases
                extractNounPhrases(tokens, keyPhrases);

                // Extract technical terms (words with specific POS patterns)
                extractTechnicalTerms(tokens, keyPhrases);
            }

            // Remove duplicates and filter by relevance
            return keyPhrases.stream()
                    .distinct()
                    .filter(phrase -> isRelevantKeyPhrase(phrase))
                    .limit(10) // Limit to top 10 key phrases
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error in NLP key phrase extraction: " + e.getMessage());
            return keyPhrases;
        }
    }

    private void extractNamedEntities(List<CoreLabel> tokens, List<String> keyPhrases) {
        StringBuilder currentEntity = new StringBuilder();
        String currentEntityType = null;

        for (CoreLabel token : tokens) {
            String ner = token.get(CoreAnnotations.NamedEntityTagAnnotation.class);
            String word = token.get(CoreAnnotations.TextAnnotation.class);

            if (!"O".equals(ner)) {
                if (currentEntityType == null || currentEntityType.equals(ner)) {
                    if (currentEntity.length() > 0) {
                        currentEntity.append(" ");
                    }
                    currentEntity.append(word);
                    currentEntityType = ner;
                } else {
                    // Different entity type, save previous and start new
                    if (currentEntity.length() > 0) {
                        keyPhrases.add(currentEntity.toString().trim());
                    }
                    currentEntity = new StringBuilder(word);
                    currentEntityType = ner;
                }
            } else {
                // End of entity
                if (currentEntity.length() > 0) {
                    keyPhrases.add(currentEntity.toString().trim());
                    currentEntity = new StringBuilder();
                    currentEntityType = null;
                }
            }
        }

        // Add final entity if exists
        if (currentEntity.length() > 0) {
            keyPhrases.add(currentEntity.toString().trim());
        }
    }

    private void extractNounPhrases(List<CoreLabel> tokens, List<String> keyPhrases) {
        StringBuilder nounPhrase = new StringBuilder();

        for (CoreLabel token : tokens) {
            String pos = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
            String word = token.get(CoreAnnotations.TextAnnotation.class);

            // Look for noun phrases (NN, NNS, NNP, NNPS) and adjectives (JJ, JJR, JJS)
            if (pos.startsWith("NN") || pos.startsWith("JJ")) {
                if (nounPhrase.length() > 0) {
                    nounPhrase.append(" ");
                }
                nounPhrase.append(word);
            } else {
                if (nounPhrase.length() > 0 && isValidNounPhrase(nounPhrase.toString())) {
                    keyPhrases.add(nounPhrase.toString().trim());
                }
                nounPhrase = new StringBuilder();
            }
        }

        // Add final noun phrase if exists
        if (nounPhrase.length() > 0 && isValidNounPhrase(nounPhrase.toString())) {
            keyPhrases.add(nounPhrase.toString().trim());
        }
    }

    private void extractTechnicalTerms(List<CoreLabel> tokens, List<String> keyPhrases) {
        for (CoreLabel token : tokens) {
            String word = token.get(CoreAnnotations.TextAnnotation.class);
            String pos = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);

            // Extract technical terms (proper nouns, foreign words, etc.)
            if (pos.equals("NNP") || pos.equals("FW") || isTechnicalTerm(word)) {
                keyPhrases.add(word);
            }
        }
    }

    private boolean isRelevantKeyPhrase(String phrase) {
        if (phrase == null || phrase.trim().length() < 2) {
            return false;
        }

        // Filter out common stop words and irrelevant phrases
        String lowercasePhrase = phrase.toLowerCase().trim();

        // Skip very common words
        List<String> stopWords = List.of("the", "is", "at", "which", "on", "and", "or", "but",
                "in", "with", "to", "for", "of", "as", "by", "this", "that");

        if (stopWords.contains(lowercasePhrase)) {
            return false;
        }

        // Must have at least one alphabetic character
        if (!phrase.matches(".*[a-zA-Z].*")) {
            return false;
        }

        // Prefer longer phrases (2+ words) or technical single words
        return phrase.split("\\s+").length > 1 || isTechnicalTerm(phrase);
    }

    private boolean isValidNounPhrase(String phrase) {
        return phrase.length() > 2 && phrase.split("\\s+").length <= 4; // Max 4 words
    }

    private boolean isTechnicalTerm(String word) {
        // Identify technical terms by patterns
        return word.length() > 4 &&
                (word.matches(".*[A-Z].*") || // Contains uppercase
                        word.contains("_") || // Contains underscore
                        word.matches(".*\\d.*")); // Contains numbers
    }

    // Fast simple key phrase extraction for very large texts
    private List<String> extractKeyPhrasesSimple(String text) {
        List<String> keyPhrases = new ArrayList<>();

        // Use simple regex-based extraction for performance
        String[] words = text.toLowerCase().split("\\W+");

        // Look for capitalized words (proper nouns) in original text
        String[] sentences = text.split("[.!?]+");
        for (String sentence : sentences) {
            // Extract words that start with capital letters (likely important)
            String[] sentenceWords = sentence.trim().split("\\s+");
            for (String word : sentenceWords) {
                if (word.length() > 3 && Character.isUpperCase(word.charAt(0))) {
                    // Remove punctuation
                    String cleanWord = word.replaceAll("[^a-zA-Z0-9\\s]", "");
                    if (cleanWord.length() > 3) {
                        keyPhrases.add(cleanWord);
                    }
                }
            }
        }

        // Add common technical terms and important words
        for (String word : words) {
            if (word.length() > 5 && (word.contains("tion") ||
                    word.contains("ment") ||
                    word.contains("ness") ||
                    word.contains("ing") ||
                    word.matches(".*[0-9].*"))) {
                keyPhrases.add(word);
            }
        }

        // Remove duplicates and limit results
        return keyPhrases.stream()
                .distinct()
                .limit(8)
                .collect(Collectors.toList());
    }
}
