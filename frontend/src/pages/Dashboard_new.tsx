import {
  Add,
  Assignment,
  CalendarToday,
  EmojiEvents,
  Note,
  PlayArrow,
  School,
  Stop,
  Timer,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { format, isAfter, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notesAPI, studySessionAPI } from "../services/api";
import { Note as NoteType, StudySession, StudySessionStats } from "../types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudySessionStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [progressData, setProgressData] = useState({
    weeklyGoal: 300, // 5 hours in minutes
    dailyGoal: 60, // 1 hour in minutes
    weeklyProgress: 0,
    dailyProgress: 0,
    streak: 0,
    totalSessionsThisWeek: 0,
    completionRate: 0,
    averageSessionLength: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, sessionsResponse, notesResponse] =
          await Promise.all([
            studySessionAPI.getStats(),
            studySessionAPI.getAll(),
            notesAPI.getAll(),
          ]);

        const allSessions = sessionsResponse.data;
        setStats(statsResponse.data);
        setRecentSessions(allSessions.slice(0, 5));
        setRecentNotes(notesResponse.data.slice(0, 5));

        // Calculate progress metrics
        calculateProgressMetrics(allSessions);
      } catch (err: any) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateProgressMetrics = (sessions: StudySession[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = subDays(today, today.getDay());

    // Filter sessions for today and this week
    const todaySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= today;
    });

    const weekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return isAfter(sessionDate, weekStart);
    });

    // Calculate daily progress
    const dailyMinutes = todaySessions.reduce(
      (total, session) => total + (session.durationMinutes || 0),
      0
    );

    // Calculate weekly progress
    const weeklyMinutes = weekSessions.reduce(
      (total, session) => total + (session.durationMinutes || 0),
      0
    );

    // Calculate streak (consecutive days with at least 30 minutes of study)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i);
      const dayStart = new Date(
        checkDate.getFullYear(),
        checkDate.getMonth(),
        checkDate.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayMinutes = sessions
        .filter((session) => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= dayStart && sessionDate < dayEnd;
        })
        .reduce((total, session) => total + (session.durationMinutes || 0), 0);

      if (dayMinutes >= 30) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate completion rate (sessions with duration > 0)
    const completedSessions = sessions.filter(
      (s) => s.durationMinutes && s.durationMinutes > 0
    );
    const completionRate =
      sessions.length > 0
        ? (completedSessions.length / sessions.length) * 100
        : 0;

    // Calculate average session length
    const averageSessionLength =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (total, s) => total + (s.durationMinutes || 0),
            0
          ) / completedSessions.length
        : 0;

    setProgressData({
      weeklyGoal: 300,
      dailyGoal: 60,
      weeklyProgress: weeklyMinutes,
      dailyProgress: dailyMinutes,
      streak,
      totalSessionsThisWeek: weekSessions.length,
      completionRate,
      averageSessionLength,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          background: "linear-gradient(45deg, #bb86fc, #03dac6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold",
        }}
      >
        Welcome back, {user?.username}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Beautiful Progress Tracker Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 3,
          }}
        >
          📊 Your Progress Journey
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          {/* Daily Progress Card */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🎯 Today's Goal
                </Typography>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <Timer />
                </Avatar>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                {formatDuration(progressData.dailyProgress)}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                of {formatDuration(progressData.dailyGoal)} target
              </Typography>

              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (progressData.dailyProgress / progressData.dailyGoal) * 100,
                  100
                )}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#03dac6",
                    borderRadius: 4,
                  },
                }}
              />

              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", opacity: 0.8 }}
              >
                {Math.round(
                  (progressData.dailyProgress / progressData.dailyGoal) * 100
                )}
                % Complete
              </Typography>
            </CardContent>
          </Card>

          {/* Weekly Progress Card */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  📅 Weekly Goal
                </Typography>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <CalendarToday />
                </Avatar>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                {formatDuration(progressData.weeklyProgress)}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                of {formatDuration(progressData.weeklyGoal)} target
              </Typography>

              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (progressData.weeklyProgress / progressData.weeklyGoal) * 100,
                  100
                )}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#ffd93d",
                    borderRadius: 4,
                  },
                }}
              />

              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", opacity: 0.8 }}
              >
                {Math.round(
                  (progressData.weeklyProgress / progressData.weeklyGoal) * 100
                )}
                % Complete
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Achievement Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* Study Streak */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {progressData.streak}
              </Typography>
              <Typography variant="body2">Day Streak 🔥</Typography>
            </CardContent>
          </Card>

          {/* Weekly Sessions */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {progressData.totalSessionsThisWeek}
              </Typography>
              <Typography variant="body2">Sessions This Week</Typography>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Visibility sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {Math.round(progressData.completionRate)}%
              </Typography>
              <Typography variant="body2">Completion Rate</Typography>
            </CardContent>
          </Card>

          {/* Average Session */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              color: "#333",
              textAlign: "center",
            }}
          >
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {formatDuration(Math.round(progressData.averageSessionLength))}
              </Typography>
              <Typography variant="body2">Avg Session Length</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Timer color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Study Time
                </Typography>
                <Typography variant="h4">
                  {stats ? formatDuration(stats.totalStudyTime) : "0m"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <School color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Completed Sessions
                </Typography>
                <Typography variant="h4">
                  {stats ? stats.completedSessions : 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Average Session
                </Typography>
                <Typography variant="h4">
                  {stats && stats.completedSessions > 0
                    ? formatDuration(
                        Math.round(
                          stats.totalStudyTime / stats.completedSessions
                        )
                      )
                    : "0m"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Note color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Notes Count
                </Typography>
                <Typography variant="h4">{recentNotes.length}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => navigate("/study-sessions")}
            size="large"
          >
            Start Study Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate("/notes")}
            size="large"
          >
            Create Note
          </Button>
        </Box>
      </Paper>

      {/* Recent Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Recent Study Sessions */}
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Recent Study Sessions</Typography>
            <Button onClick={() => navigate("/study-sessions")}>
              View All
            </Button>
          </Box>
          {recentSessions.length > 0 ? (
            <List>
              {recentSessions.map((session) => (
                <ListItem key={session.id}>
                  <ListItemIcon>
                    {session.endTime ? (
                      <Stop color="action" />
                    ) : (
                      <PlayArrow color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {session.subject} •{" "}
                          {format(new Date(session.startTime), "MMM dd, yyyy")}
                        </Typography>
                        {session.durationMinutes && (
                          <Chip
                            size="small"
                            label={formatDuration(session.durationMinutes)}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No study sessions yet
            </Typography>
          )}
        </Paper>

        {/* Recent Notes */}
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Recent Notes</Typography>
            <Button onClick={() => navigate("/notes")}>View All</Button>
          </Box>
          {recentNotes.length > 0 ? (
            <List>
              {recentNotes.map((note) => (
                <ListItem key={note.id}>
                  <ListItemIcon>
                    <Note color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={note.title}
                    secondary={
                      <Box>
                        {note.subject && (
                          <Typography variant="body2" color="text.secondary">
                            {note.subject}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(note.createdAt), "MMM dd, yyyy")}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No notes yet</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
