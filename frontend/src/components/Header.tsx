import {
  AccountCircle,
  Dashboard,
  Edit,
  Forum,
  Home,
  Logout,
  Menu as MenuIcon,
  Note,
  Quiz,
  School,
  UploadFile,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getProfilePhotoUrl = () => {
    if (user?.profilePhotoUrl) {
      if (user.profilePhotoUrl.startsWith("/api/")) {
        return `http://localhost:8080${user.profilePhotoUrl}`;
      }
      return `http://localhost:8080/api${user.profilePhotoUrl}`;
    }
    return null;
  };

  const navigationItems = [
    { text: "Home", icon: <Home />, path: "/home" },
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Study Sessions", icon: <School />, path: "/study-sessions" },
    { text: "Notes", icon: <Note />, path: "/notes" },
    { text: "Study Materials", icon: <UploadFile />, path: "/study-materials" },
    { text: "Quizzes", icon: <Quiz />, path: "/quizzes" },
    { text: "Discussions", icon: <Forum />, path: "/discussions" },
  ];

  const drawer = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(187, 134, 252, 0.1)" }}>
        <Typography
          variant="h6"
          sx={{
            background: "linear-gradient(45deg, #bb86fc, #03dac6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          StudyMateAI
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                "&:hover": {
                  background: "rgba(187, 134, 252, 0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#bb86fc" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(187, 134, 252, 0.1)",
        }}
      >
        <Toolbar sx={{ minHeight: "80px !important" }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              background: "linear-gradient(45deg, #bb86fc, #03dac6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            StudyMateAI
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: "12px",
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      background: "rgba(187, 134, 252, 0.1)",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{
                "&:hover": {
                  transform: "scale(1.1)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid rgba(187, 134, 252, 0.3)",
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                }}
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
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                "& .MuiPaper-root": {
                  background:
                    "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
                  border: "1px solid rgba(187, 134, 252, 0.2)",
                  borderRadius: "16px",
                  mt: 1,
                  minWidth: 220,
                },
              }}
            >
              <MenuItem onClick={handleClose} disabled>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleClose} disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider
                sx={{ my: 1, borderColor: "rgba(187, 134, 252, 0.1)" }}
              />
              <MenuItem
                onClick={handleProfile}
                sx={{
                  "&:hover": {
                    background: "rgba(187, 134, 252, 0.1)",
                  },
                }}
              >
                <Edit fontSize="small" sx={{ mr: 2, color: "#bb86fc" }} />
                Update Profile
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  "&:hover": {
                    background: "rgba(244, 67, 54, 0.1)",
                  },
                }}
              >
                <Logout fontSize="small" sx={{ mr: 2, color: "#f44336" }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            border: "none",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Toolbar spacing */}
      <Toolbar sx={{ minHeight: "80px !important" }} />
    </>
  );
};

export default Header;
