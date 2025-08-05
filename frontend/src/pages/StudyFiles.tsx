import {
  Add,
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
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { quizAPI, studyMaterialsAPI } from "../services/api";
import { CreateQuizRequest } from "../types";

interface StudyMaterial {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: "PDF" | "PPTX";
  fileSize: number;
  uploadDate: string;
  subject?: string;
  description?: string;
}

const StudyFiles: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quiz generation states
  const [quizDialog, setQuizDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM"
  );
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await studyMaterialsAPI.getAll();
      setMaterials(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load study materials");
    } finally {
      setLoading(false);
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
        setError("Please select a PDF or PPTX file");
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("subject", subject);
      formData.append("description", description);

      await studyMaterialsAPI.upload(formData);
      setSuccess("File uploaded successfully!");
      setUploadDialog(false);
      resetUploadForm();
      fetchMaterials();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const response = await studyMaterialsAPI.download(material.id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download file");
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      await studyMaterialsAPI.delete(materialId);
      setSuccess("Material deleted successfully!");
      fetchMaterials();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete material");
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSubject("");
    setDescription("");
  };

  const handleGenerateQuiz = (material: StudyMaterial) => {
    setSelectedMaterial(material);
    setQuizTitle(`Quiz: ${material.originalFilename}`);
    setQuizDescription(`Generated quiz from ${material.originalFilename}`);
    setQuizDialog(true);
  };

  const handleQuizGeneration = async () => {
    if (!selectedMaterial) return;

    try {
      setGeneratingQuiz(true);
      setError(null);

      const request: CreateQuizRequest = {
        title: quizTitle,
        description: quizDescription,
        studyMaterialId: selectedMaterial.id,
        numberOfQuestions,
        durationMinutes,
        difficulty,
      };

      await quizAPI.generateQuiz(request);
      setSuccess("Quiz generated successfully!");
      setQuizDialog(false);
      resetQuizForm();
    } catch (err: any) {
      console.error("Quiz generation error:", err);

      // Provide specific error messages based on the error response
      let errorMessage = "Failed to generate quiz. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific AI service errors
      if (errorMessage.includes("temporarily unavailable")) {
        errorMessage =
          "🤖 AI service is temporarily busy. Please try again in a few minutes.";
      } else if (errorMessage.includes("rate limit")) {
        errorMessage =
          "⏱️ Too many requests. Please wait a moment before trying again.";
      } else if (errorMessage.includes("API key")) {
        errorMessage =
          "🔑 AI service configuration issue. Please contact support.";
      }

      setError(errorMessage);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const resetQuizForm = () => {
    setSelectedMaterial(null);
    setQuizTitle("");
    setQuizDescription("");
    setNumberOfQuestions(10);
    setDurationMinutes(30);
    setDifficulty("MEDIUM");
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.originalFilename
        ?.toLowerCase()
        ?.includes(searchTerm.toLowerCase()) ||
      material.subject?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    return fileType === "PDF" ? (
      <PictureAsPdf color="error" />
    ) : (
      <Slideshow color="primary" />
    );
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Study Materials
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload and manage your PDF documents and PowerPoint presentations for
          studying.
        </Typography>
      </Box>

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

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
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
          sx={{ flexGrow: 1, maxWidth: 400 }}
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
              <Typography variant="h6" color="text.secondary">
                {searchTerm
                  ? "No materials match your search"
                  : "No study materials uploaded yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {!searchTerm &&
                  "Upload your first PDF or PowerPoint file to get started!"}
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getFileIcon(material.fileType)}
                      <Typography
                        variant="h6"
                        sx={{ ml: 1, flexGrow: 1 }}
                        noWrap
                      >
                        {material.originalFilename}
                      </Typography>
                    </Box>

                    {material.subject && (
                      <Chip
                        label={material.subject}
                        size="small"
                        color="primary"
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
                      Size: {formatFileSize(material.fileSize)}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Uploaded:{" "}
                      {new Date(material.uploadDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownload(material)}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      startIcon={<QuizIcon />}
                      onClick={() => handleGenerateQuiz(material)}
                      color="primary"
                    >
                      Generate Quiz
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(material.id)}
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
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose File (PDF or PPTX)
              </Button>
            </label>

            {selectedFile && (
              <Alert severity="info">
                Selected: {selectedFile.name} (
                {formatFileSize(selectedFile.size)})
              </Alert>
            )}
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
            onClick={handleUpload}
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
                {selectedMaterial.originalFilename}
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
            onClick={handleQuizGeneration}
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
    </Container>
  );
};

export default StudyFiles;
