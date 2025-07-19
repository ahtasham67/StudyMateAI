// Dashboard component for StudyMate application
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  School,
  Note,
  Timer,
  TrendingUp,
  Add,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studySessionAPI, notesAPI } from '../services/api';
import { StudySession, Note as NoteType, StudySessionStats } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudySessionStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, sessionsResponse, notesResponse] = await Promise.all([
        studySessionAPI.getStats(),
        studySessionAPI.getAll(),
        notesAPI.getAll(),
      ]);

      setStats(statsResponse.data);
      setRecentSessions(sessionsResponse.data.slice(0, 5));
      setRecentNotes(notesResponse.data.slice(0, 5));
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4 
        }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <School color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h4">
                  {stats?.totalSessions || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Timer color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Study Time
                </Typography>
                <Typography variant="h4">
                  {stats ? formatDuration(stats.totalMinutes) : '0m'}
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
                  {stats ? formatDuration(Math.round(stats.averageDuration)) : '0m'}
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
                  This Week
                </Typography>
                <Typography variant="h4">
                  {stats?.sessionsThisWeek || 0}
                </Typography>
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
            onClick={() => navigate('/study-sessions')}
            size="large"
          >
            Start Study Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate('/notes')}
            size="large"
          >
            Create Note
          </Button>
        </Box>
      </Paper>

      {/* Recent Content */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3 
        }}
      >
        {/* Recent Study Sessions */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Study Sessions</Typography>
            <Button onClick={() => navigate('/study-sessions')}>View All</Button>
          </Box>
          {recentSessions.length > 0 ? (
            <List>
              {recentSessions.map((session) => (
                <ListItem key={session.id}>
                  <ListItemIcon>
                    {session.endTime ? <Stop color="action" /> : <PlayArrow color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {session.subject} • {format(new Date(session.startTime), 'MMM dd, yyyy')}
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
            <Typography color="text.secondary">No study sessions yet</Typography>
          )}
        </Paper>

        {/* Recent Notes */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Notes</Typography>
            <Button onClick={() => navigate('/notes')}>View All</Button>
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
                          {format(new Date(note.createdAt), 'MMM dd, yyyy')}
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
