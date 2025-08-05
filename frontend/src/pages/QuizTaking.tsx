import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
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
  FormControl,
  FormControlLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizAPI } from "../services/api";
import { Quiz } from "../types";

const QuizTaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const calculateScore = useCallback(() => {
    if (!quiz || !quiz.questions) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctOption = question.options?.find(
        (option) => option.isCorrect
      );

      if (
        userAnswer &&
        correctOption &&
        userAnswer === correctOption.id.toString()
      ) {
        correctAnswers++;
      }
    });

    setScore(Math.round((correctAnswers / quiz.questions.length) * 100));
  }, [quiz, answers]);

  const handleSubmitQuiz = useCallback(() => {
    setQuizCompleted(true);
    calculateScore();
    setShowResults(true);
  }, [calculateScore]);

  useEffect(() => {
    if (id) {
      fetchQuiz(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && timeRemaining > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining, quizCompleted, handleSubmitQuiz]);

  const fetchQuiz = async (quizId: number) => {
    try {
      setLoading(true);
      const response = await quizAPI.getById(quizId);
      setQuiz(response.data);
      setTimeRemaining(response.data.durationMinutes * 60); // Convert to seconds
      setError(null);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions!.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    if (!quiz || !quiz.questions) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !quiz) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || "Quiz not found"}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/quizzes")}
          >
            Back to Quizzes
          </Button>
        </Box>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            {quiz.title}
          </Typography>

          {quiz.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {quiz.description}
            </Typography>
          )}

          <Box
            sx={{ my: 3, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Chip
              label={`${quiz.totalQuestions} Questions`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${quiz.durationMinutes} Minutes`}
              color="secondary"
              variant="outlined"
              icon={<Timer />}
            />
            <Chip label={quiz.studyMaterialName} variant="outlined" />
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Once you start the quiz, the timer will begin counting down. Make
            sure you have a stable internet connection and enough time to
            complete it.
          </Typography>

          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/quizzes")}
            >
              Back to Quizzes
            </Button>
            <Button variant="contained" size="large" onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      {/* Header with progress and timer */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{quiz.title}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={formatTime(timeRemaining)}
              color={timeRemaining < 300 ? "error" : "primary"}
              icon={<Timer />}
            />
            <Typography variant="body2" color="text.secondary">
              {getAnsweredCount()}/{quiz.totalQuestions} answered
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={getProgressPercentage()}
          sx={{ height: 8, borderRadius: 4 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Question {currentQuestionIndex + 1} of {quiz.totalQuestions}
        </Typography>
      </Paper>

      {/* Question Card */}
      {currentQuestion && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              {currentQuestion.questionText}
            </Typography>

            {currentQuestion.options && (
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                >
                  {currentQuestion.options.map((option) => (
                    <FormControlLabel
                      key={option.id}
                      value={option.id.toString()}
                      control={<Radio />}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", py: 1 }}
                        >
                          <Typography variant="body1">
                            {option.optionText}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        mb: 1,
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          {quiz.questions?.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  index === currentQuestionIndex
                    ? "primary.main"
                    : answers[quiz.questions![index].id]
                    ? "success.main"
                    : "grey.300",
                cursor: "pointer",
              }}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </Box>

        {currentQuestionIndex === (quiz.questions?.length || 1) - 1 ? (
          <Button
            variant="contained"
            color="success"
            endIcon={<CheckCircle />}
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNextQuestion}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Results Dialog */}
      <Dialog open={showResults} maxWidth="sm" fullWidth>
        <DialogTitle>Quiz Completed!</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h3" color="primary" gutterBottom>
              {score}%
            </Typography>
            <Typography variant="h6" gutterBottom>
              Your Score
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You answered {Math.round((score / 100) * quiz.totalQuestions)} out
              of {quiz.totalQuestions} questions correctly.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/quizzes")} variant="contained">
            Back to Quizzes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizTaking;
