import {
  AutoFixHigh,
  Category,
  Link,
  Psychology,
  Timeline,
  TrendingUp,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { knowledgeAPI } from "../services/api";
import { DiscussionThread, KnowledgeSummary } from "../types";

interface KnowledgeGraphPanelProps {
  thread: DiscussionThread;
}

const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({
  thread,
}) => {
  const [knowledgeSummary, setKnowledgeSummary] =
    useState<KnowledgeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    const loadKnowledgeSummary = async () => {
      try {
        setLoading(true);
        const response = await knowledgeAPI.getThreadKnowledgeSummary(
          thread.id
        );
        setKnowledgeSummary(response.data);
      } catch (error) {
        console.error("Failed to load knowledge summary:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeSummary();
  }, [thread.id]);

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const getEntityTypeColor = (entityType: string) => {
    const colors = {
      CONCEPT: "#bb86fc",
      TERM: "#03dac6",
      MATH_CONCEPT: "#f44336",
      CS_CONCEPT: "#4caf50",
      PERSON: "#ff9800",
      default: "#9e9e9e",
    };
    return colors[entityType as keyof typeof colors] || colors.default;
  };

  const getEntityTypeIcon = (entityType: string) => {
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
  };

  if (loading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AutoFixHigh sx={{ mr: 1, color: "#bb86fc" }} />
            <Typography variant="h6">AI Knowledge Analysis</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Analyzing content and extracting knowledge...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!knowledgeSummary) {
    return null;
  }

  return (
    <Card
      sx={{
        mt: 2,
        background:
          "linear-gradient(145deg, rgba(187, 134, 252, 0.05), rgba(3, 218, 198, 0.05))",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <AutoFixHigh sx={{ mr: 1, color: "#bb86fc" }} />
          <Typography variant="h6">AI Knowledge Analysis</Typography>
          {knowledgeSummary.knowledgeScore && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
              <TrendingUp sx={{ mr: 0.5, fontSize: 16, color: "#03dac6" }} />
              <Typography variant="body2" color="#03dac6" fontWeight="bold">
                Score: {(knowledgeSummary.knowledgeScore * 100).toFixed(0)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* AI Generated Summary */}
        <Accordion
          expanded={expanded === "summary"}
          onChange={handleAccordionChange("summary")}
          sx={{
            mb: 2,
            boxShadow: "none",
            border: "1px solid rgba(187, 134, 252, 0.2)",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "rgba(187, 134, 252, 0.1)" }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              📝 AI Summary
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {knowledgeSummary.aiGeneratedSummary}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Key Entities */}
        {knowledgeSummary.keyEntities &&
          knowledgeSummary.keyEntities.length > 0 && (
            <Accordion
              expanded={expanded === "entities"}
              onChange={handleAccordionChange("entities")}
              sx={{
                mb: 2,
                boxShadow: "none",
                border: "1px solid rgba(3, 218, 198, 0.2)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "rgba(3, 218, 198, 0.1)" }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🧠 Key Concepts ({knowledgeSummary.keyEntities.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {knowledgeSummary.keyEntities.map((entity) => (
                    <Chip
                      key={entity.id}
                      icon={getEntityTypeIcon(entity.entityType)}
                      label={`${entity.name} (${entity.frequencyCount})`}
                      size="small"
                      sx={{
                        backgroundColor: `${getEntityTypeColor(
                          entity.entityType
                        )}20`,
                        color: getEntityTypeColor(entity.entityType),
                        border: `1px solid ${getEntityTypeColor(
                          entity.entityType
                        )}40`,
                        "& .MuiChip-icon": {
                          color: getEntityTypeColor(entity.entityType),
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* Entity Details */}
                <List dense sx={{ mt: 2 }}>
                  {knowledgeSummary.keyEntities.slice(0, 3).map((entity) => (
                    <ListItem key={entity.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getEntityTypeIcon(entity.entityType)}
                      </ListItemIcon>
                      <ListItemText
                        primary={entity.name}
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {entity.description}
                            </Typography>
                            {entity.relatedEntityNames.length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                Related:{" "}
                                {entity.relatedEntityNames
                                  .slice(0, 3)
                                  .join(", ")}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 1 }}
                      >
                        <Typography
                          variant="caption"
                          color="#03dac6"
                          fontWeight="bold"
                        >
                          {(entity.confidenceScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

        {/* Suggested Topics */}
        {knowledgeSummary.suggestedTopics &&
          knowledgeSummary.suggestedTopics.length > 0 && (
            <Accordion
              expanded={expanded === "topics"}
              onChange={handleAccordionChange("topics")}
              sx={{
                mb: 2,
                boxShadow: "none",
                border: "1px solid rgba(255, 152, 0, 0.2)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "rgba(255, 152, 0, 0.1)" }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  💡 Related Topics
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {knowledgeSummary.suggestedTopics.map((topic, index) => (
                    <Chip
                      key={index}
                      label={topic}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: "#ff9800",
                        borderColor: "#ff9800",
                        "&:hover": {
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

        {/* Related Threads */}
        {knowledgeSummary.relatedThreads &&
          knowledgeSummary.relatedThreads.length > 0 && (
            <Accordion
              expanded={expanded === "related"}
              onChange={handleAccordionChange("related")}
              sx={{
                boxShadow: "none",
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  🔗 Related Discussions (
                  {knowledgeSummary.relatedThreads.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {knowledgeSummary.relatedThreads.map(
                    (relatedThread, index) => (
                      <React.Fragment key={relatedThread.id}>
                        <ListItem
                          sx={{
                            px: 0,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.05)",
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
                            primary={relatedThread.title}
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {relatedThread.course} • {relatedThread.topic}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {relatedThread.replyCount} replies •{" "}
                                  {relatedThread.viewCount} views
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < knowledgeSummary.relatedThreads.length - 1 && (
                          <Divider />
                        )}
                      </React.Fragment>
                    )
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeGraphPanel;
