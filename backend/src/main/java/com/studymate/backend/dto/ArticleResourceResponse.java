package com.studymate.backend.dto;

public class ArticleResourceResponse {
    private String title;
    private String description;
    private String url;
    private String source;
    private String author;
    private String publishedDate;
    private String thumbnailUrl;

    // Default constructor
    public ArticleResourceResponse() {
    }

    // Constructor with all fields
    public ArticleResourceResponse(String title, String description, String url,
            String source, String author, String publishedDate, String thumbnailUrl) {
        this.title = title;
        this.description = description;
        this.url = url;
        this.source = source;
        this.author = author;
        this.publishedDate = publishedDate;
        this.thumbnailUrl = thumbnailUrl;
    }

    // Getters and setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(String publishedDate) {
        this.publishedDate = publishedDate;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}