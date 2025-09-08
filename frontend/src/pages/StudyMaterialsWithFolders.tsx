import {
  Chat,
  Delete,
  Download,
  Edit,
  Folder as FolderIcon,
  GridView,
  InsertDriveFile,
  MoreVert,
  Note as NoteIcon,
  Quiz as QuizIcon,
  Upload,
  ViewList,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import FolderTree from "../components/FolderTree";
import StudyMaterialChatbot from "../components/StudyMaterialChatbot";
import {
  folderAPI,
  notesAPI,
  quizAPI,
  studyMaterialsAPI,
} from "../services/api";
import { CreateQuizRequest, Note } from "../types";

interface StudyMaterial {
  id: number;
  fileName: string;
  originalName: string;
  fileType: "PDF" | "PPTX" | "PPT";
  fileSize: number;
  subject?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface StudyFolder {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

const StudyMaterialsWithFolders: React.FC = () => {
  // State management
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [folderHierarchy, setFolderHierarchy] = useState<StudyFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [contentType, setContentType] = useState<"materials" | "notes" | "all">(
    "all"
  );

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Quiz form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM"
  );
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuMaterial, setMenuMaterial] = useState<StudyMaterial | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let response;

        if (selectedFolderId === null) {
          // Load unorganized materials
          response = await folderAPI.getUnorganizedMaterials();
        } else {
          // Load materials in specific folder
          response = await folderAPI.getMaterialsInFolder(selectedFolderId);
        }

        setMaterials(response.data);

        // Also load notes
        await loadNotes();
      } catch (err: any) {
        setError("Failed to load materials");
        console.error("Error loading materials:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedFolderId]);

  useEffect(() => {
    const loadHierarchy = async () => {
      if (!selectedFolderId) return;

      try {
        const response = await folderAPI.getFolderHierarchy(selectedFolderId);
        setFolderHierarchy(response.data);
      } catch (err: any) {
        console.error("Error loading folder hierarchy:", err);
      }
    };

    if (selectedFolderId) {
      loadHierarchy();
    } else {
      setFolderHierarchy([]);
    }
  }, [selectedFolderId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedFolderId === null) {
        // Load unorganized materials
        response = await folderAPI.getUnorganizedMaterials();
      } else {
        // Load materials in specific folder
        response = await folderAPI.getMaterialsInFolder(selectedFolderId);
      }

      setMaterials(response.data);
    } catch (err: any) {
      setError("Failed to load materials");
      console.error("Error loading materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await notesAPI.getAll();
      // Filter notes by folder if needed (when folder-based notes are implemented in backend)
      setNotes(response.data);
    } catch (err: any) {
      setError("Failed to load notes");
      console.error("Error loading notes:", err);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteSubject("");
    setNoteTags("");
    setNoteDialogOpen(true);
  };

  // Filter content based on content type and folder
  const getFilteredContent = () => {
    const folderMaterials = materials.filter((material) =>
      selectedFolderId
        ? material.folder?.id === selectedFolderId
        : !material.folder
    );
    const folderNotes = notes.filter((note) =>
      selectedFolderId ? note.folder?.id === selectedFolderId : !note.folder
    );

    switch (contentType) {
      case "materials":
        return { materials: folderMaterials, notes: [] };
      case "notes":
        return { materials: [], notes: folderNotes };
      default: // 'all'
        return { materials: folderMaterials, notes: folderNotes };
    }
  };

  const { materials: filteredMaterials, notes: filteredNotes } =
    getFilteredContent();

  const renderNoteCard = (note: Note) => (
    <Card key={note.id} sx={{ position: "relative" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {note.title}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              setMenuAnchorEl(e.currentTarget);
              setSelectedNote(note);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {note.subject && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Subject: {note.subject}
          </Typography>
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            <Chip label={note.category} size="small" variant="outlined" />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Created: {format(new Date(note.createdAt), "MMM dd, yyyy")}
        </Typography>
      </CardContent>
    </Card>
  );

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject || "");
    setNoteTags(note.category || "");
    setNoteDialogOpen(true);
    setMenuAnchorEl(null);
  };

  const handleSaveNote = async () => {
    try {
      setSavingNote(true);
      const selectedFolderId =
        folderHierarchy.length > 0
          ? folderHierarchy[folderHierarchy.length - 1]?.id
          : null;

      const noteData = {
        title: noteTitle,
        content: noteContent,
        subject: noteSubject || undefined,
        category: noteTags || undefined,
        folder: selectedFolderId
          ? {
              id: selectedFolderId,
            }
          : undefined,
      };

      if (editingNote) {
        await notesAPI.update(editingNote.id, noteData);
        setSnackbar({
          open: true,
          message: "Note updated successfully!",
          severity: "success",
        });
      } else {
        await notesAPI.create(noteData);
        setSnackbar({
          open: true,
          message: "Note created successfully!",
          severity: "success",
        });
      }

      setNoteDialogOpen(false);
      await loadNotes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to save note",
        severity: "error",
      });
      console.error("Error saving note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await notesAPI.delete(noteId);
      setSnackbar({
        open: true,
        message: "Note deleted successfully!",
        severity: "success",
      });
      await loadNotes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to delete note",
        severity: "error",
      });
      console.error("Error deleting note:", err);
    }
  };

  const handleFolderSelect = (folderId: number | null) => {
    setSelectedFolderId(folderId);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("subject", uploadSubject);
      formData.append("description", uploadDescription);
      if (selectedFolderId) {
        formData.append("folderId", selectedFolderId.toString());
      }

      await studyMaterialsAPI.upload(formData);

      // Reset form and reload materials
      setUploadFile(null);
      setUploadSubject("");
      setUploadDescription("");
      setUploadDialogOpen(false);
      await loadMaterials();
    } catch (err: any) {
      setError("Failed to upload file");
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const response = await studyMaterialsAPI.download(material.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = material.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("Failed to download file");
      console.error("Error downloading file:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      await studyMaterialsAPI.delete(selectedMaterial.id);
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
      await loadMaterials();
    } catch (err: any) {
      setError("Failed to delete file");
      console.error("Error deleting file:", err);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    material: StudyMaterial
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuMaterial(material);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMaterial(null);
    setSelectedNote(null);
  };

  const handleOpenChatbot = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setChatbotOpen(true);
  };

  const handleOpenQuizDialog = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setQuizTitle(`Quiz - ${material.originalName}`);
    setQuizDialogOpen(true);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedMaterial) return;

    try {
      setGeneratingQuiz(true);
      const quizRequest: CreateQuizRequest = {
        studyMaterialId: selectedMaterial.id,
        title: quizTitle,
        description: quizDescription || "",
        numberOfQuestions,
        durationMinutes,
        difficulty,
      };

      await quizAPI.generateQuiz(quizRequest);
      setQuizDialogOpen(false);
      setQuizTitle("");
      setQuizDescription("");
      setSelectedMaterial(null);

      // Show success notification
      setSnackbar({
        open: true,
        message: "Quiz generated successfully!",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error generating quiz:", err);
      setSnackbar({
        open: true,
        message: "Failed to generate quiz. Please try again.",
        severity: "error",
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getFileTypeColor = (fileType: string): string => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "#d32f2f";
      case "ppt":
      case "pptx":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  const renderMaterialCard = (material: StudyMaterial) => (
    <Card
      key={material.id}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <InsertDriveFile
            sx={{ color: getFileTypeColor(material.fileType), mr: 1 }}
          />
          <Typography variant="h6" component="div" noWrap>
            {material.originalName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            label={material.fileType.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getFileTypeColor(material.fileType),
              color: "white",
            }}
          />
          <Chip
            label={formatFileSize(material.fileSize)}
            size="small"
            variant="outlined"
          />
        </Box>

        {material.subject && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Subject: {material.subject}
          </Typography>
        )}

        {material.description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {material.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Uploaded {format(new Date(material.createdAt), "MMM dd, yyyy")}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={() => handleOpenChatbot(material)}>
          <Chat sx={{ mr: 0.5 }} />
          Chat
        </Button>
        <Button
          size="small"
          onClick={() => handleOpenQuizDialog(material)}
          color="secondary"
        >
          <QuizIcon sx={{ mr: 0.5 }} />
          Quiz
        </Button>
        <Button size="small" onClick={() => handleDownload(material)}>
          <Download sx={{ mr: 0.5 }} />
          Download
        </Button>
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, material)}>
          <MoreVert />
        </IconButton>
      </CardActions>
    </Card>
  );

  const renderMaterialListItem = (material: StudyMaterial) => (
    <Card
      key={material.id}
      sx={{
        mb: 1,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateX(4px)",
          boxShadow: 2,
        },
      }}
    >
      <ListItem
        sx={{
          py: 2,
          px: 3,
        }}
      >
        <Avatar
          sx={{
            mr: 2,
            bgcolor: getFileTypeColor(material.fileType),
            width: 48,
            height: 48,
          }}
        >
          <InsertDriveFile />
        </Avatar>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6" component="div">
                {material.originalName}
              </Typography>
              <Chip
                label={material.fileType.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: getFileTypeColor(material.fileType),
                  color: "white",
                }}
              />
              <Chip
                label={formatFileSize(material.fileSize)}
                size="small"
                variant="outlined"
              />
            </Box>
          }
          secondary={
            <Box>
              {material.subject && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Subject: {material.subject}
                </Typography>
              )}
              {material.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {material.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Uploaded {format(new Date(material.createdAt), "MMM dd, yyyy")}
              </Typography>
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              justifyContent: "flex-end",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenChatbot(material)}
              sx={{ minWidth: { xs: "auto", sm: "64px" } }}
            >
              <Chat fontSize="small" />
              <Typography
                variant="caption"
                sx={{ ml: 0.5, display: { xs: "none", sm: "inline" } }}
              >
                Chat
              </Typography>
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleOpenQuizDialog(material)}
              sx={{ minWidth: { xs: "auto", sm: "64px" } }}
            >
              <QuizIcon fontSize="small" />
              <Typography
                variant="caption"
                sx={{ ml: 0.5, display: { xs: "none", sm: "inline" } }}
              >
                Quiz
              </Typography>
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDownload(material)}
              sx={{ minWidth: { xs: "auto", sm: "80px" } }}
            >
              <Download fontSize="small" />
              <Typography
                variant="caption"
                sx={{ ml: 0.5, display: { xs: "none", sm: "inline" } }}
              >
                Download
              </Typography>
            </Button>
            <IconButton
              onClick={(e) => handleMenuOpen(e, material)}
              size="small"
            >
              <MoreVert />
            </IconButton>
          </Box>
        </ListItemSecondaryAction>
      </ListItem>
    </Card>
  );

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Sidebar - Folder Tree */}
      <Paper
        sx={{
          width: 300,
          borderRadius: 0,
          borderRight: 1,
          borderColor: "divider",
          p: 2,
          overflow: "auto",
        }}
      >
        <FolderTree
          onFolderSelect={handleFolderSelect}
          selectedFolderId={selectedFolderId}
        />
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 0,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" component="h1">
                Learning Materials - Organized
              </Typography>

              {/* Breadcrumbs */}
              {folderHierarchy.length > 0 && (
                <Breadcrumbs sx={{ mt: 1 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleFolderSelect(null)}
                    sx={{ textDecoration: "none" }}
                  >
                    Unorganized Files
                  </Link>
                  {folderHierarchy.map((folder, index) => (
                    <Link
                      key={folder.id}
                      component="button"
                      variant="body2"
                      onClick={() => handleFolderSelect(folder.id)}
                      sx={{
                        textDecoration: "none",
                        fontWeight:
                          index === folderHierarchy.length - 1
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {folder.name}
                    </Link>
                  ))}
                </Breadcrumbs>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Content Filter Chips */}
              <Box sx={{ display: "flex", gap: 0.5, mr: 2 }}>
                <Chip
                  label="All"
                  color={contentType === "all" ? "primary" : "default"}
                  onClick={() => setContentType("all")}
                  clickable
                />
                <Chip
                  label="Files"
                  color={contentType === "materials" ? "primary" : "default"}
                  onClick={() => setContentType("materials")}
                  clickable
                />
                <Chip
                  label="Notes"
                  color={contentType === "notes" ? "primary" : "default"}
                  onClick={() => setContentType("notes")}
                  clickable
                />
              </Box>

              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setViewMode("grid")}
                  color={viewMode === "grid" ? "primary" : "default"}
                  sx={{
                    bgcolor:
                      viewMode === "grid" ? "primary.light" : "transparent",
                    "&:hover": {
                      bgcolor:
                        viewMode === "grid" ? "primary.main" : "action.hover",
                    },
                  }}
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton
                  onClick={() => setViewMode("list")}
                  color={viewMode === "list" ? "primary" : "default"}
                  sx={{
                    bgcolor:
                      viewMode === "list" ? "primary.light" : "transparent",
                    "&:hover": {
                      bgcolor:
                        viewMode === "list" ? "primary.main" : "action.hover",
                    },
                  }}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<NoteIcon />}
                onClick={handleCreateNote}
                sx={{ mr: 1 }}
              >
                Create Note
              </Button>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload File
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: 2, overflow: "auto" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredMaterials.length === 0 && filteredNotes.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50%",
                textAlign: "center",
              }}
            >
              <FolderIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {contentType === "materials"
                  ? "No files found"
                  : contentType === "notes"
                  ? "No notes found"
                  : "No content found"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedFolderId
                  ? `This folder is empty. ${
                      contentType === "notes"
                        ? "Create some notes"
                        : "Upload some files"
                    } to get started.`
                  : `No unorganized ${
                      contentType === "notes"
                        ? "notes"
                        : contentType === "materials"
                        ? "files"
                        : "content"
                    }. ${
                      contentType === "notes"
                        ? "All notes are organized in folders"
                        : "All files are organized in folders"
                    }.`}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {(contentType === "all" || contentType === "materials") && (
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload File
                  </Button>
                )}
                {(contentType === "all" || contentType === "notes") && (
                  <Button
                    variant="outlined"
                    startIcon={<NoteIcon />}
                    onClick={handleCreateNote}
                  >
                    Create Note
                  </Button>
                )}
              </Box>
            </Box>
          ) : viewMode === "grid" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 2,
              }}
            >
              {filteredMaterials.map((material) =>
                renderMaterialCard(material)
              )}
              {filteredNotes.map((note) => renderNoteCard(note))}
            </Box>
          ) : (
            <List sx={{ width: "100%" }}>
              {filteredMaterials.map((material) =>
                renderMaterialListItem(material)
              )}
              {filteredNotes.map((note, index) => (
                <ListItem
                  key={`note-${note.id}`}
                  divider={index < filteredNotes.length - 1}
                >
                  <ListItemText
                    primary={note.title}
                    secondary={
                      <Box>
                        {note.subject && (
                          <Typography variant="body2" color="text.secondary">
                            Subject: {note.subject}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mt: 0.5,
                          }}
                        >
                          {note.content}
                        </Typography>
                        {note.category && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 1,
                            }}
                          >
                            <Chip
                              label={note.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Created:{" "}
                          {format(new Date(note.createdAt), "MMM dd, yyyy")}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={(e) => {
                        setMenuAnchorEl(e.currentTarget);
                        setSelectedNote(note);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNote ? (
          // Note menu items
          <>
            <MenuItem
              onClick={() => {
                if (selectedNote) handleEditNote(selectedNote);
                handleMenuClose();
              }}
            >
              <Edit sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedNote) handleDeleteNote(selectedNote.id);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <Delete sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        ) : (
          // Material menu items
          <>
            <MenuItem
              onClick={() => {
                if (menuMaterial) handleDownload(menuMaterial);
                handleMenuClose();
              }}
            >
              <Download sx={{ mr: 1 }} />
              Download
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSelectedMaterial(menuMaterial);
                setDeleteDialogOpen(true);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <Delete sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Study Material</DialogTitle>
        <DialogContent>
          <TextField
            type="file"
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ accept: ".pdf,.ppt,.pptx" }}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setUploadFile(target.files?.[0] || null);
            }}
          />
          <TextField
            margin="normal"
            label="Subject"
            fullWidth
            variant="outlined"
            value={uploadSubject}
            onChange={(e) => setUploadSubject(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
          />
          {selectedFolderId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              File will be uploaded to the current folder.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMaterial?.originalName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Generation Dialog */}
      <Dialog
        open={quizDialogOpen}
        onClose={() => setQuizDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Quiz</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Quiz Title"
            fullWidth
            variant="outlined"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Number of Questions"
            type="number"
            fullWidth
            variant="outlined"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
            inputProps={{ min: 1, max: 50 }}
          />
          <TextField
            margin="normal"
            label="Duration (Minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            inputProps={{ min: 5, max: 180 }}
          />
          <TextField
            margin="normal"
            label="Difficulty"
            select
            fullWidth
            variant="outlined"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
            }
          >
            <MenuItem value="EASY">Easy</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HARD">Hard</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateQuiz}
            variant="contained"
            disabled={!quizTitle.trim() || generatingQuiz}
          >
            {generatingQuiz ? <CircularProgress size={20} /> : "Generate Quiz"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chatbot Drawer */}
      {selectedMaterial && (
        <StudyMaterialChatbot
          open={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
          selectedMaterial={selectedMaterial}
          materials={materials}
        />
      )}

      {/* Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
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
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Subject"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Content"
              multiline
              rows={8}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={noteTags}
              onChange={(e) => setNoteTags(e.target.value)}
              helperText="Enter tags separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={!noteTitle || !noteContent || savingNote}
          >
            {savingNote ? (
              <CircularProgress size={20} />
            ) : editingNote ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudyMaterialsWithFolders;
