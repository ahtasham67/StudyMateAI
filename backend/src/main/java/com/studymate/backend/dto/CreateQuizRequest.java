package com.studymate.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateQuizRequest {
    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;

    @NotNull(message = "Study material ID is required")
    private Long studyMaterialId;

    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Minimum 1 question required")
    @Max(value = 50, message = "Maximum 50 questions allowed")
    private Integer numberOfQuestions;

    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Minimum 5 minutes duration required")
    @Max(value = 180, message = "Maximum 180 minutes duration allowed")
    private Integer durationMinutes;

    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    // Constructors
    public CreateQuizRequest() {
    }

    public CreateQuizRequest(String title, String description, Long studyMaterialId,
            Integer numberOfQuestions, Integer durationMinutes, String difficulty) {
        this.title = title;
        this.description = description;
        this.studyMaterialId = studyMaterialId;
        this.numberOfQuestions = numberOfQuestions;
        this.durationMinutes = durationMinutes;
        this.difficulty = difficulty;
    }

    // Getters and Setters
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

    public Long getStudyMaterialId() {
        return studyMaterialId;
    }

    public void setStudyMaterialId(Long studyMaterialId) {
        this.studyMaterialId = studyMaterialId;
    }

    public Integer getNumberOfQuestions() {
        return numberOfQuestions;
    }

    public void setNumberOfQuestions(Integer numberOfQuestions) {
        this.numberOfQuestions = numberOfQuestions;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
