import {
  AccountCircle,
  Dashboard,
  Logout,
  Note,
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
            startIcon={<Note />}
            onClick={() => navigate("/notes")}
          >
            Notes
          </Button>

          <Button
            color="inherit"
            startIcon={<UploadFile />}
            onClick={() => navigate("/study-materials")}
          >
            Study Materials
          </Button>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.[0] || user?.username?.[0] || <AccountCircle />}
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
