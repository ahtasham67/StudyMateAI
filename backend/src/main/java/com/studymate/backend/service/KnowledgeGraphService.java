package com.studymate.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.model.DiscussionThread;
import com.studymate.backend.model.KnowledgeEntity;
import com.studymate.backend.repository.KnowledgeEntityRepository;

@Service
@Transactional
public class KnowledgeGraphService {

    @Autowired
    private KnowledgeEntityRepository entityRepository;

    @Autowired(required = false) // Make it optional in case CoreNLP fails to load
    private NLPService nlpService;

    // Pre-defined knowledge patterns for different subjects
    private static final Map<String, List<String>> DOMAIN_KEYWORDS = Map.of(
            "COMPUTER_SCIENCE",
            List.of("algorithm", "data structure", "programming", "software", "database", "network", "security", "API",
                    "framework", "library"),
            "MATHEMATICS",
            List.of("theorem", "proof", "equation", "formula", "function", "derivative", "integral", "matrix", "vector",
                    "probability"),
            "PHYSICS",
            List.of("force", "energy", "momentum", "quantum", "relativity", "thermodynamics", "electromagnetic", "wave",
                    "particle", "field"),
            "CHEMISTRY",
            List.of("molecule", "atom", "bond", "reaction", "catalyst", "solution", "compound", "element", "acid",
                    "base"),
            "BIOLOGY", List.of("cell", "DNA", "protein", "enzyme", "organism", "evolution", "genetics", "metabolism",
                    "ecosystem", "species"));

    /**
     * Extract knowledge entities from thread content and its replies
     */
    public Set<KnowledgeEntity> extractEntitiesFromThread(DiscussionThread thread) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Combine thread content with all reply content
        StringBuilder allContent = new StringBuilder();
        allContent.append(thread.getTitle()).append(" ").append(thread.getContent());

        // Add content from all replies
        if (thread.getReplies() != null && !thread.getReplies().isEmpty()) {
            for (var reply : thread.getReplies()) {
                if (reply.getContent() != null && !reply.getIsDeleted()) {
                    allContent.append(" ").append(reply.getContent());
                }
            }
        }

        String combinedContent = allContent.toString();

        // Use Stanford CoreNLP if available, otherwise fall back to simpler methods
        if (nlpService != null) {
            try {
                entities.addAll(nlpService.extractNamedEntities(combinedContent, thread.getCourse()));

                // Extract key phrases using NLP
                Set<String> keyPhrases = nlpService.extractKeyPhrases(combinedContent);
                for (String phrase : keyPhrases) {
                    System.out.println("Extracted key phrase: " + phrase);

                    entities.add(new KnowledgeEntity(phrase, "KEY_PHRASE",
                            "Key phrase from " + thread.getCourse(), 0.7));
                }
            } catch (Exception e) {
                System.err.println("NLP service failed, falling back to simple extraction: " + e.getMessage());
                entities.addAll(extractEntitiesSimple(combinedContent, thread.getCourse()));
            }
        } else {
            // Fallback to simple extraction methods
            entities.addAll(extractEntitiesSimple(combinedContent, thread.getCourse()));
        }

