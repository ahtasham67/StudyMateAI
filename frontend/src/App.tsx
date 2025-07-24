import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Register from "./pages/Register";
import StudyFiles from "./pages/StudyFiles";
import StudySessions from "./pages/StudySessions";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function AppContent() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {user && <Navigation />}
        <Container maxWidth="lg">
          <Box sx={{ mt: user ? 4 : 8, mb: 4 }}>
            {!user && (
              <AppBar position="static" sx={{ mb: 4 }}>
                <Toolbar>
                  <Typography variant="h2" component="h1" gutterBottom>
                    StudyMateAI
                  </Typography>
                </Toolbar>
              </AppBar>
            )}
            <Routes>
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
                element={user ? <Dashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/study-sessions"
                element={user ? <StudySessions /> : <Navigate to="/login" />}
              />
              <Route
                path="/notes"
                element={user ? <Notes /> : <Navigate to="/login" />}
              />
              <Route
                path="/study-materials"
                element={user ? <StudyFiles /> : <Navigate to="/login" />}
              />
              <Route
                path="/"
                element={<Navigate to={user ? "/dashboard" : "/login"} />}
              />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
