package com.studymate.backend.dto;

import java.time.LocalDateTime;

import com.studymate.backend.model.StudySchedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateScheduleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private StudySchedule.Priority priority = StudySchedule.Priority.MEDIUM;

    private StudySchedule.ScheduleType type = StudySchedule.ScheduleType.STUDY;

    private String subject;

    private String location;

    private boolean isRecurring = false;

    private StudySchedule.RecurrenceType recurrenceType;

    private Integer recurrenceInterval = 1;

    private LocalDateTime recurrenceEndDate;

    private String color = "#1976d2";

    private Integer reminderMinutes;

    // Constructors
    public CreateScheduleRequest() {
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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public StudySchedule.Priority getPriority() {
        return priority;
    }

    public void setPriority(StudySchedule.Priority priority) {
        this.priority = priority;
    }

    public StudySchedule.ScheduleType getType() {
        return type;
    }

    public void setType(StudySchedule.ScheduleType type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isRecurring() {
        return isRecurring;
    }

    public void setRecurring(boolean recurring) {
        isRecurring = recurring;
    }

    public StudySchedule.RecurrenceType getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(StudySchedule.RecurrenceType recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public Integer getRecurrenceInterval() {
        return recurrenceInterval;
    }

    public void setRecurrenceInterval(Integer recurrenceInterval) {
        this.recurrenceInterval = recurrenceInterval;
    }

    public LocalDateTime getRecurrenceEndDate() {
        return recurrenceEndDate;
    }

    public void setRecurrenceEndDate(LocalDateTime recurrenceEndDate) {
        this.recurrenceEndDate = recurrenceEndDate;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getReminderMinutes() {
        return reminderMinutes;
    }

    public void setReminderMinutes(Integer reminderMinutes) {
        this.reminderMinutes = reminderMinutes;
    }
}
