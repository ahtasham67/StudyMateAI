package com.studymate.backend.dto;

import java.time.LocalDateTime;

import com.studymate.backend.model.StudySchedule;

public class ScheduleResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private StudySchedule.Priority priority;
    private StudySchedule.ScheduleType type;
    private StudySchedule.ScheduleStatus status;
    private String subject;
    private String location;
    private boolean isRecurring;
    private StudySchedule.RecurrenceType recurrenceType;
    private Integer recurrenceInterval;
    private LocalDateTime recurrenceEndDate;
    private String color;
    private Integer reminderMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ScheduleResponse() {
    }

    public ScheduleResponse(StudySchedule schedule) {
        this.id = schedule.getId();
        this.title = schedule.getTitle();
        this.description = schedule.getDescription();
        this.startTime = schedule.getStartTime();
        this.endTime = schedule.getEndTime();
        this.priority = schedule.getPriority();
        this.type = schedule.getType();
        this.status = schedule.getStatus();
        this.subject = schedule.getSubject();
        this.location = schedule.getLocation();
        this.isRecurring = schedule.isRecurring();
        this.recurrenceType = schedule.getRecurrenceType();
        this.recurrenceInterval = schedule.getRecurrenceInterval();
        this.recurrenceEndDate = schedule.getRecurrenceEndDate();
        this.color = schedule.getColor();
        this.reminderMinutes = schedule.getReminderMinutes();
        this.createdAt = schedule.getCreatedAt();
        this.updatedAt = schedule.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public StudySchedule.ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(StudySchedule.ScheduleStatus status) {
        this.status = status;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
