package com.studymate.backend.dto;

public class HelpResourcesRequest {
    private String materialContent;
    private String materialTitle;
    private String searchQuery;
    private int maxResults = 10;

    // Default constructor
    public HelpResourcesRequest() {
    }

    // Constructor with all fields
    public HelpResourcesRequest(String materialContent, String materialTitle, String searchQuery, int maxResults) {
        this.materialContent = materialContent;
        this.materialTitle = materialTitle;
        this.searchQuery = searchQuery;
        this.maxResults = maxResults;
    }

    // Getters and setters
    public String getMaterialContent() {
        return materialContent;
    }

    public void setMaterialContent(String materialContent) {
        this.materialContent = materialContent;
    }

    public String getMaterialTitle() {
        return materialTitle;
    }

    public void setMaterialTitle(String materialTitle) {
        this.materialTitle = materialTitle;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public int getMaxResults() {
        return maxResults;
    }

    public void setMaxResults(int maxResults) {
        this.maxResults = maxResults;
    }
}