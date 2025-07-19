import { Add, Delete, Edit, MoreVert, Search } from "@mui/icons-material";
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
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { notesAPI } from "../services/api";
import { Note } from "../types";

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    tags: "",
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const filterNotes = () => {
      if (!searchQuery.trim()) {
        setFilteredNotes(notes);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.subject?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredNotes(filtered);
    };

    filterNotes();
  }, [notes, searchQuery]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes(response.data);
    } catch (err: any) {
      setError("Failed to load notes");
      console.error("Notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const newNote = {
        title: formData.title,
        content: formData.content,
        subject: formData.subject || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
      };

      await notesAPI.create(newNote);
      await fetchNotes();
      setOpenDialog(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create note");
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      const updatedNote = {
        title: formData.title,
        content: formData.content,
        subject: formData.subject || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
      };

      await notesAPI.update(editingNote.id, updatedNote);
      await fetchNotes();
      setOpenDialog(false);
      setEditingNote(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await notesAPI.delete(noteId);
      await fetchNotes();
      handleMenuClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      subject: "",
      tags: "",
    });
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subject: note.subject || "",
      tags: note.tags?.join(", ") || "",
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const openCreateDialog = () => {
    setEditingNote(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    note: Note
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
          My Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          size="large"
        >
          Create Note
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search notes by title, content, subject, or tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              {searchQuery
                ? "No notes found matching your search"
                : "No notes yet"}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first note to start organizing your knowledge"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredNotes.map((note) => (
            <Card key={note.id} sx={{ height: "fit-content" }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ flex: 1, mr: 1 }}
                  >
                    {note.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, note)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {truncateContent(note.content)}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {note.subject && (
                    <Chip
                      label={note.subject}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  )}
                  {note.tags?.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {format(new Date(note.createdAt), "MMM dd, yyyy")}
                </Typography>
                {note.updatedAt !== note.createdAt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Updated: {format(new Date(note.updatedAt), "MMM dd, yyyy")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedNote && openEditDialog(selectedNote)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: "80vh" },
        }}
      >
        <DialogTitle>
          {editingNote ? "Edit Note" : "Create New Note"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Note Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <TextField
              label="Subject (Optional)"
              fullWidth
              variant="outlined"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              variant="outlined"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g. physics, homework, chapter-1"
            />
            <TextField
              label="Content"
              fullWidth
              variant="outlined"
              multiline
              rows={12}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              placeholder="Write your note content here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editingNote ? handleUpdateNote : handleCreateNote}
            variant="contained"
            startIcon={editingNote ? <Edit /> : <Add />}
          >
            {editingNote ? "Update Note" : "Create Note"}
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

export default Notes;
