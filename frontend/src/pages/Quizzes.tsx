import {
  Add,
  Delete,
  PlayArrow,
  Quiz as QuizIcon,
  Search,
  Timer,
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
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import { Quiz } from "../types";

const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getAll();
      setQuizzes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      await quizAPI.delete(quizId);
      setSuccess("Quiz deleted successfully!");
      fetchQuizzes();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete quiz");
    }
  };

  const handleTakeQuiz = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.studyMaterialName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (totalQuestions: number) => {
    if (totalQuestions <= 5) return "success";
    if (totalQuestions <= 15) return "warning";
    return "error";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generated Quizzes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Take quizzes generated from your study materials using AI.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredQuizzes.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <QuizIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchTerm ? "No quizzes found" : "No quizzes available"}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Generate quizzes from your study materials to get started."}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/study-files")}
                >
                  Go to Study Materials
                </Button>
              )}
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
              }}
            >
              {filteredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <QuizIcon
                        sx={{ mr: 1, mt: 0.5, color: "primary.main" }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {quiz.title}
                        </Typography>
                      </Box>
                    </Box>

                    {quiz.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {quiz.description}
                      </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={quiz.studyMaterialName}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Chip
                        label={`${quiz.totalQuestions} questions`}
                        size="small"
                        color={getDifficultyColor(quiz.totalQuestions)}
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Chip
                        label={`${quiz.durationMinutes} mins`}
                        size="small"
                        variant="outlined"
                        icon={<Timer />}
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(quiz.createdAt)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleTakeQuiz(quiz.id)}
                      variant="contained"
                      sx={{ flexGrow: 1 }}
                    >
                      Take Quiz
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteQuiz(quiz.id)}
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
    </Container>
  );
};

export default Quizzes;
