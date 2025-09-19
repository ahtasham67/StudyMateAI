import {
  Analytics,
  BarChart,
  BookmarkBorder,
  Category,
  FilterList,
  Insights,
  Lightbulb,
  Link,
  Memory,
  NetworkCheck,
  Psychology,
  Psychology as PsychologyIcon,
  Quiz,
  RefreshOutlined,
  School,
  Search,
  Share,
  SmartToy,
  Timeline,
  Visibility,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { knowledgeAPI } from "../services/api";
import { DiscussionThread, KnowledgeSummary } from "../types";

interface KnowledgeGraphPanelProps {
  thread: DiscussionThread;
}

interface AIInsight {
  type:
    | "concept"
    | "connection"
    | "learning_path"
    | "difficulty"
    | "prerequisite";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface LearningMetrics {
  comprehensionLevel: number;
  difficultyRating: number;
  timeToMaster: string;
  prerequisites: string[];
  nextSteps: string[];
}

const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({
  thread,
}) => {
  const [knowledgeSummary, setKnowledgeSummary] =
    useState<KnowledgeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>("summary");
  const [activeTab, setActiveTab] = useState(0);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [learningMetrics, setLearningMetrics] =
    useState<LearningMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced AI Summary Generation
  const generateAdvancedSummary = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await knowledgeAPI.getThreadKnowledgeSummary(thread.id);
      setKnowledgeSummary(response.data);

      // Generate AI insights
      const insights: AIInsight[] = [
        {
          type: "concept",
          title: "Key Learning Concept Identified",
          description: `This discussion centers around ${
            response.data.keyEntities?.[0]?.name || "core concepts"
          } with high relevance to your study goals.`,
          confidence: 0.92,
          actionable: true,
        },
        {
          type: "connection",
          title: "Cross-Topic Connections",
          description: `Found ${
            response.data.relatedThreads?.length || 0
          } related discussions that build on these concepts.`,
          confidence: 0.87,
          actionable: true,
        },
        {
          type: "difficulty",
          title: "Complexity Analysis",
          description: `Based on entity complexity and discussion depth, this topic is at an ${
            response.data.knowledgeScore
              ? response.data.knowledgeScore > 0.7
                ? "advanced"
                : "intermediate"
              : "beginner"
          } level.`,
          confidence: 0.84,
          actionable: false,
        },
      ];
      setAIInsights(insights);

      // Generate learning metrics
      const metrics: LearningMetrics = {
        comprehensionLevel: (response.data.knowledgeScore || 0.5) * 100,
        difficultyRating: Math.min(
          5,
          Math.max(1, (response.data.keyEntities?.length || 3) / 2)
        ),
        timeToMaster:
          response.data.keyEntities && response.data.keyEntities.length > 5
            ? "2-3 weeks"
            : "1-2 weeks",
        prerequisites:
          response.data.keyEntities?.slice(0, 3).map((e) => e.name) || [],
        nextSteps: response.data.suggestedTopics?.slice(0, 3) || [],
      };
      setLearningMetrics(metrics);
    } catch (error) {
      console.error("Failed to generate advanced summary:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [thread.id]);

  useEffect(() => {
    const loadKnowledgeSummary = async () => {
      try {
        setLoading(true);
        await generateAdvancedSummary();
      } catch (error) {
        console.error("Failed to load knowledge summary:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeSummary();
  }, [generateAdvancedSummary]);

  const handleAccordionChange = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  const getEntityTypeColor = useCallback((entityType: string) => {
    const colors = {
      CONCEPT: "#bb86fc",
      TERM: "#03dac6",
      MATH_CONCEPT: "#f44336",
      CS_CONCEPT: "#4caf50",
      PERSON: "#ff9800",
      default: "#9e9e9e",
    };
    return colors[entityType as keyof typeof colors] || colors.default;
  }, []);

  const getEntityTypeIcon = useCallback((entityType: string) => {
    switch (entityType) {
      case "CONCEPT":
      case "MATH_CONCEPT":
      case "CS_CONCEPT":
        return <Psychology sx={{ fontSize: 16 }} />;
      case "TERM":
        return <Category sx={{ fontSize: 16 }} />;
      default:
        return <Link sx={{ fontSize: 16 }} />;
    }
  }, []);

  const getInsightIcon = useCallback((type: AIInsight["type"]) => {
    switch (type) {
      case "concept":
        return <PsychologyIcon />;
      case "connection":
        return <NetworkCheck />;
      case "learning_path":
        return <School />;
      case "difficulty":
        return <BarChart />;
      case "prerequisite":
        return <FilterList />;
      default:
        return <Insights />;
    }
  }, []);

  const summaryTabs = useMemo(
    () => [
      { label: "AI Summary", icon: <SmartToy sx={{ fontSize: 18 }} /> },
      { label: "Insights", icon: <Lightbulb sx={{ fontSize: 18 }} /> },
      { label: "Analytics", icon: <Analytics sx={{ fontSize: 18 }} /> },
      { label: "Learning Path", icon: <School sx={{ fontSize: 18 }} /> },
    ],
    []
  );

  if (loading) {
    return (
      <Card
        sx={{
          mt: 2,
          background:
            "linear-gradient(145deg, rgba(187, 134, 252, 0.08), rgba(3, 218, 198, 0.08))",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <SmartToy sx={{ mr: 1, color: "#bb86fc" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Advanced AI Knowledge Analysis
            </Typography>
            <CircularProgress size={20} sx={{ ml: 2, color: "#bb86fc" }} />
          </Box>

          <Stack spacing={2}>
            <Box>
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Skeleton variant="rounded" width={100} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>

            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(187, 134, 252, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #bb86fc, #03dac6)",
                  borderRadius: 4,
                },
              }}
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontStyle: "italic" }}
          >
            🧠 Processing content with advanced NLP algorithms...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!knowledgeSummary) {
    return (
      <Alert
        severity="info"
        sx={{
          mt: 2,
          background:
            "linear-gradient(145deg, rgba(3, 218, 198, 0.1), rgba(187, 134, 252, 0.1))",
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={generateAdvancedSummary}
            startIcon={<RefreshOutlined />}
          >
            Generate Analysis
          </Button>
        }
      >
        No knowledge analysis available. Click to generate AI-powered insights.
      </Alert>
    );
  }

  return (
    <Fade in timeout={600}>
      <Card
        sx={{
          mt: 2,
          background:
            "linear-gradient(145deg, rgba(187, 134, 252, 0.08), rgba(3, 218, 198, 0.08))",
          border: "1px solid rgba(187, 134, 252, 0.2)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Enhanced Header */}
          <Box
            sx={{
              p: 3,
              background:
                "linear-gradient(135deg, rgba(187, 134, 252, 0.15), rgba(3, 218, 198, 0.15))",
              borderBottom: "1px solid rgba(187, 134, 252, 0.2)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    background: "linear-gradient(135deg, #bb86fc, #03dac6)",
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Advanced AI Knowledge Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Powered by Neural Language Processing
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {knowledgeSummary.knowledgeScore && (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #bb86fc, #03dac6)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {(knowledgeSummary.knowledgeScore * 100).toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Knowledge Score
                    </Typography>
                  </Box>
                )}

                <Tooltip title="Refresh Analysis">
                  <IconButton
                    onClick={generateAdvancedSummary}
                    disabled={isRefreshing}
                    sx={{
                      background: "rgba(187, 134, 252, 0.1)",
                      "&:hover": { background: "rgba(187, 134, 252, 0.2)" },
                    }}
                  >
                    <RefreshOutlined
                      sx={{
                        animation: isRefreshing
                          ? "spin 1s linear infinite"
                          : "none",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Enhanced Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(90deg, #bb86fc, #03dac6)",
                  height: 3,
                },
              }}
            >
              {summaryTabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{
                    minHeight: 60,
                    "&.Mui-selected": {
                      color: "#bb86fc",
                      fontWeight: 600,
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* AI Summary Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                    background:
                      "linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid rgba(187, 134, 252, 0.1)",
                  }}
                >
                  {knowledgeSummary.aiGeneratedSummary}
                </Typography>

                {/* Quick Actions */}
                <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    startIcon={<BookmarkBorder />}
                    variant="outlined"
                  >
                    Save Summary
                  </Button>
                  <Button size="small" startIcon={<Share />} variant="outlined">
                    Share
                  </Button>
                  <Button size="small" startIcon={<Quiz />} variant="outlined">
                    Generate Quiz
                  </Button>
                </Box>
              </Box>
            )}

            {/* AI Insights Tab */}
            {activeTab === 1 && (
              <Stack spacing={2}>
                {aiInsights.map((insight, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      background:
                        "linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))",
                      border: "1px solid rgba(187, 134, 252, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {getInsightIcon(insight.type)}
                      <Typography
                        variant="subtitle2"
                        sx={{ ml: 1, fontWeight: 600 }}
                      >
                        {insight.title}
                      </Typography>
                      <Box
                        sx={{
                          ml: "auto",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Confidence:
                        </Typography>
                        <Rating
                          value={insight.confidence * 5}
                          precision={0.1}
                          size="small"
                          readOnly
                          sx={{ color: "#bb86fc" }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                    {insight.actionable && (
                      <Button size="small" sx={{ mt: 1 }} color="primary">
                        Take Action
                      </Button>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && learningMetrics && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Paper sx={{ p: 2, background: "rgba(187, 134, 252, 0.05)" }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Learning Metrics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Comprehension Level
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={learningMetrics.comprehensionLevel}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(187, 134, 252, 0.2)",
                            "& .MuiLinearProgress-bar": {
                              background:
                                "linear-gradient(90deg, #bb86fc, #03dac6)",
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ ml: 2, fontWeight: 600 }}
                        >
                          {learningMetrics.comprehensionLevel.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Difficulty Rating
                      </Typography>
                      <Rating
                        value={learningMetrics.difficultyRating}
                        readOnly
                        sx={{ color: "#ff9800", mt: 1 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Time to Master
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: "#03dac6", fontWeight: 600 }}
                      >
                        {learningMetrics.timeToMaster}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 2, background: "rgba(3, 218, 198, 0.05)" }}>
                  <Typography variant="h6" gutterBottom>
                    🎯 Study Recommendations
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Prerequisites:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, flexWrap: "wrap" }}
                  >
                    {learningMetrics.prerequisites.map((prereq, index) => (
                      <Chip
                        key={index}
                        label={prereq}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Next Steps:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {learningMetrics.nextSteps.map((step, index) => (
                      <Chip
                        key={index}
                        label={step}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* Learning Path Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <School sx={{ mr: 1 }} />
                  Personalized Learning Path
                </Typography>

                <Stack spacing={2}>
                  {knowledgeSummary.keyEntities
                    ?.slice(0, 5)
                    .map((entity, index) => (
                      <Paper
                        key={entity.id}
                        sx={{
                          p: 2,
                          background: `linear-gradient(135deg, ${getEntityTypeColor(
                            entity.entityType
                          )}10, ${getEntityTypeColor(entity.entityType)}05)`,
                          border: `1px solid ${getEntityTypeColor(
                            entity.entityType
                          )}30`,
                          position: "relative",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              background: getEntityTypeColor(entity.entityType),
                              width: 32,
                              height: 32,
                              mr: 2,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {entity.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entity.description}
                            </Typography>
                          </Box>
                          <Badge
                            badgeContent={`${(
                              entity.confidenceScore * 100
                            ).toFixed(0)}%`}
                            color="primary"
                            sx={{
                              "& .MuiBadge-badge": {
                                background:
                                  "linear-gradient(135deg, #bb86fc, #03dac6)",
                              },
                            }}
                          >
                            <Memory
                              sx={{
                                color: getEntityTypeColor(entity.entityType),
                              }}
                            />
                          </Badge>
                        </Box>
                      </Paper>
                    ))}
                </Stack>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  startIcon={<Visibility />}
                >
                  View Complete Learning Path
                </Button>
              </Box>
            )}
          </Box>

          {/* Enhanced Accordions for Additional Content */}
          <Box sx={{ px: 3, pb: 3 }}>
            {/* Key Entities Accordion - Enhanced */}
            {knowledgeSummary.keyEntities &&
              knowledgeSummary.keyEntities.length > 0 && (
                <Accordion
                  expanded={expanded === "entities"}
                  onChange={handleAccordionChange("entities")}
                  sx={{
                    mb: 2,
                    boxShadow: "none",
                    border: "1px solid rgba(3, 218, 198, 0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: "rgba(3, 218, 198, 0.1)",
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Memory sx={{ mr: 1, color: "#03dac6" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        🧠 Key Concepts & Entities
                      </Typography>
                      <Badge
                        badgeContent={knowledgeSummary.keyEntities.length}
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {knowledgeSummary.keyEntities.map((entity) => (
                        <Paper
                          key={entity.id}
                          sx={{
                            p: 2,
                            background: `linear-gradient(135deg, ${getEntityTypeColor(
                              entity.entityType
                            )}15, ${getEntityTypeColor(entity.entityType)}05)`,
                            border: `1px solid ${getEntityTypeColor(
                              entity.entityType
                            )}30`,
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: 3,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            {getEntityTypeIcon(entity.entityType)}
                            <Typography
                              variant="subtitle2"
                              sx={{ ml: 1, fontWeight: 600 }}
                            >
                              {entity.name}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {entity.description}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={`${entity.frequencyCount} mentions`}
                              size="small"
                              sx={{
                                backgroundColor: `${getEntityTypeColor(
                                  entity.entityType
                                )}20`,
                                color: getEntityTypeColor(entity.entityType),
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: getEntityTypeColor(entity.entityType),
                                fontWeight: 600,
                              }}
                            >
                              {(entity.confidenceScore * 100).toFixed(0)}%
                              confidence
                            </Typography>
                          </Box>

                          {entity.relatedEntityNames.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Related:{" "}
                                {entity.relatedEntityNames
                                  .slice(0, 2)
                                  .join(", ")}
                                {entity.relatedEntityNames.length > 2 && "..."}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

            {/* Related Threads - Enhanced */}
            {knowledgeSummary.relatedThreads &&
              knowledgeSummary.relatedThreads.length > 0 && (
                <Accordion
                  expanded={expanded === "related"}
                  onChange={handleAccordionChange("related")}
                  sx={{
                    boxShadow: "none",
                    border: "1px solid rgba(76, 175, 80, 0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <NetworkCheck sx={{ mr: 1, color: "#4caf50" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, flexGrow: 1 }}
                      >
                        🔗 Related Discussions
                      </Typography>
                      <Badge
                        badgeContent={knowledgeSummary.relatedThreads.length}
                        color="success"
                        sx={{ mr: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List dense>
                      {knowledgeSummary.relatedThreads.map(
                        (relatedThread, index) => (
                          <React.Fragment key={relatedThread.id}>
                            <ListItem
                              sx={{
                                px: 3,
                                py: 2,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                                  transform: "translateX(8px)",
                                },
                              }}
                              onClick={() =>
                                (window.location.href = `/discussions/thread/${relatedThread.id}`)
                              }
                            >
                              <ListItemIcon>
                                <Timeline sx={{ color: "#4caf50" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {relatedThread.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      📚 {relatedThread.course} • 📖{" "}
                                      {relatedThread.topic}
                                    </Typography>
                                    <Box
                                      sx={{ display: "flex", gap: 2, mt: 0.5 }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        💬 {relatedThread.replyCount} replies
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        👀 {relatedThread.viewCount} views
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                              <IconButton
                                size="small"
                                sx={{ color: "#4caf50" }}
                              >
                                <Search />
                              </IconButton>
                            </ListItem>
                            {index <
                              knowledgeSummary.relatedThreads.length - 1 && (
                              <Divider sx={{ mx: 3 }} />
                            )}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default KnowledgeGraphPanel;
