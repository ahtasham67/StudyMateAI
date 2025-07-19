import {
  Add,
  Delete,
  Edit,
  MoreVert,
  PlayArrow,
  Stop,
  Timer,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { studySessionAPI } from "../services/api";
import { StudySession } from "../types";

const StudySessions: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await studySessionAPI.getAll();
      setSessions(response.data);
    } catch (err: any) {
      setError("Failed to load study sessions");
      console.error("Sessions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!formData.title.trim() || !formData.subject.trim()) {
      setError("Title and subject are required");
      return;
    }

    try {
      const newSession = {
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        startTime: new Date().toISOString(),
      };

      await studySessionAPI.create(newSession);
      await fetchSessions();
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start study session");
    }
  };

  const handleEndSession = async (sessionId: number) => {
    try {
      await studySessionAPI.endSession(sessionId);
      await fetchSessions();
      handleMenuClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to end study session");
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await studySessionAPI.delete(sessionId);
      await fetchSessions();
      handleMenuClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete study session");
    }
  };

  const handleEditSession = async () => {
    if (!editingSession) return;

    try {
      await studySessionAPI.update(editingSession.id, {
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
      });
      await fetchSessions();
      setOpenDialog(false);
      setEditingSession(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update study session");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      description: "",
    });
  };

  const openEditDialog = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      subject: session.subject,
      description: session.description || "",
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const openCreateDialog = () => {
    setEditingSession(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    session: StudySession
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedSession(session);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  const isSessionActive = (session: StudySession) => {
    return !session.endTime;
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h3" component="h1">
          Study Sessions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          size="large"
        >
          Start New Session
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No study sessions yet
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Start your first study session to track your learning progress
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {sessions.map((session) => (
            <Card key={session.id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon>
                  {isSessionActive(session) ? (
                    <Timer color="primary" />
                  ) : (
                    <Stop color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{session.title}</Typography>
                      {isSessionActive(session) && (
                        <Chip
                          label="Active"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Subject: {session.subject}
                      </Typography>
                      {session.description && (
                        <Typography variant="body2" color="text.secondary">
                          {session.description}
                        </Typography>
                      )}
                      <Box display="flex" gap={2} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Started:{" "}
                          {format(
                            new Date(session.startTime),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                        {session.endTime && (
                          <Typography variant="body2" color="text.secondary">
                            Ended:{" "}
                            {format(
                              new Date(session.endTime),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </Typography>
                        )}
                        {session.durationMinutes && (
                          <Chip
                            size="small"
                            label={formatDuration(session.durationMinutes)}
                            color="primary"
                          />
                        )}
                        {isSessionActive(session) && (
                          <Typography variant="body2" color="primary">
                            Running for{" "}
                            {formatDistanceToNow(new Date(session.startTime))}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuClick(e, session)}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Card>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedSession && isSessionActive(selectedSession) && (
          <MenuItem onClick={() => handleEndSession(selectedSession.id)}>
            <Stop fontSize="small" sx={{ mr: 1 }} />
            End Session
          </MenuItem>
        )}
        <MenuItem
          onClick={() => selectedSession && openEditDialog(selectedSession)}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedSession && handleDeleteSession(selectedSession.id)
          }
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSession ? "Edit Study Session" : "Start New Study Session"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Session Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <TextField
              label="Subject"
              fullWidth
              variant="outlined"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingSession ? handleEditSession : handleStartSession}
            variant="contained"
            startIcon={editingSession ? <Edit /> : <PlayArrow />}
          >
            {editingSession ? "Update" : "Start Session"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={openCreateDialog}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default StudySessions;
