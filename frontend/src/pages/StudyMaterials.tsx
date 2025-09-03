import {
  Add,
  Chat,
  Close,
  CloudUpload,
  Delete,
  Download,
  PictureAsPdf,
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
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import StudyMaterialChatbot from "../components/StudyMaterialChatbot";

// Ensure this file is treated as a module
export {};

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

const StudyMaterials: React.FC = () => {
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
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedMaterialForChat, setSelectedMaterialForChat] =
    useState<StudyMaterial | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
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

      const token = localStorage.getItem("token");
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
        const errorData = await response.text();
        throw new Error(errorData || "Upload failed");
      }

      await response.json();
      setSuccess("File uploaded successfully!");
      setUploadDialog(false);
      resetUploadForm();
      fetchMaterials(); // Refresh the list
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/study-materials/${material.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.originalName;
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/study-materials/${materialId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setSuccess("Material deleted successfully!");
      fetchMaterials(); // Refresh the list
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

  const handleOpenChatbot = (material: StudyMaterial) => {
    setSelectedMaterialForChat(material);
    setChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setChatbotOpen(false);
    setSelectedMaterialForChat(null);
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          studying. Use the AI chatbot to get summaries, key topics, and ask
          questions about your materials.
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
                        {material.originalName}
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
                      {new Date(material.createdAt).toLocaleDateString()}
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
                      startIcon={<Chat />}
                      onClick={() => handleOpenChatbot(material)}
                      color="primary"
                    >
                      Chat
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

      {/* AI Chatbot */}
      <StudyMaterialChatbot
        open={chatbotOpen}
        onClose={handleCloseChatbot}
        selectedMaterial={selectedMaterialForChat}
        materials={materials}
      />
    </Container>
  );
};

export default StudyMaterials;
