import {
  Add,
  Chat,
  CloudUpload,
  Delete,
  Download,
  Edit,
  MoreVert,
  Note as NoteIcon,
  PictureAsPdf,
  Search,
  Slideshow,
  UploadFile,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
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
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import StudyMaterialChatbot from "../components/StudyMaterialChatbot";
import { notesAPI } from "../services/api";
import { Note } from "../types";

interface StudyMaterial {
  id: number;
  fileName: string;
  originalName: string;
  fileType: "PDF" | "PPTX" | "PPT";
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  description?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LearningMaterials: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Study Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialSubject, setMaterialSubject] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedMaterialForChat, setSelectedMaterialForChat] =
    useState<StudyMaterial | null>(null);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [noteFormData, setNoteFormData] = useState({
    title: "",
    content: "",
    subject: "",
    tags: "",
  });

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
    fetchNotes();
  }, []);

  useEffect(() => {
    const filterNotes = () => {
      if (!noteSearchQuery.trim()) {
        setFilteredNotes(notes);
        return;
      }

      const query = noteSearchQuery.toLowerCase();
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.subject?.toLowerCase().includes(query) ||
          note.category?.toLowerCase().includes(query)
      );
      setFilteredNotes(filtered);
    };

    filterNotes();
  }, [noteSearchQuery, notes]);

  // Study Materials functions
  const fetchMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/study-materials",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch materials");
      }

      const data = await response.json();
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load study materials");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        setSelectedFile(file);
        setError(null);
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        fileType === "application/vnd.ms-powerpoint" ||
        fileName.endsWith(".pptx") ||
        fileName.endsWith(".ppt")
      ) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a PDF, PPT, or PPTX file");
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", materialSubject);
      formData.append("description", materialDescription);

      const response = await fetch(
        "http://localhost:8080/api/study-materials/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      setSuccess("File uploaded successfully!");
      setUploadDialog(false);
      setSelectedFile(null);
      setMaterialSubject("");
      setMaterialDescription("");
      await fetchMaterials();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/study-materials/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete material");
      }

      setSuccess("Material deleted successfully!");
      await fetchMaterials();
    } catch (err) {
      console.error("Error deleting material:", err);
      setError("Failed to delete material");
    }
  };

  const openChatbot = (material: StudyMaterial) => {
    setSelectedMaterialForChat(material);
    setChatbotOpen(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <PictureAsPdf color="error" />;
      case "PPTX":
      case "PPT":
        return <Slideshow color="primary" />;
      default:
        return <PictureAsPdf />;
    }
  };

  // Notes functions
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const response = await notesAPI.getAll();
      setNotes(response.data);
      setFilteredNotes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await notesAPI.update(editingNote.id, {
          ...noteFormData,
          category: noteFormData.tags, // Map tags input to category for backend
        });
        setSuccess("Note updated successfully!");
      } else {
        await notesAPI.create({
          ...noteFormData,
          category: noteFormData.tags, // Map tags input to category for backend
        });
        setSuccess("Note created successfully!");
      }

      setOpenNoteDialog(false);
      setEditingNote(null);
      setNoteFormData({ title: "", content: "", subject: "", tags: "" });
      await fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note");
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      content: note.content,
      subject: note.subject || "",
      tags: note.category || "",
    });
    setOpenNoteDialog(true);
    handleCloseMenu();
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await notesAPI.delete(noteId);
      setSuccess("Note deleted successfully!");
      await fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note");
    }
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.originalName
        .toLowerCase()
        .includes(materialSearchTerm.toLowerCase()) ||
      material.subject?.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Learning Materials
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your study materials and notes in one place
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab
            label="Study Materials"
            icon={<UploadFile />}
            iconPosition="start"
          />
          <Tab label="Notes" icon={<NoteIcon />} iconPosition="start" />
        </Tabs>

        {/* Study Materials Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search materials..."
              value={materialSearchTerm}
              onChange={(e) => setMaterialSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialog(true)}
            >
              Upload File
            </Button>
          </Box>

          {materialsLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredMaterials.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CloudUpload
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No study materials found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {materialSearchTerm
                  ? "No materials match your search"
                  : "Upload your first PDF or PowerPoint file to get started!"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialog(true)}
              >
                Upload Your First File
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {filteredMaterials.map((material) => (
                <Card key={material.id} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getFileIcon(material.fileType)}
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6" noWrap>
                          {material.originalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {material.fileType} •{" "}
                          {formatFileSize(material.fileSize)}
                        </Typography>
                      </Box>
                    </Box>

                    {material.subject && (
                      <Chip
                        label={material.subject}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}

                    {material.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {material.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Uploaded{" "}
                      {format(new Date(material.createdAt), "MMM dd, yyyy")}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Chat />}
                      onClick={() => openChatbot(material)}
                    >
                      Chat
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `http://localhost:8080/api/study-materials/${material.id}/download`;
                        link.download = material.originalName;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* Notes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search notes..."
              value={noteSearchQuery}
              onChange={(e) => setNoteSearchQuery(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {notesLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotes.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <NoteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notes found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {noteSearchQuery
                  ? "No notes match your search"
                  : "Create your first note to get started!"}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {filteredNotes.map((note) => (
                <Card key={note.id} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {note.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedNote(note);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {note.subject && (
                      <Chip label={note.subject} size="small" sx={{ mb: 1 }} />
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {note.content}
                    </Typography>

                    {note.category && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={note.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      {format(
                        new Date(note.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Notes FAB */}
          <Fab
            color="primary"
            aria-label="add note"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            onClick={() => setOpenNoteDialog(true)}
          >
            <Add />
          </Fab>
        </TabPanel>
      </Paper>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Study Material</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleFileSelect}
              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose File (PDF, PPT, or PPTX)
              </Button>
            </label>

            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Subject"
              value={materialSubject}
              onChange={(e) => setMaterialSubject(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </DialogActions>
        {uploading && <LinearProgress />}
      </Dialog>

      {/* Note Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingNote ? "Edit Note" : "Create New Note"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={noteFormData.title}
              onChange={(e) =>
                setNoteFormData({ ...noteFormData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Subject"
              value={noteFormData.subject}
              onChange={(e) =>
                setNoteFormData({ ...noteFormData, subject: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Content"
              multiline
              rows={8}
              value={noteFormData.content}
              onChange={(e) =>
                setNoteFormData({ ...noteFormData, content: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={noteFormData.tags}
              onChange={(e) =>
                setNoteFormData({ ...noteFormData, tags: e.target.value })
              }
              helperText="Enter tags separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={!noteFormData.title || !noteFormData.content}
          >
            {editingNote ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => selectedNote && handleEditNote(selectedNote)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Chatbot Dialog */}
      <StudyMaterialChatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        selectedMaterial={selectedMaterialForChat}
        materials={materials}
      />
    </Container>
  );
};

export default LearningMaterials;
