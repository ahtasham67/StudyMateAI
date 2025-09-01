import {
  Email,
  Favorite,
  GitHub,
  LinkedIn,
  LocationOn,
  Phone,
  Twitter,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        color: "white",
        mt: "auto",
        borderTop: "1px solid rgba(187, 134, 252, 0.1)",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              justifyContent: "space-between",
            }}
          >
            {/* Brand Section */}
            <Box
              sx={{
                flex: { xs: 1, md: 2 },
                maxWidth: { xs: "100%", md: "400px" },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                StudyMateAI
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.7 }}
              >
                Revolutionizing education with AI-powered study tools. Enhance
                your learning experience with personalized quizzes, smart
                note-taking, and intelligent study session management.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  component="a"
                  href="https://github.com/ahtasham67"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#bb86fc",
                    "&:hover": {
                      color: "#03dac6",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <GitHub />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://linkedin.com/in/ahtasham67"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#bb86fc",
                    "&:hover": {
                      color: "#03dac6",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://twitter.com/ahtasham67"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#bb86fc",
                    "&:hover": {
                      color: "#03dac6",
                      transform: "translateY(-2px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Twitter />
                </IconButton>
              </Box>
            </Box>

            {/* Quick Links */}
            <Box sx={{ flex: 1, minWidth: "150px" }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#bb86fc",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Features
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  "AI Quiz Generator",
                  "Smart Notes",
                  "Study Sessions",
                  "Progress Tracking",
                  "File Management",
                ].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      "&:hover": {
                        color: "#03dac6",
                        transition: "color 0.3s ease",
                      },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Support Links */}
            <Box sx={{ flex: 1, minWidth: "150px" }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#bb86fc",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Support
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  "Documentation",
                  "Help Center",
                  "Contact Us",
                  "Bug Reports",
                  "Feature Requests",
                ].map((item) => (
                  <Link
                    key={item}
                    href="#"
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      "&:hover": {
                        color: "#03dac6",
                        transition: "color 0.3s ease",
                      },
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Contact Info */}
            <Box
              sx={{
                flex: { xs: 1, md: 2 },
                maxWidth: { xs: "100%", md: "300px" },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#bb86fc",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Get in Touch
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email sx={{ color: "#03dac6", fontSize: "1.2rem" }} />
                  <Typography variant="body2" color="text.secondary">
                    support@studymateai.com
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone sx={{ color: "#03dac6", fontSize: "1.2rem" }} />
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ color: "#03dac6", fontSize: "1.2rem" }} />
                  <Typography variant="body2" color="text.secondary">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(187, 134, 252, 0.1)" }} />

        {/* Bottom Section */}
        <Box
          sx={{
            py: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} StudyMateAI. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Made with
            </Typography>
            <Favorite sx={{ color: "#f44336", fontSize: "1rem" }} />
            <Typography variant="body2" color="text.secondary">
              by Ahtasham Haque
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              href="#"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#03dac6",
                  transition: "color 0.3s ease",
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "#03dac6",
                  transition: "color 0.3s ease",
                },
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
