import {
  AutoAwesome,
  Category,
  Close,
  Psychology,
  Search,
  TrendingUp,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { knowledgeAPI } from "../services/api";
import { KnowledgeEntity } from "../types";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface KnowledgeSearchPanelProps {
  open: boolean;
  onClose: () => void;
  threadId?: number;
}

const KnowledgeSearchPanel: React.FC<KnowledgeSearchPanelProps> = ({
  open,
  onClose,
  threadId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeEntity[]>([]);
  const [relatedEntities, setRelatedEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSummary("");
      return;
    }

    try {
      setLoading(true);
      setSummaryLoading(true);

      // Search for entities
      const searchResponse = await knowledgeAPI.searchEntities(query);
      setSearchResults(searchResponse.data.content);

      // Get AI summary for the search query
      if (searchResponse.data.content.length > 0) {
        try {
          const summaryResponse = await knowledgeAPI.generateTopicSummary(
            query
          );
          setSummary(summaryResponse.data.summary);
        } catch (error) {
          console.error("Failed to get AI summary:", error);
          setSummary("");
        }
      }

      // Get related entities if we have results
      if (searchResponse.data.content.length > 0) {
        const topEntity = searchResponse.data.content[0];
        try {
          const relatedResponse = await knowledgeAPI.getRelatedEntities(
            topEntity.id
          );
          setRelatedEntities(relatedResponse.data);
        } catch (error) {
          console.error("Failed to get related entities:", error);
          setRelatedEntities([]);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
      setSummary("");
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 500),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

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

  const handleEntityClick = (entityName: string) => {
    setSearchQuery(entityName);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 0,
        width: 400,
        height: "calc(100vh - 80px)",
        backgroundColor: "rgba(26, 26, 26, 0.98)",
        borderLeft: "1px solid rgba(187, 134, 252, 0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(187, 134, 252, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Psychology sx={{ color: "#bb86fc" }} />
          <Typography variant="h6" sx={{ color: "#bb86fc", fontWeight: 600 }}>
            Knowledge Explorer
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search concepts, topics, terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#bb86fc" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "rgba(187, 134, 252, 0.05)",
              "&:hover": {
                backgroundColor: "rgba(187, 134, 252, 0.1)",
              },
            },
          }}
        />
        {loading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {!searchQuery ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: "rgba(3, 218, 198, 0.1)",
              color: "#03dac6",
              border: "1px solid rgba(3, 218, 198, 0.3)",
            }}
          >
            Search for any topic to get AI-powered insights and related
            knowledge from discussions.
          </Alert>
        ) : (
          <Box>
            {/* AI Summary */}
            {summary && (
              <Accordion
                defaultExpanded
                sx={{ mb: 2, backgroundColor: "rgba(187, 134, 252, 0.05)" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#bb86fc" }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <AutoAwesome sx={{ color: "#bb86fc", fontSize: 20 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#bb86fc" }}
                  >
                    AI Summary
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {summaryLoading ? (
                    <Box>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Generating AI summary...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {summary}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Accordion
                defaultExpanded
                sx={{ mb: 2, backgroundColor: "rgba(3, 218, 198, 0.05)" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#03dac6" }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <Search sx={{ color: "#03dac6", fontSize: 20 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#03dac6" }}
                  >
                    Found Entities ({searchResults.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List>
                    {searchResults.slice(0, 8).map((entity, index) => (
                      <ListItem
                        key={entity.id}
                        sx={{
                          border: "1px solid rgba(187, 134, 252, 0.1)",
                          borderRadius: 1,
                          mb: 1,
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(187, 134, 252, 0.1)",
                          },
                        }}
                        onClick={() => handleEntityClick(entity.name)}
                      >
                        <ListItemIcon>
                          <Category
                            sx={{
                              color: getEntityTypeColor(entity.entityType),
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight="bold">
                                {entity.name}
                              </Typography>
                              <Chip
                                label={entity.entityType}
                                size="small"
                                sx={{
                                  fontSize: "0.6rem",
                                  height: 18,
                                  backgroundColor: `${getEntityTypeColor(
                                    entity.entityType
                                  )}20`,
                                  color: getEntityTypeColor(entity.entityType),
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {entity.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Confidence:{" "}
                                {(entity.confidenceScore * 100).toFixed(0)}% •
                                Discussed {entity.frequencyCount} times
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Related Entities */}
            {relatedEntities.length > 0 && (
              <Accordion sx={{ backgroundColor: "rgba(255, 152, 0, 0.05)" }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#ff9800" }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <TrendingUp sx={{ color: "#ff9800", fontSize: 20 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#ff9800" }}
                  >
                    Related Concepts
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {relatedEntities.slice(0, 12).map((entity, index) => (
                      <Chip
                        key={entity.id}
                        label={entity.name}
                        size="small"
                        clickable
                        onClick={() => handleEntityClick(entity.name)}
                        sx={{
                          backgroundColor: `${getEntityTypeColor(
                            entity.entityType
                          )}20`,
                          color: getEntityTypeColor(entity.entityType),
                          border: `1px solid ${getEntityTypeColor(
                            entity.entityType
                          )}40`,
                          "&:hover": {
                            backgroundColor: `${getEntityTypeColor(
                              entity.entityType
                            )}30`,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* No Results */}
            {searchQuery && !loading && searchResults.length === 0 && (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "rgba(158, 158, 158, 0.05)",
                  border: "1px solid rgba(158, 158, 158, 0.2)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No knowledge entities found for "{searchQuery}"
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Try searching for concepts, terms, or topics discussed in
                  threads
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KnowledgeSearchPanel;
