package com.studymate.backend.dto;

import java.util.List;

public class ContentRecommendationResponse {
    private String topic;
    private String subject;
    private List<SearchSuggestion> searchSuggestions;
    private List<ContentResource> resources;
    private String message;

    public ContentRecommendationResponse() {
    }

    public ContentRecommendationResponse(String topic, String subject, List<SearchSuggestion> searchSuggestions,
            List<ContentResource> resources, String message) {
        this.topic = topic;
        this.subject = subject;
        this.searchSuggestions = searchSuggestions;
        this.resources = resources;
        this.message = message;
    }

    // Getters and setters
    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public List<SearchSuggestion> getSearchSuggestions() {
        return searchSuggestions;
    }

    public void setSearchSuggestions(List<SearchSuggestion> searchSuggestions) {
        this.searchSuggestions = searchSuggestions;
    }

    public List<ContentResource> getResources() {
        return resources;
    }

    public void setResources(List<ContentResource> resources) {
        this.resources = resources;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Inner classes for structured data
    public static class SearchSuggestion {
        private String query;
        private String type;
        private String description;

        public SearchSuggestion() {
        }

        public SearchSuggestion(String query, String type, String description) {
            this.query = query;
            this.type = type;
            this.description = description;
        }

        public String getQuery() {
            return query;
        }

        public void setQuery(String query) {
            this.query = query;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class ContentResource {
        private String title;
        private String url;
        private String type; // "video", "article", "blog", "tutorial"
        private String source; // "YouTube", "Khan Academy", "Medium", etc.
        private String description;
        private Double relevanceScore;

        public ContentResource() {
        }

        public ContentResource(String title, String url, String type, String source, String description,
                Double relevanceScore) {
            this.title = title;
            this.url = url;
            this.type = type;
            this.source = source;
            this.description = description;
            this.relevanceScore = relevanceScore;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getRelevanceScore() {
            return relevanceScore;
        }

        public void setRelevanceScore(Double relevanceScore) {
            this.relevanceScore = relevanceScore;
        }
    }
}