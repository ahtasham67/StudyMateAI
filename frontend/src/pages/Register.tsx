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
import { RegisterRequest, User } from "../types";

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Shared textfield styling
  const textFieldSx = {
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    // Username validation
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (formData.username.length > 20) {
      setError("Username must be no more than 20 characters long");
      return false;
    }

    // Email validation
    if (formData.email.length > 50) {
      setError("Email must be no more than 50 characters long");
      return false;
    }

    // Email format validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password.length > 40) {
      setError("Password must be no more than 40 characters long");
      return false;
    }

    // Password confirmation validation
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // First name validation
    if (formData.firstName.length > 50) {
      setError("First name must be no more than 50 characters long");
      return false;
    }

    // Last name validation
    if (formData.lastName.length > 50) {
      setError("Last name must be no more than 50 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register the user
      await authAPI.register(formData);

      // After successful registration, automatically log in the user
      const loginResponse = await authAPI.login({
        usernameOrEmail: formData.username,
        password: formData.password,
      });

      const response = loginResponse.data;
      const user: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        profilePhotoUrl: response.profilePhotoUrl,
        universityName: response.universityName,
        currentTerm: response.currentTerm,
        academicYear: response.academicYear,
        major: response.major,
        yearOfStudy: response.yearOfStudy,
        createdAt: new Date().toISOString(),
      };

      login(response.accessToken, user);
      console.log(user);
      console.log("Registration and login successful");

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle validation errors from backend
      if (err.response?.status === 400) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Validation failed. Please check your input.");
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
              Join StudyMateAI
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Create your account to start your AI-powered learning journey
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{ maxLength: 50 }}
                    sx={textFieldSx}
                  />
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    inputProps={{ maxLength: 50 }}
                    sx={textFieldSx}
                  />
                </Box>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username (3-20 characters)"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ minLength: 3, maxLength: 20 }}
                  helperText="Username must be between 3 and 20 characters"
                  sx={textFieldSx}
                />
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ maxLength: 50 }}
                  helperText="Must be a valid email address"
                  sx={textFieldSx}
                />
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password (6-40 characters)"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ minLength: 6, maxLength: 40 }}
                  helperText="Password must be between 6 and 40 characters"
                  sx={textFieldSx}
                />
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  sx={textFieldSx}
                />
              </Box>
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
                  "Create Account"
                )}
              </Button>
              <Box textAlign="center">
                <Link
                  component={RouterLink}
                  to="/login"
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
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
