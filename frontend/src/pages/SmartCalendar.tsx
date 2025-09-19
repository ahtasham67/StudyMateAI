import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Add as AddIcon,
  CalendarToday,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { useEffect, useMemo, useState } from "react";
import { useNotificationHelpers } from "../components/NotificationSystem";
import { scheduleAPI } from "../services/api";
import {
  CreateScheduleRequest,
  RecurrenceType,
  SchedulePriority,
  ScheduleType,
  StudySchedule,
} from "../types";

const SmartCalendar: React.FC = () => {
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StudySchedule | null>(
    null
  );
  const { showSuccess, showError, showWarning, showInfo } =
    useNotificationHelpers();
  const [loading, setLoading] = useState(false);

  // Track which events have already triggered notifications to prevent duplicates
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<CreateScheduleRequest>({
    title: "",
    description: "",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    priority: SchedulePriority.MEDIUM,
    type: ScheduleType.STUDY,
    isRecurring: false,
    recurrenceType: RecurrenceType.DAILY,
    recurrenceEndDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

  // Load schedules from the backend
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const response = await scheduleAPI.getAllSchedules();
        setSchedules(response.data);
        // Clear notification tracking when schedules are reloaded
        setNotifiedEvents(new Set());
        // Only show error notifications, not success notifications for normal loading
      } catch (error) {
        console.error("Error loading schedules:", error);
        showError("Failed to load schedules from server", "Network Error");
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [showError]);

  // Elegant dark theme colors for different priorities and types
  const getEventColor = useMemo(() => {
    const typeColors = {
      STUDY: { bg: "#1a1f2e", border: "#bb86fc", text: "#bb86fc" },
      EXAM: { bg: "#2d1818", border: "#ff5252", text: "#ff8a80" },
      ASSIGNMENT: { bg: "#1f2a1f", border: "#4caf50", text: "#81c784" },
      BREAK: { bg: "#1f1f2a", border: "#9c27b0", text: "#ce93d8" },
      MEETING: { bg: "#2a1f1f", border: "#ff9800", text: "#ffcc80" },
      OTHER: { bg: "#1f1f1f", border: "#607d8b", text: "#90a4ae" },
    };

    const priorityIntensity = {
      LOW: 0.7,
      MEDIUM: 0.85,
      HIGH: 1.0,
      URGENT: 1.2,
    };

    return (schedule: StudySchedule) => {
      // Safety checks for required properties
      if (!schedule) {
        console.warn("getEventColor called with undefined schedule");
        return {
          backgroundColor: "#1f1f1f",
          borderColor: "#607d8b",
          textColor: "#90a4ae",
          borderWidth: "2px",
          opacity: 0.7,
        };
      }

      const typeColor = typeColors[schedule.type || ScheduleType.STUDY];
      const intensity =
        priorityIntensity[schedule.priority || SchedulePriority.MEDIUM];

      // Calculate duration for border thickness
      const duration =
        (new Date(schedule.endTime).getTime() -
          new Date(schedule.startTime).getTime()) /
        (1000 * 60 * 60);
      const borderThickness = Math.min(Math.max(duration * 0.5, 2), 4);

      return {
        backgroundColor: typeColor.bg,
        borderColor: typeColor.border,
        textColor: typeColor.text,
        borderWidth:
          schedule.priority === "URGENT" ? "3px" : `${borderThickness}px`,
        opacity: intensity,
      };
    };
  }, []);

  // Smart notification system for relevant events only
  useEffect(() => {
    if (schedules.length === 0) return;

    const checkEventNotifications = () => {
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
      const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);

      schedules.forEach((schedule) => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);
        const eventId = schedule.id.toString();

        // Create unique notification keys to prevent duplicates
        const startingSoonKey = `${eventId}-starting-5min`;
        const urgentStartingKey = `${eventId}-urgent-15min`;
        const endingSoonKey = `${eventId}-ending-10min`;
        const missedKey = `${eventId}-missed`;

        // Event is currently running
        if (now >= startTime && now <= endTime) {
          const timeLeft = Math.floor(
            (endTime.getTime() - now.getTime()) / (1000 * 60)
          );
          if (
            timeLeft <= 10 &&
            timeLeft > 0 &&
            !notifiedEvents.has(endingSoonKey)
          ) {
            showWarning(
              `"${schedule.title}" ends in ${timeLeft} minutes!`,
              "Event Ending Soon"
            );
            setNotifiedEvents((prev) => new Set(prev).add(endingSoonKey));
          }
        }
        // Event starts in 5 minutes
        else if (
          startTime > now &&
          startTime <= in5Minutes &&
          !notifiedEvents.has(startingSoonKey)
        ) {
          showWarning(
            `"${schedule.title}" starts in 5 minutes!`,
            "Event Starting Soon"
          );
          setNotifiedEvents((prev) => new Set(prev).add(startingSoonKey));
        }
        // Event starts in 15 minutes (for urgent events only)
        else if (
          schedule.priority === SchedulePriority.URGENT &&
          startTime > in5Minutes &&
          startTime <= in15Minutes &&
          !notifiedEvents.has(urgentStartingKey)
        ) {
          showInfo(
            `Urgent: "${schedule.title}" starts in 15 minutes`,
            "Upcoming Event"
          );
          setNotifiedEvents((prev) => new Set(prev).add(urgentStartingKey));
        }
        // Event was missed (started more than 5 minutes ago and hasn't ended)
        else if (
          startTime < new Date(now.getTime() - 5 * 60 * 1000) &&
          endTime > now &&
          startTime > new Date(now.getTime() - 60 * 60 * 1000) && // Only show for events that started within the last hour
          !notifiedEvents.has(missedKey)
        ) {
          showError(
            `You missed the start of "${schedule.title}"`,
            "Missed Event"
          );
          setNotifiedEvents((prev) => new Set(prev).add(missedKey));
        }
      });
    };

    // Check immediately
    checkEventNotifications();

    // Set up interval to check every minute
    const interval = setInterval(checkEventNotifications, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [
    schedules,
    showWarning,
    showInfo,
    showError,
    notifiedEvents,
    setNotifiedEvents,
  ]);

  // Convert schedules to FullCalendar events
  const calendarEvents: EventInput[] = useMemo(() => {
    return schedules
      .filter((schedule) => {
        // Filter out invalid schedules
        return (
          schedule &&
          schedule.id &&
          schedule.title &&
          schedule.startTime &&
          schedule.endTime &&
          schedule.type &&
          schedule.priority
        );
      })
      .map((schedule) => {
        const colors = getEventColor(schedule);
        return {
          id: schedule.id.toString(),
          title: schedule.title,
          start: schedule.startTime,
          end: schedule.endTime,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          textColor: colors.textColor,
          extendedProps: {
            description: schedule.description,
            priority: schedule.priority,
            type: schedule.type,
            isRecurring: schedule.isRecurring,
            recurrenceType: schedule.recurrenceType,
            schedule: schedule,
          },
        };
      });
  }, [schedules, getEventColor]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const now = new Date();
    const selectedStart = selectInfo.start;

    // Show info notification for past dates
    if (selectedStart < now) {
      showError("Cannot create events in the past", "Invalid Date Selection");
      return;
    }

    setFormData({
      ...formData,
      startTime: selectInfo.start.toISOString(),
      endTime: (
        selectInfo.end || new Date(selectInfo.start.getTime() + 60 * 60 * 1000)
      ).toISOString(),
    });
    setEditingSchedule(null);
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const schedule = clickInfo.event.extendedProps.schedule as StudySchedule;
    if (!schedule) {
      showError("Event data not found", "Error");
      return;
    }

    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      priority: schedule.priority,
      type: schedule.type,
      isRecurring: schedule.isRecurring,
      recurrenceType: schedule.recurrenceType,
      recurrenceEndDate:
        schedule.recurrenceEndDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!formData.title.trim()) {
        showError("Please enter a title for the schedule");
        return;
      }

      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        showError("End time must be after start time");
        return;
      }

      setLoading(true);

      if (editingSchedule) {
        // Update existing schedule
        const response = await scheduleAPI.updateSchedule(
          editingSchedule.id,
          formData
        );
        const updatedSchedules = schedules.map((schedule) =>
          schedule.id === editingSchedule.id ? response.data : schedule
        );
        setSchedules(updatedSchedules);
        showSuccess("Schedule updated successfully!", "Update Successful");
      } else {
        // Create new schedule
        const response = await scheduleAPI.createSchedule(formData);
        setSchedules([...schedules, response.data]);
        showSuccess("Schedule created successfully!", "Schedule Created");
      }

      setDialogOpen(false);
      setEditingSchedule(null);
    } catch (err) {
      console.error("Error saving schedule:", err);
      showError("Failed to save schedule. Please try again.", "Save Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!editingSchedule) return;

    try {
      setLoading(true);
      await scheduleAPI.deleteSchedule(editingSchedule.id);
      const updatedSchedules = schedules.filter(
        (schedule) => schedule.id !== editingSchedule.id
      );
      setSchedules(updatedSchedules);
      showSuccess("Schedule deleted successfully!", "Schedule Deleted");
      setDialogOpen(false);
      setEditingSchedule(null);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      showError(
        "Failed to delete schedule. Please try again.",
        "Delete Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
  };

  const getPriorityChipColor = (priority: string) => {
    const colors = {
      LOW: { bg: "#1a2332", color: "#8fa5d3" },
      MEDIUM: { bg: "#1f2633", color: "#03dac6" },
      HIGH: { bg: "#2d1f1f", color: "#ffcc80" },
      URGENT: { bg: "#2d1818", color: "#ff8a80" },
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getTypeChipColor = (type: string) => {
    const colors = {
      STUDY: { bg: "#1a1f2e", color: "#bb86fc" },
      EXAM: { bg: "#2d1818", color: "#ff8a80" },
      ASSIGNMENT: { bg: "#1f2a1f", color: "#81c784" },
      BREAK: { bg: "#1f1f2a", color: "#ce93d8" },
      MEETING: { bg: "#2a1f1f", color: "#ffcc80" },
      OTHER: { bg: "#1f1f1f", color: "#90a4ae" },
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
          p: 3,
        }}
      >
        {/* Header */}
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            border: "1px solid rgba(187, 134, 252, 0.1)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarToday sx={{ color: "#bb86fc", fontSize: 32 }} />
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 700,
                    }}
                  >
                    Smart Calendar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your study schedule efficiently
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    showSuccess(
                      "Calendar system is working perfectly!",
                      "System Status"
                    );
                    setTimeout(
                      () =>
                        showInfo(
                          "You can create, edit, and delete events",
                          "Tip"
                        ),
                      1000
                    );
                    setTimeout(
                      () =>
                        showWarning(
                          "Events with HIGH priority show enhanced effects",
                          "Priority Notice"
                        ),
                      2000
                    );
                    setTimeout(
                      () =>
                        showError(
                          "This is just a demo error message",
                          "Demo Error"
                        ),
                      3000
                    );
                  }}
                  sx={{
                    borderColor: "rgba(187, 134, 252, 0.3)",
                    color: "#bb86fc",
                    "&:hover": {
                      borderColor: "#bb86fc",
                      backgroundColor: "rgba(187, 134, 252, 0.1)",
                    },
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  Test Notifications
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData({
                      title: "",
                      description: "",
                      startTime: new Date().toISOString(),
                      endTime: new Date(
                        Date.now() + 60 * 60 * 1000
                      ).toISOString(),
                      priority: SchedulePriority.MEDIUM,
                      type: ScheduleType.STUDY,
                      isRecurring: false,
                      recurrenceType: RecurrenceType.DAILY,
                      recurrenceEndDate: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toISOString(),
                    });
                    setEditingSchedule(null);
                    setDialogOpen(true);
                  }}
                  sx={{
                    background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Add Schedule
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            border: "1px solid rgba(187, 134, 252, 0.1)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            p: 3,
          }}
        >
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={4} // Show up to 4 events, then show "more"
            moreLinkClick="popover" // Show popover when clicking "more"
            eventMaxStack={3} // Stack up to 3 events visually
            weekends={true}
            events={calendarEvents}
            select={handleDateSelect}
            eventClick={handleEventClick}
            height="auto"
            expandRows={true}
            fixedWeekCount={false}
            themeSystem="standard"
            eventDisplay="block"
            eventTextColor="#ffffff"
            dayCellClassNames="custom-day-cell"
            eventClassNames="custom-event"
            customButtons={{}}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              list: "List",
            }}
            // Custom styling for dark theme
            dayHeaderClassNames="custom-day-header"
            viewClassNames="custom-calendar-view"
            // Event styling
            eventDidMount={(info) => {
              const schedule = info.event.extendedProps
                .schedule as StudySchedule;

              // Safety check - ensure schedule exists and has required properties
              if (!schedule || !schedule.type || !schedule.priority) {
                console.warn("Event missing schedule data:", info.event);
                return;
              }

              const color = getEventColor(schedule);

              // Apply enhanced styling
              info.el.style.backgroundColor = color.backgroundColor;
              info.el.style.borderColor = color.borderColor;
              info.el.style.borderWidth = color.borderWidth;
              info.el.style.opacity = color.opacity?.toString() || "1";
              info.el.style.color = color.textColor;
              info.el.style.borderStyle = "solid";
              info.el.style.borderRadius = "6px";
              info.el.style.overflow = "hidden";
              info.el.style.cursor = "pointer";
              info.el.style.transition = "all 0.2s ease-in-out";

              // Add priority indicator
              if (schedule.priority === "URGENT") {
                info.el.style.boxShadow = `0 0 10px ${color.borderColor}40`;
                info.el.style.animation = "pulse 2s infinite";
              } else if (schedule.priority === "HIGH") {
                info.el.style.boxShadow = `0 0 5px ${color.borderColor}30`;
              }
            }}
            eventMouseEnter={(info) => {
              const schedule = info.event.extendedProps
                .schedule as StudySchedule;

              // Safety check
              if (!schedule) {
                return;
              }

              const color = getEventColor(schedule);

              info.el.style.transform = "scale(1.02)";
              info.el.style.transition = "transform 0.2s ease";
              info.el.style.zIndex = "999";
              info.el.style.boxShadow = `0 4px 15px ${color.borderColor}60`;
            }}
            eventMouseLeave={(info) => {
              const schedule = info.event.extendedProps
                .schedule as StudySchedule;

              // Safety check
              if (!schedule) {
                return;
              }

              const color = getEventColor(schedule);

              info.el.style.transform = "scale(1)";
              info.el.style.zIndex = "auto";

              if (schedule.priority === "URGENT") {
                info.el.style.boxShadow = `0 0 10px ${color.borderColor}40`;
              } else if (schedule.priority === "HIGH") {
                info.el.style.boxShadow = `0 0 5px ${color.borderColor}30`;
              } else {
                info.el.style.boxShadow = "none";
              }
            }}
          />
        </Card>

        {/* Schedule Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              border: "1px solid rgba(187, 134, 252, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(187, 134, 252, 0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 600,
              }}
            >
              {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
            </Typography>
            <IconButton onClick={handleCloseDialog} sx={{ color: "#bb86fc" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                      borderColor: "#bb86fc",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#bb86fc",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#bb86fc",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                      borderColor: "#bb86fc",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#bb86fc",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#bb86fc",
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <DateTimePicker
                  label="Start Time"
                  value={new Date(formData.startTime)}
                  onChange={(newValue) =>
                    setFormData({
                      ...formData,
                      startTime: (newValue || new Date()).toISOString(),
                    })
                  }
                  enableAccessibleFieldDOMStructure={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#bb86fc",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#bb86fc",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#bb86fc",
                        },
                      },
                    },
                  }}
                />

                <DateTimePicker
                  label="End Time"
                  value={new Date(formData.endTime)}
                  onChange={(newValue) =>
                    setFormData({
                      ...formData,
                      endTime: (newValue || new Date()).toISOString(),
                    })
                  }
                  enableAccessibleFieldDOMStructure={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#bb86fc",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#bb86fc",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#bb86fc",
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ "&.Mui-focused": { color: "#bb86fc" } }}>
                    Priority
                  </InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as SchedulePriority,
                      })
                    }
                    sx={{
                      borderRadius: "12px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#bb86fc",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#bb86fc",
                      },
                    }}
                  >
                    <MenuItem value="LOW">
                      <Chip
                        label="Low"
                        size="small"
                        sx={{
                          backgroundColor: getPriorityChipColor("LOW").bg,
                          color: getPriorityChipColor("LOW").color,
                          border: "none",
                        }}
                      />
                    </MenuItem>
                    <MenuItem value="MEDIUM">
                      <Chip
                        label="Medium"
                        size="small"
                        sx={{
                          backgroundColor: getPriorityChipColor("MEDIUM").bg,
                          color: getPriorityChipColor("MEDIUM").color,
                          border: "none",
                        }}
                      />
                    </MenuItem>
                    <MenuItem value="HIGH">
                      <Chip
                        label="High"
                        size="small"
                        sx={{
                          backgroundColor: getPriorityChipColor("HIGH").bg,
                          color: getPriorityChipColor("HIGH").color,
                          border: "none",
                        }}
                      />
                    </MenuItem>
                    <MenuItem value="URGENT">
                      <Chip
                        label="Urgent"
                        size="small"
                        sx={{
                          backgroundColor: getPriorityChipColor("URGENT").bg,
                          color: getPriorityChipColor("URGENT").color,
                          border: "none",
                        }}
                      />
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ "&.Mui-focused": { color: "#bb86fc" } }}>
                    Type
                  </InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as ScheduleType,
                      })
                    }
                    sx={{
                      borderRadius: "12px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#bb86fc",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#bb86fc",
                      },
                    }}
                  >
                    {[
                      "STUDY",
                      "EXAM",
                      "ASSIGNMENT",
                      "BREAK",
                      "MEETING",
                      "OTHER",
                    ].map((type) => (
                      <MenuItem key={type} value={type}>
                        <Chip
                          label={
                            type.charAt(0).toUpperCase() +
                            type.slice(1).toLowerCase()
                          }
                          size="small"
                          sx={{
                            backgroundColor: getTypeChipColor(type).bg,
                            color: getTypeChipColor(type).color,
                            border: "none",
                          }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{ p: 3, borderTop: "1px solid rgba(187, 134, 252, 0.1)" }}
          >
            <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
              {editingSchedule && (
                <Button
                  onClick={handleDeleteSchedule}
                  startIcon={<DeleteIcon />}
                  sx={{
                    color: "#ff8a80",
                    borderColor: "#ff5252",
                    "&:hover": {
                      borderColor: "#ff8a80",
                      backgroundColor: "rgba(255, 82, 82, 0.1)",
                    },
                  }}
                  variant="outlined"
                >
                  Delete
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                onClick={handleCloseDialog}
                sx={{
                  color: "#90a4ae",
                  borderColor: "#607d8b",
                  "&:hover": {
                    borderColor: "#90a4ae",
                    backgroundColor: "rgba(96, 125, 139, 0.1)",
                  },
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSchedule}
                startIcon={editingSchedule ? <EditIcon /> : <AddIcon />}
                variant="contained"
                disabled={loading}
                sx={{
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : editingSchedule ? "Update" : "Create"}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Custom CSS for FullCalendar dark theme */}
        <style>
          {`
            .fc {
              background: transparent !important;
            }
            
            .fc-theme-standard .fc-scrollgrid {
              border-color: rgba(187, 134, 252, 0.2) !important;
            }
            
            .fc-theme-standard td, .fc-theme-standard th {
              border-color: rgba(187, 134, 252, 0.1) !important;
            }
            
            .fc-col-header-cell {
              background: rgba(187, 134, 252, 0.1) !important;
              color: #bb86fc !important;
              font-weight: 600 !important;
              padding: 12px 0 !important;
            }
            
            .fc-day-today {
              background: rgba(3, 218, 198, 0.1) !important;
            }
            
            .fc-button-primary {
              background: linear-gradient(45deg, #bb86fc, #03dac6) !important;
              border: none !important;
              border-radius: 8px !important;
              font-weight: 600 !important;
              text-transform: none !important;
            }
            
            .fc-button-primary:hover {
              background: linear-gradient(45deg, #d7b3ff, #5ce6d3) !important;
            }
            
            .fc-button-primary:disabled {
              background: rgba(187, 134, 252, 0.3) !important;
            }
            
            .fc-toolbar-title {
              color: #ffffff !important;
              font-weight: 700 !important;
              font-size: 1.5rem !important;
            }
            
            .fc-daygrid-day-number {
              color: #ffffff !important;
              font-weight: 500 !important;
            }
            
            .fc-daygrid-day {
              position: relative !important;
              overflow: hidden !important;
            }
            
            .fc-daygrid-day-frame {
              position: relative !important;
              min-height: 100px !important;
              overflow: hidden !important;
            }
            
            .fc-daygrid-day-events {
              margin: 2px !important;
              position: relative !important;
              z-index: 1 !important;
            }
            
            .fc-event {
              border-radius: 6px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              margin: 1px 0px !important;
              padding: 4px 8px !important;
              font-size: 0.75rem !important;
              line-height: 1.2 !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              box-sizing: border-box !important;
              max-width: 100% !important;
              width: 100% !important;
              text-align: center !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .fc-event:hover {
              transform: scale(1.02) !important;
              box-shadow: 0 4px 12px rgba(187, 134, 252, 0.3) !important;
              z-index: 999 !important;
              white-space: normal !important;
              overflow: visible !important;
            }
            
            .fc-daygrid-event {
              padding: 4px 8px !important;
              margin: 1px 0px !important;
              border-radius: 4px !important;
              font-size: 0.75rem !important;
              line-height: 1.2 !important;
              min-height: 20px !important;
              max-height: 24px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              box-sizing: border-box !important;
              text-align: center !important;
            }
            
            .fc-daygrid-event .fc-event-title {
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              display: block !important;
              text-align: center !important;
              width: 100% !important;
            }
            
            .fc-daygrid-event .fc-event-time {
              font-size: 0.7rem !important;
              opacity: 0.9 !important;
              margin-right: 4px !important;
            }
            
            .fc-daygrid-event-harness {
              position: relative !important;
              margin: 1px 0 !important;
            }
            
            .fc-daygrid-more-link {
              color: #bb86fc !important;
              font-weight: 600 !important;
              font-size: 0.7rem !important;
              padding: 2px 4px !important;
              border-radius: 4px !important;
              background: rgba(187, 134, 252, 0.1) !important;
              border: 1px solid rgba(187, 134, 252, 0.2) !important;
              margin: 1px 2px !important;
            }
            
            .fc-daygrid-more-link:hover {
              background: rgba(187, 134, 252, 0.2) !important;
            }
            
            .fc-list-event:hover td {
              background: rgba(187, 134, 252, 0.1) !important;
            }
            
            .fc-list-day-cushion {
              background: rgba(187, 134, 252, 0.1) !important;
              color: #bb86fc !important;
              font-weight: 600 !important;
            }
            
            .fc-list-event-dot {
              border-color: #bb86fc !important;
            }
            
            .fc-list-event-title {
              color: #ffffff !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              max-width: calc(100% - 100px) !important;
              display: inline-block !important;
            }
            
            .fc-list-event-time {
              color: #03dac6 !important;
              font-weight: 500 !important;
              min-width: 80px !important;
              text-align: right !important;
              padding-left: 8px !important;
              white-space: nowrap !important;
            }
            
            .fc-list-table td {
              padding: 8px 12px !important;
              vertical-align: middle !important;
            }
            
            .fc-list-event td {
              border-bottom: 1px solid rgba(187, 134, 252, 0.1) !important;
            }
            
            .fc-list-event .fc-list-event-graphic {
              min-width: 20px !important;
              padding-right: 12px !important;
            }
            
            .fc-list-event .fc-list-event-time {
              width: 100px !important;
              min-width: 100px !important;
              max-width: 100px !important;
            }
            
            .fc-list-event .fc-list-event-title {
              width: auto !important;
              max-width: none !important;
              padding-right: 8px !important;
            }
            
            .fc-more-link {
              color: #bb86fc !important;
              font-weight: 600 !important;
            }
            
            .fc-popover {
              background: #1a1a1a !important;
              border: 1px solid rgba(187, 134, 252, 0.2) !important;
              border-radius: 12px !important;
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
            }
            
            .fc-popover-header {
              background: rgba(187, 134, 252, 0.1) !important;
              color: #bb86fc !important;
              border-bottom: 1px solid rgba(187, 134, 252, 0.2) !important;
              border-radius: 12px 12px 0 0 !important;
              padding: 8px 12px !important;
              font-weight: 600 !important;
            }
            
            .fc-popover-body {
              padding: 8px !important;
            }
            
            .fc-popover .fc-event {
              margin: 2px 0 !important;
              border-radius: 4px !important;
            }
            
            /* Better mobile responsiveness */
            @media (max-width: 768px) {
              .fc-event {
                font-size: 0.7rem !important;
                padding: 1px 4px !important;
              }
              
              .fc-daygrid-event {
                font-size: 0.7rem !important;
                min-height: 16px !important;
                max-height: 18px !important;
              }
              
              .fc-list-event-title {
                max-width: calc(100% - 80px) !important;
                font-size: 0.9rem !important;
              }
              
              .fc-list-event-time {
                min-width: 70px !important;
                width: 70px !important;
                max-width: 70px !important;
                font-size: 0.8rem !important;
              }
              
              .fc-list-table td {
                padding: 6px 8px !important;
              }
            }
            
            /* Ensure events don't overflow their containers */
            .fc-daygrid-day-top {
              overflow: hidden !important;
            }
            
            .fc-content {
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            /* Pulse animation for urgent events */
            @keyframes pulse {
              0% {
                box-shadow: 0 0 10px rgba(255, 82, 82, 0.4);
              }
              50% {
                box-shadow: 0 0 20px rgba(255, 82, 82, 0.8);
              }
              100% {
                box-shadow: 0 0 10px rgba(255, 82, 82, 0.4);
              }
            }
          `}
        </style>
      </Box>
    </LocalizationProvider>
  );
};

export default SmartCalendar;
