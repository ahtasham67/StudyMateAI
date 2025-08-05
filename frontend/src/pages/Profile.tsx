import { AccountCircle, CameraAlt, Save, School } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../services/api";
import { ProfileUpdateRequest } from "../types";

const Profile: React.FC = () => {
  const { user, login, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileUpdateRequest>({
    firstName: "",
    lastName: "",
    email: "",
    universityName: "",
    currentTerm: "",
    academicYear: "",
    major: "",
    yearOfStudy: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        universityName: user.universityName || "",
        currentTerm: user.currentTerm || "",
        academicYear: user.academicYear || "",
        major: user.major || "",
        yearOfStudy: user.yearOfStudy || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await profileAPI.updateProfile(profile);
      const token = localStorage.getItem("token");
      if (token) {
        login(token, response.data);
      }
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setPhotoLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await profileAPI.uploadProfilePhoto(formData);
      // Update user data immediately to show the photo
      updateUser(response.data);
      setSuccess("Profile photo updated successfully!");

      // Refresh the page to ensure the photo displays instantly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Upload photo error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload photo. Please try again."
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const getProfilePhotoUrl = () => {
    if (user?.profilePhotoUrl) {
      // If the URL already starts with /api, use it directly with localhost
      if (user.profilePhotoUrl.startsWith("/api/")) {
        return `http://localhost:8080${user.profilePhotoUrl}`;
      }
      // Otherwise, add the /api prefix
      return `http://localhost:8080/api${user.profilePhotoUrl}`;
    }
    return null;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Update Profile
      </Typography>

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

      <Card>
        <CardContent>
          {/* Profile Photo Section */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Box sx={{ position: "relative", mr: 3 }}>
              <Avatar
                sx={{ width: 100, height: 100 }}
                src={getProfilePhotoUrl() || undefined}
              >
                {!getProfilePhotoUrl() &&
                  (user?.firstName?.[0] || user?.username?.[0] || (
                    <AccountCircle />
                  ))}
              </Avatar>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  }}
                  disabled={photoLoading}
                >
                  {photoLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CameraAlt fontSize="small" />
                  )}
                </IconButton>
              </label>
            </Box>

            <Box>
              <Typography variant="h6">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click the camera icon to update your profile photo
              </Typography>
            </Box>
          </Box>

          {/* Profile Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { sm: "1fr 1fr" },
              }}
            >
              <TextField
                name="firstName"
                label="First Name"
                value={profile.firstName}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                name="lastName"
                label="Last Name"
                value={profile.lastName}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Box>

            <TextField
              name="email"
              label="Email"
              type="email"
              value={profile.email}
              onChange={handleInputChange}
              required
              fullWidth
              sx={{ mt: 3 }}
            />

            {/* Academic Information Section */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 4, mb: 2 }}>
              <School sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Academic Information</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Help us personalize your study experience by providing your
              academic details.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { sm: "1fr 1fr" },
              }}
            >
              <TextField
                name="universityName"
                label="University Name"
                value={profile.universityName}
                onChange={handleInputChange}
                fullWidth
              />

              <TextField
                name="major"
                label="Major/Field of Study"
                value={profile.major}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { sm: "1fr 1fr 1fr" },
                mt: 3,
              }}
            >
              <TextField
                name="currentTerm"
                label="Current Term"
                placeholder="e.g., Fall 2024"
                value={profile.currentTerm}
                onChange={handleInputChange}
                fullWidth
              />

              <TextField
                name="academicYear"
                label="Academic Year"
                placeholder="e.g., 2024-2025"
                value={profile.academicYear}
                onChange={handleInputChange}
                fullWidth
              />

              <TextField
                name="yearOfStudy"
                label="Year of Study"
                placeholder="e.g., 3rd Year"
                value={profile.yearOfStudy}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
