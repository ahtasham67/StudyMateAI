import { Box, Container } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { NotificationProvider } from "./components/NotificationSystem";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CreateThread from "./pages/CreateThread";
import Dashboard from "./pages/Dashboard";
import Discussions from "./pages/Discussions";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import QuizTaking from "./pages/QuizTaking";
import Quizzes from "./pages/Quizzes";
import Register from "./pages/Register";
import SmartCalendar from "./pages/SmartCalendar";
import StudyMaterialsWithFolders from "./pages/StudyMaterialsWithFolders";
import StudySessions from "./pages/StudySessions";
import ThreadDetail from "./pages/ThreadDetail";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#bb86fc",
      light: "#d7b3ff",
      dark: "#8f5cb8",
    },
    secondary: {
      main: "#03dac6",
      light: "#5ce6d3",
      dark: "#00a693",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      background: "linear-gradient(45deg, #bb86fc, #03dac6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(187, 134, 252, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(187, 134, 252, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1e1e1e",
          border: "1px solid rgba(187, 134, 252, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          background: "linear-gradient(45deg, #bb86fc, #03dac6)",
          boxShadow: "0 4px 20px 0 rgba(187, 134, 252, 0.3)",
          "&:hover": {
            background: "linear-gradient(45deg, #d7b3ff, #5ce6d3)",
            boxShadow: "0 6px 25px 0 rgba(187, 134, 252, 0.4)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          border: "1px solid rgba(187, 134, 252, 0.1)",
          borderRadius: "16px",
          backdropFilter: "blur(20px)",
        },
      },
    },
  },
});

function AppContent() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)",
          }}
        >
          {user && <Header />}

          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/dashboard" /> : <HomePage />}
              />
              <Route path="/home" element={<HomePage />} />
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/dashboard" /> : <Register />}
              />
              <Route
                path="/dashboard"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <Dashboard />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/study-sessions"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <StudySessions />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/calendar"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <SmartCalendar />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/study-materials"
                element={
                  user ? (
                    <StudyMaterialsWithFolders />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              {/* Redirect old notes route to study materials */}
              <Route
                path="/notes"
                element={<Navigate to="/study-materials" />}
              />
              <Route
                path="/study-materials-folders"
                element={
                  user ? (
                    <StudyMaterialsWithFolders />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/quizzes"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <Quizzes />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/discussions"
                element={user ? <Discussions /> : <Navigate to="/login" />}
              />
              <Route
                path="/discussions/create"
                element={user ? <CreateThread /> : <Navigate to="/login" />}
              />
              <Route
                path="/discussions/thread/:id"
                element={user ? <ThreadDetail /> : <Navigate to="/login" />}
              />
              <Route
                path="/quiz/:id"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <QuizTaking />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  user ? (
                    <Container maxWidth="lg">
                      <Box sx={{ py: 4 }}>
                        <Profile />
                      </Box>
                    </Container>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Box>

          {user && <Footer />}
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
