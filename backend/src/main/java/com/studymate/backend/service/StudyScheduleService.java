package com.studymate.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studymate.backend.dto.CreateScheduleRequest;
import com.studymate.backend.dto.ScheduleResponse;
import com.studymate.backend.model.StudySchedule;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyScheduleRepository;

@Service
@Transactional
public class StudyScheduleService {

    @Autowired
    private StudyScheduleRepository scheduleRepository;

    public ScheduleResponse createSchedule(CreateScheduleRequest request, User user) {
        StudySchedule schedule = new StudySchedule();
        mapRequestToSchedule(request, schedule);
        schedule.setUser(user);

        StudySchedule savedSchedule = scheduleRepository.save(schedule);

        // Handle recurring schedules
        if (request.isRecurring() && request.getRecurrenceType() != null) {
            createRecurringSchedules(request, user, savedSchedule);
        }

        return new ScheduleResponse(savedSchedule);
    }

    private void createRecurringSchedules(CreateScheduleRequest request, User user, StudySchedule originalSchedule) {
        LocalDateTime currentStart = request.getStartTime();
        LocalDateTime currentEnd = request.getEndTime();
        LocalDateTime endDate = request.getRecurrenceEndDate();

        if (endDate == null) {
            // Default to 3 months if no end date specified
            endDate = currentStart.plusMonths(3);
        }

        List<StudySchedule> recurringSchedules = new ArrayList<>();

        while (currentStart.isBefore(endDate)) {
            // Calculate next occurrence
            switch (request.getRecurrenceType()) {
                case DAILY:
                    currentStart = currentStart.plusDays(request.getRecurrenceInterval());
                    currentEnd = currentEnd.plusDays(request.getRecurrenceInterval());
                    break;
                case WEEKLY:
                    currentStart = currentStart.plusWeeks(request.getRecurrenceInterval());
                    currentEnd = currentEnd.plusWeeks(request.getRecurrenceInterval());
                    break;
                case MONTHLY:
                    currentStart = currentStart.plusMonths(request.getRecurrenceInterval());
                    currentEnd = currentEnd.plusMonths(request.getRecurrenceInterval());
                    break;
            }

            if (currentStart.isBefore(endDate)) {
                StudySchedule recurringSchedule = new StudySchedule();
                mapRequestToSchedule(request, recurringSchedule);
                recurringSchedule.setUser(user);
                recurringSchedule.setStartTime(currentStart);
                recurringSchedule.setEndTime(currentEnd);
                recurringSchedules.add(recurringSchedule);
            }
        }

        if (!recurringSchedules.isEmpty()) {
            scheduleRepository.saveAll(recurringSchedules);
        }
    }

    private void mapRequestToSchedule(CreateScheduleRequest request, StudySchedule schedule) {
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setPriority(request.getPriority());
        schedule.setType(request.getType());
        schedule.setSubject(request.getSubject());
        schedule.setLocation(request.getLocation());
        schedule.setRecurring(request.isRecurring());
        schedule.setRecurrenceType(request.getRecurrenceType());
        schedule.setRecurrenceInterval(request.getRecurrenceInterval());
        schedule.setRecurrenceEndDate(request.getRecurrenceEndDate());
        schedule.setColor(request.getColor());
        schedule.setReminderMinutes(request.getReminderMinutes());
    }

    public List<ScheduleResponse> getAllSchedules(User user) {
        return scheduleRepository.findByUserOrderByStartTimeAsc(user)
                .stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    public List<ScheduleResponse> getSchedulesInRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return scheduleRepository.findSchedulesInDateRange(user, startDate, endDate)
                .stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    public List<ScheduleResponse> getUpcomingSchedules(User user) {
        return scheduleRepository.findUpcomingSchedules(user, LocalDateTime.now())
                .stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    public List<ScheduleResponse> getSchedulesForDate(User user, LocalDateTime date) {
        return scheduleRepository.findSchedulesForDate(user, date)
                .stream()
                .map(ScheduleResponse::new)
                .collect(Collectors.toList());
    }

    public ScheduleResponse updateSchedule(Long scheduleId, CreateScheduleRequest request, User user) {
        Optional<StudySchedule> optionalSchedule = scheduleRepository.findById(scheduleId);

        if (optionalSchedule.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        StudySchedule schedule = optionalSchedule.get();

        // Check if user owns this schedule
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        mapRequestToSchedule(request, schedule);
        StudySchedule updatedSchedule = scheduleRepository.save(schedule);

        return new ScheduleResponse(updatedSchedule);
    }

    public void deleteSchedule(Long scheduleId, User user) {
        Optional<StudySchedule> optionalSchedule = scheduleRepository.findById(scheduleId);

        if (optionalSchedule.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        StudySchedule schedule = optionalSchedule.get();

        // Check if user owns this schedule
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        scheduleRepository.delete(schedule);
    }

    public ScheduleResponse updateScheduleStatus(Long scheduleId, StudySchedule.ScheduleStatus status, User user) {
        Optional<StudySchedule> optionalSchedule = scheduleRepository.findById(scheduleId);

        if (optionalSchedule.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        StudySchedule schedule = optionalSchedule.get();

        // Check if user owns this schedule
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        schedule.setStatus(status);
        StudySchedule updatedSchedule = scheduleRepository.save(schedule);

        return new ScheduleResponse(updatedSchedule);
    }

    public ScheduleResponse getScheduleById(Long scheduleId, User user) {
        Optional<StudySchedule> optionalSchedule = scheduleRepository.findById(scheduleId);

        if (optionalSchedule.isEmpty()) {
            throw new RuntimeException("Schedule not found");
        }

        StudySchedule schedule = optionalSchedule.get();

        // Check if user owns this schedule
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return new ScheduleResponse(schedule);
    }
}
