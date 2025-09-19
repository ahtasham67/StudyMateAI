package com.studymate.backend.dto;

import java.util.List;

public class HelpResourcesResponse {
    private List<VideoResourceResponse> videos;
    private List<ArticleResourceResponse> articles;
    private List<ArticleResourceResponse> blogs;
    private String searchQuery;
    private int totalResults;

    // Default constructor
    public HelpResourcesResponse() {
    }

    // Constructor with all fields
    public HelpResourcesResponse(List<VideoResourceResponse> videos,
            List<ArticleResourceResponse> articles,
            List<ArticleResourceResponse> blogs,
            String searchQuery,
            int totalResults) {
        this.videos = videos;
        this.articles = articles;
        this.blogs = blogs;
        this.searchQuery = searchQuery;
        this.totalResults = totalResults;
    }

    // Getters and setters
    public List<VideoResourceResponse> getVideos() {
        return videos;
    }

    public void setVideos(List<VideoResourceResponse> videos) {
        this.videos = videos;
    }

    public List<ArticleResourceResponse> getArticles() {
        return articles;
    }

    public void setArticles(List<ArticleResourceResponse> articles) {
        this.articles = articles;
    }

    public List<ArticleResourceResponse> getBlogs() {
        return blogs;
    }

    public void setBlogs(List<ArticleResourceResponse> blogs) {
        this.blogs = blogs;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public int getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(int totalResults) {
        this.totalResults = totalResults;
    }
}