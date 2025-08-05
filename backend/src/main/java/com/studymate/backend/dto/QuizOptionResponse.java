package com.studymate.backend.dto;

public class QuizOptionResponse {
    private Long id;
    private Integer optionNumber;
    private String optionText;
    private Boolean isCorrect;

    // Constructors
    public QuizOptionResponse() {
    }

    public QuizOptionResponse(Long id, Integer optionNumber, String optionText, Boolean isCorrect) {
        this.id = id;
        this.optionNumber = optionNumber;
        this.optionText = optionText;
        this.isCorrect = isCorrect;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOptionNumber() {
        return optionNumber;
    }

    public void setOptionNumber(Integer optionNumber) {
        this.optionNumber = optionNumber;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
