import { School } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { LoginRequest, User } from "../types";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const data = response.data;
      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePhotoUrl: data.profilePhotoUrl,
        universityName: data.universityName,
        currentTerm: data.currentTerm,
        academicYear: data.academicYear,
        major: data.major,
        yearOfStudy: data.yearOfStudy,
        createdAt: new Date().toISOString(),
      };
      login(data.accessToken, user);
      console.log("Login successful", user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: 6,
            width: "100%",
            background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
            border: "1px solid rgba(187, 134, 252, 0.2)",
            borderRadius: "24px",
            backdropFilter: "blur(20px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                borderRadius: "50%",
                p: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <School sx={{ fontSize: 40, color: "white" }} />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                mb: 1,
              }}
            >
              StudyMateAI
            </Typography>
            <Typography
              component="h2"
              variant="h5"
              gutterBottom
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Sign in to access your personalized learning experience
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 3,
                  background: "rgba(244, 67, 54, 0.1)",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  borderRadius: "12px",
                  "& .MuiAlert-icon": {
                    color: "#f44336",
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="usernameOrEmail"
                label="Username or Email"
                name="usernameOrEmail"
                autoComplete="username"
                autoFocus
                value={formData.usernameOrEmail}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(187, 134, 252, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(187, 134, 252, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#bb86fc",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#bb86fc",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(187, 134, 252, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(187, 134, 252, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#bb86fc",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#bb86fc",
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 3,
                  py: 1.5,
                  borderRadius: "12px",
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 20px 0 rgba(187, 134, 252, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #d7b3ff, #5ce6d3)",
                    boxShadow: "0 6px 25px 0 rgba(187, 134, 252, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "rgba(187, 134, 252, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
              <Box textAlign="center">
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{
                    color: "#bb86fc",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#03dac6",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
