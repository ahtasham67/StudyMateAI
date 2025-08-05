package com.studymate.backend.dto;

import java.util.List;

import com.studymate.backend.model.QuizQuestion.QuestionType;

public class QuizQuestionResponse {
    private Long id;
    private Integer questionNumber;
    private String questionText;
    private QuestionType questionType;
    private Integer points;
    private String explanation;
    private List<QuizOptionResponse> options;

    // Constructors
    public QuizQuestionResponse() {
    }

    public QuizQuestionResponse(Long id, Integer questionNumber, String questionText,
            QuestionType questionType, Integer points, String explanation) {
        this.id = id;
        this.questionNumber = questionNumber;
        this.questionText = questionText;
        this.questionType = questionType;
        this.points = points;
        this.explanation = explanation;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<QuizOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<QuizOptionResponse> options) {
        this.options = options;
    }
}
