package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import org.springframework.stereotype.Service;

@Service
public class NLPKeyPhraseService {

    public List<String> extractKeyPhrases(String text) {
        List<String> keyPhrases = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return keyPhrases;
        }

        try {
            Set<String> phrases = extractKeyPhrasesSimple(text);
            keyPhrases.addAll(phrases);
        } catch (Exception e) {
            System.err.println("Key phrase extraction failed: " + e.getMessage());
        }

        return keyPhrases;
    }

    private Set<String> extractKeyPhrasesSimple(String text) {
        Set<String> keyPhrases = new HashSet<>();

        if (text == null || text.trim().isEmpty()) {
            return keyPhrases;
        }

        String[] sentences = text.split("[.!?]+");
        for (String sentence : sentences) {
            String[] words = sentence.trim().split("\\s+");

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
}
