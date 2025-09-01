import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  Note,
  PlayArrow,
  Psychology,
  Quiz,
  Security,
  Speed,
  TrendingUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Slide,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={visible} timeout={800}>
      <Card
        sx={{
          height: "100%",
          background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          border: "1px solid rgba(187, 134, 252, 0.2)",
          borderRadius: "20px",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(187, 134, 252, 0.2)",
            border: "1px solid rgba(187, 134, 252, 0.4)",
          },
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              background: "linear-gradient(45deg, #bb86fc, #03dac6)",
              borderRadius: "50%",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px rgba(187, 134, 252, 0.3)",
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              background: "linear-gradient(45deg, #bb86fc, #03dac6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: "white" }} />,
      title: "AI-Powered Learning",
      description:
        "Experience personalized learning with advanced AI that adapts to your study patterns and preferences.",
      delay: 200,
    },
    {
      icon: <Quiz sx={{ fontSize: 40, color: "white" }} />,
      title: "Smart Quiz Generation",
      description:
        "Generate intelligent quizzes from your study materials using cutting-edge AI technology.",
      delay: 400,
    },
    {
      icon: <Note sx={{ fontSize: 40, color: "white" }} />,
      title: "Smart Note Taking",
      description:
        "Organize and manage your notes with AI-powered categorization and search capabilities.",
      delay: 600,
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "white" }} />,
      title: "Progress Tracking",
      description:
        "Monitor your learning progress with detailed analytics and performance insights.",
      delay: 800,
    },
    {
      icon: <Security sx={{ fontSize: 40, color: "white" }} />,
      title: "Secure & Private",
      description:
        "Your data is protected with enterprise-grade security and privacy measures.",
      delay: 1000,
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: "white" }} />,
      title: "Lightning Fast",
      description:
        "Experience blazing-fast performance with optimized algorithms and modern technology.",
      delay: 1200,
    },
  ];

  const benefits = [
    "Personalized learning paths tailored to your goals",
    "AI-generated quizzes that adapt to your knowledge level",
    "Smart study session management with time tracking",
    "Collaborative features for group study sessions",
    "Cross-platform synchronization across all devices",
    "Advanced analytics to optimize your study efficiency",
  ];

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          background: `
            radial-gradient(circle at 20% 50%, rgba(187, 134, 252, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(3, 218, 198, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #121212 0%, #1a1a1a 100%)
          `,
          position: "relative",
          display: "flex",
          alignItems: "center",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Slide direction="up" in={heroVisible} timeout={1000}>
            <Box textAlign="center">
              <Chip
                label="🚀 Now with Advanced AI Features"
                sx={{
                  mb: 4,
                  background:
                    "linear-gradient(45deg, rgba(187, 134, 252, 0.2), rgba(3, 218, 198, 0.2))",
                  border: "1px solid rgba(187, 134, 252, 0.3)",
                  color: "#bb86fc",
                  fontSize: "0.9rem",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, rgba(187, 134, 252, 0.3), rgba(3, 218, 198, 0.3))",
                  },
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                StudyMateAI
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  color: "text.primary",
                  mb: 2,
                  maxWidth: "800px",
                  mx: "auto",
                }}
              >
                Revolutionize Your Learning with AI
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  fontWeight: 400,
                  color: "text.secondary",
                  mb: 6,
                  maxWidth: "600px",
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Experience the future of education with our AI-powered study
                platform. Generate smart quizzes, take intelligent notes, and
                track your progress like never before.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/register")}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: "50px",
                    background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                    boxShadow: "0 8px 32px rgba(187, 134, 252, 0.3)",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(45deg, #d7b3ff, #5ce6d3)",
                      boxShadow: "0 12px 40px rgba(187, 134, 252, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Get Started Free
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: "50px",
                    borderColor: "rgba(187, 134, 252, 0.5)",
                    color: "#bb86fc",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#bb86fc",
                      background: "rgba(187, 134, 252, 0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
            </Box>
          </Slide>
        </Container>

        {/* Floating Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 100,
            height: 100,
            background:
              "linear-gradient(45deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.1))",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
            },
          }}
        />
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: 12,
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 700,
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "600px", mx: "auto", lineHeight: 1.6 }}
            >
              Discover the comprehensive suite of AI-powered tools designed to
              enhance your learning experience
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 4,
            }}
          >
            {features.map((feature, index) => (
              <Box key={index}>
                <FeatureCard {...feature} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          py: 12,
          background: "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 8,
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 3,
                }}
              >
                Why Choose StudyMateAI?
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Join thousands of students who have transformed their learning
                experience with our AI-powered platform.
              </Typography>

              <Box>
                {benefits.map((benefit, index) => (
                  <Fade
                    in={true}
                    timeout={800}
                    style={{ transitionDelay: `${index * 100}ms` }}
                    key={index}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <CheckCircle
                        sx={{
                          color: "#03dac6",
                          mr: 2,
                          fontSize: 24,
                        }}
                      />
                      <Typography variant="body1" color="text.primary">
                        {benefit}
                      </Typography>
                    </Box>
                  </Fade>
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  position: "relative",
                  textAlign: "center",
                }}
              >
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
                    border: "1px solid rgba(187, 134, 252, 0.2)",
                    borderRadius: "24px",
                    p: 6,
                    transform: "perspective(1000px) rotateY(-5deg)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform:
                        "perspective(1000px) rotateY(0deg) translateY(-10px)",
                      boxShadow: "0 20px 60px rgba(187, 134, 252, 0.2)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                      mx: "auto",
                      mb: 3,
                      fontSize: "3rem",
                    }}
                  >
                    <Psychology sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 2,
                    }}
                  >
                    10,000+
                  </Typography>
                  <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                    Students Learning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Join our growing community of learners
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: `
            radial-gradient(circle at 50% 50%, rgba(187, 134, 252, 0.1) 0%, transparent 70%),
            linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)
          `,
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
              border: "1px solid rgba(187, 134, 252, 0.3)",
              borderRadius: "32px",
              p: 8,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(45deg, rgba(187, 134, 252, 0.05), rgba(3, 218, 198, 0.05))",
                animation: "shimmer 3s ease-in-out infinite",
                "@keyframes shimmer": {
                  "0%, 100%": { opacity: 0.5 },
                  "50%": { opacity: 1 },
                },
              },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
                position: "relative",
                zIndex: 1,
              }}
            >
              Start Your AI Learning Journey Today
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 6, lineHeight: 1.6, position: "relative", zIndex: 1 }}
            >
              Experience the future of education with personalized AI-powered
              learning tools. Join thousands of students already transforming
              their study experience.
            </Typography>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Button
                size="large"
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/register")}
                sx={{
                  px: 8,
                  py: 3,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  borderRadius: "50px",
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                  boxShadow: "0 12px 40px rgba(187, 134, 252, 0.4)",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(45deg, #d7b3ff, #5ce6d3)",
                    boxShadow: "0 16px 50px rgba(187, 134, 252, 0.5)",
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Get Started Free
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
