package com.studymate.backend.dto;

public class VideoResourceResponse {
    private String title;
    private String description;
    private String url;
    private String thumbnailUrl;
    private String channel;
    private String duration;
    private String publishedDate;

    // Default constructor
    public VideoResourceResponse() {
    }

    // Constructor with all fields
    public VideoResourceResponse(String title, String description, String url,
            String thumbnailUrl, String channel, String duration, String publishedDate) {
        this.title = title;
        this.description = description;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.channel = channel;
        this.duration = duration;
        this.publishedDate = publishedDate;
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

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(String publishedDate) {
        this.publishedDate = publishedDate;
    }
}