import {
  Add,
  Assignment,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  EmojiEvents,
  Note,
  PlayArrow,
  School,
  ShowChart,
  Stop,
  Timer,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { format, isToday, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { notesAPI, studySessionAPI } from "../services/api";
import { Note as NoteType, StudySession, StudySessionStats } from "../types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudySessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [chartData, setChartData] = useState({
    weeklyData: [] as Array<{ day: string; minutes: number; sessions: number }>,
    subjectData: [] as Array<{
      subject: string;
      minutes: number;
      sessions: number;
    }>,
    performanceData: [] as Array<{
      week: string;
      average: number;
      total: number;
    }>,
    streakData: [] as Array<{ date: string; streak: number }>,
  });

  // Pagination state for recent sections
  const [sessionsCurrentPage, setSessionsCurrentPage] = useState(0);
  const [notesCurrentPage, setNotesCurrentPage] = useState(0);
  const [allSessions, setAllSessions] = useState<StudySession[]>([]);
  const [allNotes, setAllNotes] = useState<NoteType[]>([]);
  const ITEMS_PER_PAGE = 3;

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
        const allNotes = notesResponse.data;

        setStats(statsResponse.data);
        setAllSessions(allSessions);
        setAllNotes(allNotes);

        // Calculate progress metrics
        calculateProgressMetrics(allSessions);
        // Calculate chart data
        calculateChartData(allSessions);
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
    const weekStart = subDays(today, today.getDay()); // Start of current week (Sunday)

    // Filter sessions for today and this week
    const todaySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      );
      return sessionDay.getTime() === today.getTime();
    });

    const weekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart && sessionDate <= now;
    });

    // Calculate daily progress (today only)
    const dailyMinutes = todaySessions.reduce(
      (total, session) => total + (session.durationMinutes || 0),
      0
    );

    // Calculate weekly progress (this week only)
    const weeklyMinutes = weekSessions.reduce(
      (total, session) => total + (session.durationMinutes || 0),
      0
    );

    // Enhanced streak calculation (consecutive days with study activity)
    let streak = 0;
    let checkDate = new Date(today);

    // Check each day going backwards
    for (let i = 0; i < 365; i++) {
      // Check up to a year
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

      // Count as streak day if at least 15 minutes of study
      if (dayMinutes >= 15) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // If it's today and no study yet, don't break streak
        if (i === 0 && isToday(checkDate)) {
          checkDate = subDays(checkDate, 1);
          continue;
        }
        break;
      }
    }

    // Calculate completion rate (sessions that were completed vs started)
    const completedSessions = sessions.filter(
      (s) => s.endTime && s.durationMinutes && s.durationMinutes > 0
    );
    const completionRate =
      sessions.length > 0
        ? (completedSessions.length / sessions.length) * 100
        : 0;

    // Calculate average session length (only completed sessions)
    const averageSessionLength =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (total, s) => total + (s.durationMinutes || 0),
            0
          ) / completedSessions.length
        : 0;

    setProgressData({
      weeklyGoal: 300, // 5 hours per week
      dailyGoal: 60, // 1 hour per day
      weeklyProgress: weeklyMinutes,
      dailyProgress: dailyMinutes,
      streak,
      totalSessionsThisWeek: weekSessions.length,
      completionRate,
      averageSessionLength,
    });
  };

  const calculateChartData = (sessions: StudySession[]) => {
    const now = new Date();

    // Weekly data for last 7 days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      weeklyData.push({
        day: format(date, "EEE"),
        minutes: daySessions.reduce(
          (total, session) => total + (session.durationMinutes || 0),
          0
        ),
        sessions: daySessions.length,
      });
    }

    // Subject breakdown
    const subjectMap = new Map<string, { minutes: number; sessions: number }>();
    sessions.forEach((session) => {
      const subject = session.subject || "Other";
      const current = subjectMap.get(subject) || { minutes: 0, sessions: 0 };
      current.minutes += session.durationMinutes || 0;
      current.sessions += 1;
      subjectMap.set(subject, current);
    });

    const subjectData = Array.from(subjectMap.entries()).map(
      ([subject, data]) => ({
        subject,
        ...data,
      })
    );

    // Performance trend for last 4 weeks
    const performanceData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(now, (i + 1) * 7);
      const weekEnd = subDays(now, i * 7);

      const weekSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });

      const totalMinutes = weekSessions.reduce(
        (total, session) => total + (session.durationMinutes || 0),
        0
      );
      const averageMinutes =
        weekSessions.length > 0 ? totalMinutes / weekSessions.length : 0;

      performanceData.push({
        week: `Week ${4 - i}`,
        average: Math.round(averageMinutes),
        total: totalMinutes,
      });
    }

    setChartData({
      weeklyData,
      subjectData,
      performanceData,
      streakData: [], // Can be calculated based on streak requirements
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  // Pagination helper functions
  const getPaginatedSessions = () => {
    const startIndex = sessionsCurrentPage * ITEMS_PER_PAGE;
    return allSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getPaginatedNotes = () => {
    const startIndex = notesCurrentPage * ITEMS_PER_PAGE;
    return allNotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getMaxSessionsPage = () =>
    Math.max(0, Math.ceil(allSessions.length / ITEMS_PER_PAGE) - 1);
  const getMaxNotesPage = () =>
    Math.max(0, Math.ceil(allNotes.length / ITEMS_PER_PAGE) - 1);

  const handleSessionsPrevPage = () => {
    setSessionsCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleSessionsNextPage = () => {
    setSessionsCurrentPage((prev) => Math.min(getMaxSessionsPage(), prev + 1));
  };

  const handleNotesPrevPage = () => {
    setNotesCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNotesNextPage = () => {
    setNotesCurrentPage((prev) => Math.min(getMaxNotesPage(), prev + 1));
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
                <Typography variant="h4">{allNotes.length}</Typography>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleSessionsPrevPage}
                disabled={sessionsCurrentPage === 0}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {sessionsCurrentPage + 1} / {getMaxSessionsPage() + 1}
              </Typography>
              <IconButton
                size="small"
                onClick={handleSessionsNextPage}
                disabled={sessionsCurrentPage >= getMaxSessionsPage()}
              >
                <ChevronRight />
              </IconButton>
              <Button onClick={() => navigate("/study-sessions")}>
                View All
              </Button>
            </Box>
          </Box>
          {getPaginatedSessions().length > 0 ? (
            <List>
              {getPaginatedSessions().map((session) => (
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleNotesPrevPage}
                disabled={notesCurrentPage === 0}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {notesCurrentPage + 1} / {getMaxNotesPage() + 1}
              </Typography>
              <IconButton
                size="small"
                onClick={handleNotesNextPage}
                disabled={notesCurrentPage >= getMaxNotesPage()}
              >
                <ChevronRight />
              </IconButton>
              <Button onClick={() => navigate("/notes")}>View All</Button>
            </Box>
          </Box>
          {getPaginatedNotes().length > 0 ? (
            <List>
              {getPaginatedNotes().map((note) => (
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

      {/* Compact Blackish Progress Analytics */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          📊 Progress Analytics
        </Typography>

        {/* Compact Progress Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Daily Goal */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
              minHeight: 120,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Timer sx={{ color: "#03dac6", mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Daily Goal
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {formatDuration(progressData.dailyProgress)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (progressData.dailyProgress / progressData.dailyGoal) * 100,
                  100
                )}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#03dac6",
                    borderRadius: 2,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#777", mt: 0.5, display: "block" }}
              >
                {Math.round(
                  (progressData.dailyProgress / progressData.dailyGoal) * 100
                )}
                % of {formatDuration(progressData.dailyGoal)}
              </Typography>
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
              minHeight: 120,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CalendarToday sx={{ color: "#bb86fc", mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Weekly Goal
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {formatDuration(progressData.weeklyProgress)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (progressData.weeklyProgress / progressData.weeklyGoal) * 100,
                  100
                )}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#bb86fc",
                    borderRadius: 2,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#777", mt: 0.5, display: "block" }}
              >
                {Math.round(
                  (progressData.weeklyProgress / progressData.weeklyGoal) * 100
                )}
                % of {formatDuration(progressData.weeklyGoal)}
              </Typography>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
              minHeight: 120,
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <EmojiEvents sx={{ color: "#ff9800", fontSize: 24, mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#ff9800" }}
              >
                {progressData.streak}
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                Day Streak 🔥
              </Typography>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
              minHeight: 120,
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Visibility sx={{ color: "#4caf50", fontSize: 24, mb: 1 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#4caf50" }}
              >
                {Math.round(progressData.completionRate)}%
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Compact Charts Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Weekly Pattern Mini Chart */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ShowChart sx={{ color: "#03dac6", mr: 1, fontSize: 18 }} />
                Weekly Pattern
              </Typography>
              <Box sx={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.weeklyData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="day"
                      stroke="#777"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2d2d2d",
                        border: "1px solid #555",
                        borderRadius: "6px",
                        color: "#ffffff !important",
                        fontSize: "12px",
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        textAlign: "left",
                      }}
                      labelStyle={{
                        color: "#ffffff !important",
                        fontWeight: "bold",
                      }}
                      itemStyle={{
                        color: "#ffffff !important",
                        fontWeight: "bold",
                      }}
                      formatter={(value) => [`${value} min`, "Study Time"]}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="#03dac6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Subject Distribution Mini Chart */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#fff",
              border: "1px solid #333",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Assignment sx={{ color: "#bb86fc", mr: 1, fontSize: 18 }} />
                Subject Focus
              </Typography>
              <Box sx={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.subjectData.slice(0, 5)} // Show top 5 subjects
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="minutes"
                      nameKey="subject"
                    >
                      {chartData.subjectData.slice(0, 5).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${index * 60 + 200}, 60%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2d2d2d",
                        border: "1px solid #555",
                        borderRadius: "6px",
                        color: "#ffffff !important",
                        fontSize: "12px",
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        textAlign: "left",
                      }}
                      labelStyle={{
                        color: "#ffffff !important",
                        fontWeight: "bold",
                      }}
                      itemStyle={{
                        color: "#ffffff !important",
                        fontWeight: "bold",
                      }}
                      formatter={(value, name) => [`${value} min`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
