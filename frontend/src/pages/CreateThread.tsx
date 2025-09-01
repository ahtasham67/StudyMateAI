import { ArrowBack, Send } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { discussionAPI } from "../services/api";
import { CreateThreadRequest } from "../types";

const CreateThread: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateThreadRequest>({
    title: "",
    content: "",
    course: "",
    topic: "",
  });
  const [courses, setCourses] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    loadCourses();
  }, []);

  useEffect(() => {
    if (formData.course) {
      loadTopics(formData.course);
    } else {
      setTopics([]);
      setFormData((prev) => ({ ...prev, topic: "" }));
    }
  }, [formData.course]);

  const loadCourses = async () => {
    try {
      const response = await discussionAPI.getAllCourses();
      setCourses(response.data.courses); // Access courses from the response object
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadTopics = async (course: string) => {
    try {
      const response = await discussionAPI.getTopicsByCourse(course);
      setTopics(response.data.topics); // Access topics from the response object
    } catch (error) {
      console.error("Error loading topics:", error);
    }
  };

  const handleInputChange =
    (field: keyof CreateThreadRequest) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length > 5000) {
      newErrors.content = "Content must not exceed 5000 characters";
    }

    if (!formData.course.trim()) {
      newErrors.course = "Course is required";
    }

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await discussionAPI.createThread(formData);
      setSnackbar({
        open: true,
        message: "Thread created successfully!",
        severity: "success",
      });

      // Navigate back to discussions after a short delay
      setTimeout(() => {
        navigate("/discussions");
      }, 1500);
    } catch (error) {
      console.error("Error creating thread:", error);
      setSnackbar({
        open: true,
        message: "Failed to create thread. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/discussions")}
            sx={{ mr: 2 }}
          >
            Back to Discussions
          </Button>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #bb86fc, #03dac6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Create New Thread
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Start a new discussion and share your knowledge
        </Typography>

        {/* Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Title */}
                <TextField
                  fullWidth
                  label="Thread Title"
                  placeholder="Enter a descriptive title for your thread"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  error={!!errors.title}
                  helperText={
                    errors.title || `${formData.title.length}/200 characters`
                  }
                  inputProps={{ maxLength: 200 }}
                />

                {/* Course and Topic */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl fullWidth error={!!errors.course}>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.course}
                      label="Course"
                      onChange={handleInputChange("course")}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course} value={course}>
                          {course}
                        </MenuItem>
                      ))}
                      <MenuItem value="other">
                        Other (specify in content)
                      </MenuItem>
                    </Select>
                    {errors.course && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 2 }}
                      >
                        {errors.course}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    disabled={!formData.course}
                    error={!!errors.topic}
                  >
                    <InputLabel>Topic</InputLabel>
                    <Select
                      value={formData.topic}
                      label="Topic"
                      onChange={handleInputChange("topic")}
                    >
                      {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          {topic}
                        </MenuItem>
                      ))}
                      <MenuItem value="general">General Discussion</MenuItem>
                      <MenuItem value="help">Help & Support</MenuItem>
                      <MenuItem value="study-tips">Study Tips</MenuItem>
                      <MenuItem value="resources">Resources</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {errors.topic && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 2 }}
                      >
                        {errors.topic}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                {/* Content */}
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Thread Content"
                  placeholder="Write your question, share insights, or start a discussion..."
                  value={formData.content}
                  onChange={handleInputChange("content")}
                  error={!!errors.content}
                  helperText={
                    errors.content ||
                    `${formData.content.length}/5000 characters`
                  }
                  inputProps={{ maxLength: 5000 }}
                />

                {/* Submit Button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/discussions")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<Send />}
                    disabled={loading}
                    sx={{
                      background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                      px: 4,
                    }}
                  >
                    {loading ? "Creating..." : "Create Thread"}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card
          sx={{
            background: "rgba(187, 134, 252, 0.05)",
            border: "1px solid rgba(187, 134, 252, 0.2)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "#bb86fc" }}>
              💡 Tips for Creating Great Threads
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Use a clear, descriptive title that summarizes your question or
                topic
              </Typography>
              <Typography
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Provide context and background information in your content
              </Typography>
              <Typography
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Choose the most relevant course and topic for better
                discoverability
              </Typography>
              <Typography
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Be respectful and constructive in your discussions
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Search existing threads before creating a new one to avoid
                duplicates
              </Typography>
            </Box>
          </CardContent>
        </Card>

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
    </Container>
  );
};

export default CreateThread;