        return entities;
    }

    /**
     * Simple entity extraction fallback method
     */
    private Set<KnowledgeEntity> extractEntitiesSimple(String content, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Extract technical terms and concepts from combined content
        entities.addAll(extractTechnicalTerms(content, course));

        // Extract named entities (proper nouns, concepts)
        entities.addAll(extractNamedEntities(content));

        // Extract course-specific concepts
        entities.addAll(extractCourseSpecificConcepts(content, course));

        return entities;
    }

    /**
     * Extract knowledge entities from a single reply
     */
    public Set<KnowledgeEntity> extractEntitiesFromReply(String replyContent, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        if (replyContent == null || replyContent.trim().isEmpty()) {
            return entities;
        }

        // Use Stanford CoreNLP if available
        if (nlpService != null) {
            try {
                entities.addAll(nlpService.extractNamedEntities(replyContent, course));

                // Extract key phrases
                Set<String> keyPhrases = nlpService.extractKeyPhrases(replyContent);
                for (String phrase : keyPhrases) {
                    System.out.println("Extracted key phrase: " + phrase);
                    entities.add(new KnowledgeEntity(phrase, "KEY_PHRASE",
                            "Key phrase from reply in " + course, 0.6));
                }
            } catch (Exception e) {
                System.err.println("NLP service failed for reply, using simple extraction: " + e.getMessage());
                entities.addAll(extractEntitiesSimpleFromReply(replyContent, course));
            }
        } else {
            entities.addAll(extractEntitiesSimpleFromReply(replyContent, course));
        }

        return entities;
    }

    /**
     * Simple entity extraction from reply fallback
     */
    private Set<KnowledgeEntity> extractEntitiesSimpleFromReply(String replyContent, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Extract technical terms and concepts
        entities.addAll(extractTechnicalTerms(replyContent, course));

        // Extract named entities (proper nouns, concepts)
        entities.addAll(extractNamedEntities(replyContent));

        // Extract course-specific concepts
        entities.addAll(extractCourseSpecificConcepts(replyContent, course));

        return entities;
    }

    /**
     * Generate AI summary based on knowledge entities from thread and replies
     */
    public String generateKnowledgeSummary(DiscussionThread thread) {
        Set<KnowledgeEntity> entities = thread.getKnowledgeEntities();
        if (entities.isEmpty()) {
            return generateBasicSummary(thread);
        }

        StringBuilder summary = new StringBuilder();

        // Group entities by type
        Map<String, List<KnowledgeEntity>> entityGroups = entities.stream()
                .collect(Collectors.groupingBy(KnowledgeEntity::getEntityType));

        summary.append("**Key Concepts:** ");

        // Add main concepts
        if (entityGroups.containsKey("CONCEPT")) {
            List<String> concepts = entityGroups.get("CONCEPT").stream()
                    .sorted((a, b) -> Double.compare(b.getConfidenceScore(), a.getConfidenceScore()))
                    .limit(3)
                    .map(KnowledgeEntity::getName)
                    .collect(Collectors.toList());
            summary.append(String.join(", ", concepts));
        }

        // Add key phrases if available
        if (entityGroups.containsKey("KEY_PHRASE")) {
            List<String> keyPhrases = entityGroups.get("KEY_PHRASE").stream()
                    .sorted((a, b) -> Double.compare(b.getConfidenceScore(), a.getConfidenceScore()))
                    .limit(2)
                    .map(KnowledgeEntity::getName)
                    .collect(Collectors.toList());
            if (!keyPhrases.isEmpty()) {
                summary.append(", ").append(String.join(", ", keyPhrases));
            }
        }

        summary.append("\n\n**Discussion Summary:** ");
        summary.append(generateBasicSummary(thread));

        // Add sentiment analysis if NLP service is available
        if (nlpService != null) {
            try {
                String sentiment = nlpService.analyzeSentiment(thread.getContent());
                summary.append("\n\n**Discussion Tone:** ").append(sentiment);
            } catch (Exception e) {
                // Ignore sentiment analysis errors
            }
        }

        // Add reply insights if there are replies
        if (thread.getReplies() != null && !thread.getReplies().isEmpty()) {
            int activeReplies = (int) thread.getReplies().stream()
                    .filter(reply -> !reply.getIsDeleted())
                    .count();
            summary.append("\n\n**Discussion Activity:** ");
            summary.append("This thread has generated ").append(activeReplies)
                    .append(" replies, indicating active community engagement on this topic.");
        }

        // Add related knowledge
        summary.append("\n\n**Related Topics:** ");
        Set<KnowledgeEntity> relatedEntities = findRelatedEntities(entities);
        if (!relatedEntities.isEmpty()) {
            List<String> relatedNames = relatedEntities.stream()
                    .limit(5)
                    .map(KnowledgeEntity::getName)
                    .collect(Collectors.toList());
            summary.append(String.join(", ", relatedNames));
        } else {
            summary.append("No strongly related topics found yet.");
        }

        return summary.toString();
    }

    /**
     * Find threads related to given entities
     */
    public List<DiscussionThread> findRelatedThreads(Set<KnowledgeEntity> entities, Long excludeThreadId) {
        Set<DiscussionThread> relatedThreads = new HashSet<>();

        for (KnowledgeEntity entity : entities) {
            relatedThreads.addAll(entity.getRelatedThreads());
        }

        return relatedThreads.stream()
                .filter(thread -> !thread.getId().equals(excludeThreadId))
                .sorted((a, b) -> b.getLastActivityAt().compareTo(a.getLastActivityAt()))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Calculate knowledge score for a thread
     */
    public Double calculateKnowledgeScore(DiscussionThread thread) {
        Set<KnowledgeEntity> entities = thread.getKnowledgeEntities();
        if (entities.isEmpty()) {
            return 0.0;
        }

        double totalScore = entities.stream()
                .mapToDouble(entity -> entity.getConfidenceScore() * entity.getFrequencyCount())
                .sum();

        double avgScore = totalScore / entities.size();

        // Boost score based on thread engagement
        double engagementBoost = Math.log(thread.getViewCount() + thread.getReplyCount() + 1) * 0.1;

        return Math.min(1.0, avgScore + engagementBoost);
    }

    /**
     * Process thread and update knowledge graph
     */
    @Transactional
    public void processThreadForKnowledgeGraph(DiscussionThread thread) {
        // Extract entities
        Set<KnowledgeEntity> extractedEntities = extractEntitiesFromThread(thread);

        // Save or update entities
        Set<KnowledgeEntity> persistedEntities = new HashSet<>();
        for (KnowledgeEntity entity : extractedEntities) {
            KnowledgeEntity existingEntity = entityRepository.findByNameIgnoreCase(entity.getName())
                    .orElse(null);

            if (existingEntity != null) {
                existingEntity.incrementFrequency();
                existingEntity.getRelatedThreads().add(thread);
                persistedEntities.add(entityRepository.save(existingEntity));
            } else {
                entity.getRelatedThreads().add(thread);
                persistedEntities.add(entityRepository.save(entity));
            }
        }

        // Update thread with entities
        thread.setKnowledgeEntities(persistedEntities);
        thread.setKnowledgeScore(calculateKnowledgeScore(thread));
        thread.setAiGeneratedSummary(generateKnowledgeSummary(thread));

        // Create entity relationships
        createEntityRelationships(persistedEntities);
    }

    /**
     * Process a new reply and update knowledge graph incrementally
     */
    @Transactional
    public void processReplyForKnowledgeGraph(DiscussionThread thread, String replyContent) {
        // Extract entities from the new reply
        Set<KnowledgeEntity> replyEntities = extractEntitiesFromReply(replyContent, thread.getCourse());

        if (replyEntities.isEmpty()) {
            return;
        }

        // Save or update entities
        Set<KnowledgeEntity> persistedEntities = new HashSet<>();
        for (KnowledgeEntity entity : replyEntities) {
            KnowledgeEntity existingEntity = entityRepository.findByNameIgnoreCase(entity.getName())
                    .orElse(null);

            if (existingEntity != null) {
                existingEntity.incrementFrequency();
                existingEntity.getRelatedThreads().add(thread);
                persistedEntities.add(entityRepository.save(existingEntity));
            } else {
                entity.getRelatedThreads().add(thread);
                persistedEntities.add(entityRepository.save(entity));
            }
        }

        // Add new entities to thread's existing entities
        thread.getKnowledgeEntities().addAll(persistedEntities);

        // Recalculate knowledge score and summary
        thread.setKnowledgeScore(calculateKnowledgeScore(thread));
        thread.setAiGeneratedSummary(generateKnowledgeSummary(thread));

        // Create relationships with existing entities
        createEntityRelationships(persistedEntities);

        // Create relationships between new entities and existing thread entities
        Set<KnowledgeEntity> allThreadEntities = new HashSet<>(thread.getKnowledgeEntities());
        createEntityRelationships(allThreadEntities);
    }

    // Private helper methods

    private Set<KnowledgeEntity> extractTechnicalTerms(String content, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();
        String normalizedContent = content.toLowerCase();

        // Get domain-specific keywords
        String domainKey = mapCourseToDomain(course);
        List<String> keywords = DOMAIN_KEYWORDS.getOrDefault(domainKey, new ArrayList<>());

        for (String keyword : keywords) {
            if (normalizedContent.contains(keyword.toLowerCase())) {
                entities.add(new KnowledgeEntity(keyword, "CONCEPT",
                        "Technical concept from " + course, 0.8));
            }
        }

        return entities;
    }

    private Set<KnowledgeEntity> extractNamedEntities(String content) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Simple pattern matching for capitalized terms (potential named entities)
        Pattern pattern = Pattern.compile("\\b[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\b");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String entity = matcher.group().trim();
            if (entity.length() > 2 && !isCommonWord(entity)) {
                entities.add(new KnowledgeEntity(entity, "TERM",
                        "Named entity or important term", 0.6));
            }
        }

        return entities;
    }

    private Set<KnowledgeEntity> extractCourseSpecificConcepts(String content, String course) {
        Set<KnowledgeEntity> entities = new HashSet<>();

        // Course-specific pattern matching
        if (course.toLowerCase().contains("math") || course.toLowerCase().contains("calculus")) {
            extractMathConcepts(content, entities);
        } else if (course.toLowerCase().contains("computer") || course.toLowerCase().contains("programming")) {
            extractCSConcepts(content, entities);
        }

        return entities;
    }

    private void extractMathConcepts(String content, Set<KnowledgeEntity> entities) {
        String[] mathTerms = { "derivative", "integral", "limit", "function", "theorem", "proof", "equation" };
        String lowerContent = content.toLowerCase();

        for (String term : mathTerms) {
            if (lowerContent.contains(term)) {
                entities.add(new KnowledgeEntity(term, "MATH_CONCEPT",
                        "Mathematical concept", 0.9));
            }
        }
    }

    private void extractCSConcepts(String content, Set<KnowledgeEntity> entities) {
        String[] csTerms = { "algorithm", "data structure", "recursion", "iteration", "complexity", "database", "API" };
        String lowerContent = content.toLowerCase();

        for (String term : csTerms) {
            if (lowerContent.contains(term)) {
                entities.add(new KnowledgeEntity(term, "CS_CONCEPT",
                        "Computer Science concept", 0.9));
            }
        }
    }

    private String mapCourseToDomain(String course) {
        String lowerCourse = course.toLowerCase();
        if (lowerCourse.contains("computer") || lowerCourse.contains("programming")
                || lowerCourse.contains("software")) {
            return "COMPUTER_SCIENCE";
        } else if (lowerCourse.contains("math") || lowerCourse.contains("calculus")
                || lowerCourse.contains("algebra")) {
            return "MATHEMATICS";
        } else if (lowerCourse.contains("physics")) {
            return "PHYSICS";
        } else if (lowerCourse.contains("chemistry")) {
            return "CHEMISTRY";
        } else if (lowerCourse.contains("biology")) {
            return "BIOLOGY";
        }
        return "GENERAL";
    }

    private boolean isCommonWord(String word) {
        Set<String> commonWords = Set.of("The", "This", "That", "With", "From", "When", "Where", "What", "How", "Why");
        return commonWords.contains(word);
    }

    private String generateBasicSummary(DiscussionThread thread) {
        String content = thread.getContent();

        // If thread has replies, create a more comprehensive summary
        if (thread.getReplies() != null && !thread.getReplies().isEmpty()) {
            StringBuilder combinedContent = new StringBuilder(content);

            // Add key points from replies (limit to first few replies to avoid too much
            // text)
            thread.getReplies().stream()
                    .filter(reply -> !reply.getIsDeleted())
                    .limit(3) // Only consider first 3 replies for summary
                    .forEach(reply -> {
                        if (reply.getContent().length() > 50) { // Only include substantial replies
                            combinedContent.append(" ").append(reply.getContent().substring(0,
                                    Math.min(100, reply.getContent().length()))); // First 100 chars
                        }
                    });

            content = combinedContent.toString();
        }

        if (content.length() <= 250) {
            return content;
        }

        // Simple extractive summarization - take first two sentences
        String[] sentences = content.split("\\. ");
        if (sentences.length >= 2) {
            return sentences[0] + ". " + sentences[1] + ".";
        }

        return content.substring(0, 250) + "...";
    }

    private Set<KnowledgeEntity> findRelatedEntities(Set<KnowledgeEntity> entities) {
        Set<KnowledgeEntity> related = new HashSet<>();

        for (KnowledgeEntity entity : entities) {
            related.addAll(entity.getRelatedEntities());
        }

        return related.stream()
                .filter(e -> !entities.contains(e))
                .collect(Collectors.toSet());
    }

    private void createEntityRelationships(Set<KnowledgeEntity> entities) {
        // Create relationships between entities that appear in the same thread
        List<KnowledgeEntity> entityList = new ArrayList<>(entities);

        for (int i = 0; i < entityList.size(); i++) {
            for (int j = i + 1; j < entityList.size(); j++) {
                KnowledgeEntity entity1 = entityList.get(i);
                KnowledgeEntity entity2 = entityList.get(j);

                // Add bidirectional relationship
                entity1.getRelatedEntities().add(entity2);
                entity2.getRelatedEntities().add(entity1);
            }
        }
    }

    /**
     * Generate AI-powered summary for a specific topic/query
     */
    public String generateTopicSummary(String query) {
        // Find entities related to the query
        List<KnowledgeEntity> relatedEntities = entityRepository.findByNameContainingIgnoreCase(query);

        if (relatedEntities.isEmpty()) {
            return generateGenericTopicSummary(query);
        }

        StringBuilder summary = new StringBuilder();

        // Get the most relevant entity
        KnowledgeEntity primaryEntity = relatedEntities.stream()
                .max(Comparator.comparing(KnowledgeEntity::getConfidenceScore))
                .orElse(relatedEntities.get(0));

        summary.append("**").append(primaryEntity.getName()).append("**\n\n");

        if (primaryEntity.getDescription() != null && !primaryEntity.getDescription().isEmpty()) {
            summary.append(primaryEntity.getDescription()).append("\n\n");
        }

        // Add frequency and discussion context
        summary.append("This topic has been discussed **")
                .append(primaryEntity.getFrequencyCount())
                .append(" times** across different threads with a confidence score of **")
                .append(String.format("%.0f%%", primaryEntity.getConfidenceScore() * 100))
                .append("**.\n\n");

        // Add related concepts
        Set<KnowledgeEntity> related = primaryEntity.getRelatedEntities();
        if (!related.isEmpty()) {
            summary.append("**Related Concepts:** ");
            List<String> relatedNames = related.stream()
                    .limit(5)
                    .map(KnowledgeEntity::getName)
                    .collect(Collectors.toList());
            summary.append(String.join(", ", relatedNames)).append("\n\n");
        }

        // Add domain-specific insights
        String domain = getDomainFromEntityType(primaryEntity.getEntityType());
        summary.append("**Domain:** ").append(domain).append("\n");
        summary.append("**Type:** ").append(primaryEntity.getEntityType());

        return summary.toString();
    }

    private String generateGenericTopicSummary(String query) {
        String lowerQuery = query.toLowerCase();

        // Check if query matches any domain keywords
        for (Map.Entry<String, List<String>> entry : DOMAIN_KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lowerQuery.contains(keyword.toLowerCase())) {
                    return generateDomainSummary(query, entry.getKey(), keyword);
                }
            }
        }

        return "**" + query + "**\n\n" +
                "This topic hasn't been extensively discussed yet, but it's an interesting subject for exploration. " +
                "Consider starting a discussion thread to gather more insights from the community.\n\n" +
                "**Suggestion:** Try searching for related terms or broader concepts that might be connected to this topic.";
    }

    private String generateDomainSummary(String query, String domain, String matchedKeyword) {
        String domainName = domain.replace("_", " ").toLowerCase();
        domainName = domainName.substring(0, 1).toUpperCase() + domainName.substring(1);

        return "**" + query + "**\n\n" +
                "This appears to be related to **" + domainName + "**, specifically connected to the concept of \""
                + matchedKeyword + "\".\n\n" +
                "**Domain:** " + domainName + "\n" +
                "**Related Keyword:** " + matchedKeyword + "\n\n" +
                "While this specific topic may not have been discussed extensively yet, it falls within a well-established academic domain. "
                +
                "Consider exploring related discussions or starting a new thread to dive deeper into this subject.";
    }

    private String getDomainFromEntityType(String entityType) {
        switch (entityType) {
            case "CS_CONCEPT":
                return "Computer Science";
            case "MATH_CONCEPT":
                return "Mathematics";
            case "CONCEPT":
                return "General Academic";
            case "TERM":
                return "Technical Terminology";
            case "PERSON":
                return "People & Authors";
            default:
                return "Interdisciplinary";
        }
    }
}
