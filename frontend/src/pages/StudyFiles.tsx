import {
  Add,
  Chat,
  Close,
  CloudUpload,
  Delete,
  Download,
  PictureAsPdf,
  Quiz as QuizIcon,
  Search,
  Slideshow,
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
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import StudyMaterialChatbot from "../components/StudyMaterialChatbot";
import { quizAPI, studyMaterialsAPI } from "../services/api";
import { CreateQuizRequest } from "../types";

interface StudyMaterial {
  id: number;
  fileName: string;
  originalName: string;
  fileType: "PDF" | "PPTX";
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  description?: string;
}

const StudyFiles: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM"
  );

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await studyMaterialsAPI.getAll();
      setMaterials(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError("Failed to fetch study materials");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <PictureAsPdf color="error" />;
      case "PPTX":
        return <Slideshow color="primary" />;
      default:
        return <PictureAsPdf />;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (subject) formData.append("subject", subject);
      if (description) formData.append("description", description);

      await studyMaterialsAPI.upload(formData);
      setUploadDialog(false);
      setSelectedFile(null);
      setSubject("");
      setDescription("");
      await fetchMaterials();
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await studyMaterialsAPI.delete(id);
        await fetchMaterials();
      } catch (error) {
        console.error("Error deleting material:", error);
        setError("Failed to delete material");
      }
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
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file");
    }
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
      setQuizDialog(false);
      setQuizTitle("");
      setQuizDescription("");
      setSelectedMaterial(null);

      // Show success notification
      setSnackbar({
        open: true,
        message: "Quiz generated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate quiz. Please try again.",
        severity: "error",
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleOpenQuizDialog = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setQuizTitle(`Quiz - ${material.originalName}`);
    setQuizDialog(true);
  };

  const handleOpenChatbot = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setChatbotOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.originalName
        ?.toLowerCase()
        ?.includes(searchTerm.toLowerCase()) ||
      material.subject?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Study Materials
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }} paragraph>
          Upload and manage your PDF documents and PowerPoint presentations for
          studying.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setUploadDialog(true)}
        >
          Upload Material
        </Button>

        <TextField
          placeholder="Search materials..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredMaterials.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                {searchTerm
                  ? "No materials match your search"
                  : "No study materials uploaded yet"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1 }}
              >
                {!searchTerm &&
                  "Upload your first PDF or PowerPoint file to get started!"}
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
              }}
            >
              {filteredMaterials.map((material) => (
                <Card key={material.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getFileIcon(material.fileType)}
                      <Typography
                        variant="h6"
                        sx={{ ml: 1, flexGrow: 1, color: "text.primary" }}
                        noWrap
                      >
                        {material.originalName}
                      </Typography>
                    </Box>

                    {material.subject && (
                      <Chip
                        label={material.subject}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}

                    {material.description && (
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "text.primary" }}
                      >
                        {material.description}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Size: {formatFileSize(material.fileSize)}
                    </Typography>
                    <br />
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Uploaded:{" "}
                      {new Date(material.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Chat />}
                      onClick={() => handleOpenChatbot(material)}
                    >
                      Chat
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<QuizIcon />}
                      onClick={() => handleOpenQuizDialog(material)}
                    >
                      Generate Quiz
                    </Button>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownload(material)}
                      title="Download"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(material.id)}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Study Material
          <IconButton
            onClick={() => setUploadDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <input
              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              style={{ display: "none" }}
              id="file-upload"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {selectedFile ? selectedFile.name : "Choose File"}
              </Button>
            </label>
          </Box>

          <TextField
            label="Subject (Optional)"
            variant="outlined"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Mathematics, Physics, History"
          />

          <TextField
            label="Description (Optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the content..."
          />

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Generation Dialog */}
      <Dialog
        open={quizDialog}
        onClose={() => setQuizDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Generate Quiz
          <IconButton
            onClick={() => setQuizDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Quiz Title"
            variant="outlined"
            fullWidth
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Description (Optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="Brief description of the quiz..."
          />

          <TextField
            label="Number of Questions"
            variant="outlined"
            fullWidth
            type="number"
            value={numberOfQuestions}
            onChange={(e) =>
              setNumberOfQuestions(parseInt(e.target.value) || 1)
            }
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 50 }}
            required
          />

          <TextField
            label="Duration (Minutes)"
            variant="outlined"
            fullWidth
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 5)}
            sx={{ mb: 2 }}
            inputProps={{ min: 5, max: 180 }}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty Level"
              onChange={(e) =>
                setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
              }
            >
              <MenuItem value="EASY">Easy</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HARD">Hard</MenuItem>
            </Select>
          </FormControl>

          {selectedMaterial && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Source Material:
              </Typography>
              <Typography variant="body2">
                {selectedMaterial.originalName}
              </Typography>
              {selectedMaterial.subject && (
                <Typography variant="body2" color="text.secondary">
                  Subject: {selectedMaterial.subject}
                </Typography>
              )}
            </Box>
          )}

          {generatingQuiz && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Generating quiz questions using AI...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setQuizDialog(false)}
            disabled={generatingQuiz}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateQuiz}
            variant="contained"
            disabled={!quizTitle || !selectedMaterial || generatingQuiz}
            startIcon={
              generatingQuiz ? <CircularProgress size={16} /> : <QuizIcon />
            }
          >
            {generatingQuiz ? "Generating..." : "Generate Quiz"}
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
    </Container>
  );
};

export default StudyFiles;
