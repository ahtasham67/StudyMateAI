import {
  AccountCircle,
  CalendarToday,
  Dashboard,
  Edit,
  Logout,
  Quiz,
  School,
  UploadFile,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const getProfilePhotoUrl = () => {
    if (!user) return null;
    
    // First try to use base64 data if available
    if (user.profilePhotoData && user.profilePhotoContentType) {
      return `data:${user.profilePhotoContentType};base64,${user.profilePhotoData}`;
    }
    
    // Fallback to URL-based approach
    if (!user.profilePhotoUrl) return null;
    
    // If it's already a full URL, return as is
    if (user.profilePhotoUrl.startsWith('http://') || user.profilePhotoUrl.startsWith('https://')) {
      return user.profilePhotoUrl;
    }
    
    // For production, use relative URLs
    if (process.env.NODE_ENV === 'production') {
      return user.profilePhotoUrl.startsWith('/api/') ? user.profilePhotoUrl : `/api${user.profilePhotoUrl}`;
    }
    
    // For development, use localhost
    if (user.profilePhotoUrl.startsWith("/api/")) {
      return `http://localhost:8080${user.profilePhotoUrl}`;
    }
    return `http://localhost:8080/api${user.profilePhotoUrl}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          StudyMateAI
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<School />}
            onClick={() => navigate("/study-sessions")}
          >
            Study Sessions
          </Button>

          <Button
            color="inherit"
            startIcon={<CalendarToday />}
            onClick={() => navigate("/calendar")}
          >
            Calendar
          </Button>

          <Button
            color="inherit"
            startIcon={<UploadFile />}
            onClick={() => navigate("/study-materials")}
          >
            Learning Materials
          </Button>

          <Button
            color="inherit"
            startIcon={<Quiz />}
            onClick={() => navigate("/quizzes")}
          >
            Quizzes
          </Button>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={getProfilePhotoUrl() || undefined}
            >
              {!getProfilePhotoUrl() &&
                (user?.firstName?.[0] || user?.username?.[0] || (
                  <AccountCircle />
                ))}
            </Avatar>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Update Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
