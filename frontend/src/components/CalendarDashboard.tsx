import {
  Assignment as AssignmentIcon,
  Coffee as BreakIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Groups as MeetingIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Today as TodayIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { addDays, format, isToday, isTomorrow } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNotificationHelpers } from "../components/NotificationSystem";
import { scheduleAPI } from "../services/api";
import { SchedulePriority, ScheduleType, StudySchedule } from "../types";

interface CalendarStats {
  totalEvents: number;
  todayEvents: number;
  weekEvents: number;
  completedEvents: number;
  upcomingDeadlines: number;
}

const CalendarDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    todayEvents: 0,
    weekEvents: 0,
    completedEvents: 0,
    upcomingDeadlines: 0,
  });
  const [loading, setLoading] = useState(true);
  const { showError } = useNotificationHelpers();

  // Load schedules and calculate stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await scheduleAPI.getAllSchedules();
        const allSchedules = response.data;
        setSchedules(allSchedules);

        // Calculate stats
        const now = new Date();
        const weekFromNow = addDays(now, 7);

        const todayEvents = allSchedules.filter((schedule) =>
          isToday(new Date(schedule.startTime))
        ).length;

        const weekEvents = allSchedules.filter((schedule) => {
          const eventDate = new Date(schedule.startTime);
          return eventDate >= now && eventDate <= weekFromNow;
        }).length;

        const completedEvents = allSchedules.filter(
          (schedule) => schedule.status === "COMPLETED"
        ).length;

        const upcomingDeadlines = allSchedules.filter((schedule) => {
          const eventDate = new Date(schedule.startTime);
          return (
            (schedule.type === "EXAM" || schedule.type === "ASSIGNMENT") &&
            eventDate >= now &&
            eventDate <= weekFromNow
          );
        }).length;

        setStats({
          totalEvents: allSchedules.length,
          todayEvents,
          weekEvents,
          completedEvents,
          upcomingDeadlines,
        });
      } catch (error) {
        console.error("Error loading schedule data:", error);
        showError("Failed to load schedule data", "Error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  const getTypeIcon = (type: ScheduleType) => {
    switch (type) {
      case "STUDY":
        return <SchoolIcon />;
      case "EXAM":
        return <AssignmentIcon />;
      case "ASSIGNMENT":
        return <AssignmentIcon />;
      case "BREAK":
        return <BreakIcon />;
      case "MEETING":
        return <MeetingIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getPriorityColor = (priority: SchedulePriority) => {
    switch (priority) {
      case "URGENT":
        return "#ff5252";
      case "HIGH":
        return "#ff9800";
      case "MEDIUM":
        return "#2196f3";
      case "LOW":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM dd");
  };

  const upcomingEvents = schedules
    .filter((schedule) => new Date(schedule.startTime) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  const todayEvents = schedules.filter((schedule) =>
    isToday(new Date(schedule.startTime))
  );

  const completionRate =
    stats.totalEvents > 0
      ? (stats.completedEvents / stats.totalEvents) * 100
      : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#ffffff", fontWeight: "bold" }}
      >
        Calendar Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <Card
          sx={{
            flex: "1 1 250px",
            minWidth: 250,
            background: "linear-gradient(45deg, #1976d2, #42a5f5)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <TodayIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.todayEvents}
                </Typography>
                <Typography variant="body2">Today's Events</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 250px",
            minWidth: 250,
            background: "linear-gradient(45deg, #388e3c, #66bb6a)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <CalendarIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.weekEvents}
                </Typography>
                <Typography variant="body2">This Week</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 250px",
            minWidth: 250,
            background: "linear-gradient(45deg, #f57c00, #ffb74d)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <NotificationsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.upcomingDeadlines}
                </Typography>
                <Typography variant="body2">Deadlines</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: "1 1 250px",
            minWidth: 250,
            background: "linear-gradient(45deg, #7b1fa2, #ba68c8)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(completionRate)}%
                </Typography>
                <Typography variant="body2">Completion</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Today's Schedule */}
        <Paper
          sx={{
            flex: "1 1 400px",
            minWidth: 400,
            p: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ScheduleIcon />
            Today's Schedule
          </Typography>
          {loading ? (
            <LinearProgress sx={{ my: 2 }} />
          ) : todayEvents.length > 0 ? (
            <List>
              {todayEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon
                      sx={{ color: getPriorityColor(event.priority) }}
                    >
                      {getTypeIcon(event.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#ffffff" }}
                          >
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.priority}
                            size="small"
                            sx={{
                              bgcolor: getPriorityColor(event.priority),
                              color: "white",
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#b0bec5" }}>
                          {format(new Date(event.startTime), "HH:mm")} -{" "}
                          {format(new Date(event.endTime), "HH:mm")}
                          {event.subject && ` • ${event.subject}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < todayEvents.length - 1 && (
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#b0bec5", textAlign: "center", py: 4 }}
            >
              No events scheduled for today
            </Typography>
          )}
        </Paper>

        {/* Upcoming Events */}
        <Paper
          sx={{
            flex: "1 1 400px",
            minWidth: 400,
            p: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <EventIcon />
            Upcoming Events
          </Typography>
          {loading ? (
            <LinearProgress sx={{ my: 2 }} />
          ) : upcomingEvents.length > 0 ? (
            <List>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon
                      sx={{ color: getPriorityColor(event.priority) }}
                    >
                      {getTypeIcon(event.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#ffffff" }}
                          >
                            {event.title}
                          </Typography>
                          <Chip
                            label={getDateLabel(event.startTime)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getPriorityColor(event.priority),
                              color: getPriorityColor(event.priority),
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: "#b0bec5" }}>
                          {format(new Date(event.startTime), "HH:mm")}
                          {event.subject && ` • ${event.subject}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < upcomingEvents.length - 1 && (
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#b0bec5", textAlign: "center", py: 4 }}
            >
              No upcoming events
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Completion Progress */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: "#ffffff" }}>
          Study Progress
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: "#b0bec5", minWidth: "100px" }}
          >
            Completion Rate
          </Typography>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor:
                  completionRate > 75
                    ? "#4caf50"
                    : completionRate > 50
                    ? "#ff9800"
                    : "#f44336",
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#ffffff", fontWeight: "bold", minWidth: "40px" }}
          >
            {Math.round(completionRate)}%
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#b0bec5" }}>
          {stats.completedEvents} of {stats.totalEvents} events completed
        </Typography>
      </Paper>
    </Box>
  );
};

export default CalendarDashboard;
