import {
  AutoAwesome,
  Category,
  Psychology,
  Search,
  TrendingUp,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
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

const KnowledgeSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeEntity[]>([]);
  const [relatedEntities, setRelatedEntities] = useState<KnowledgeEntity[]>([]);
  const [popularEntities, setPopularEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load popular entities on mount
  useEffect(() => {
    loadPopularEntities();
  }, []);

  const loadPopularEntities = async () => {
    try {
      const response = await knowledgeAPI.getPopularEntities(0, 10);
      setPopularEntities(response.data.content);
    } catch (error) {
      console.error("Failed to load popular entities:", error);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSummary("");
      setRelatedEntities([]);
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

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <Psychology sx={{ color: "#bb86fc", fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: "#bb86fc", fontWeight: 700 }}>
            Knowledge Explorer
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Discover insights across all discussions
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search concepts, topics, terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#bb86fc", fontSize: 20 }} />
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
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {!searchQuery ? (
          // Show popular entities when no search
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 600, color: "#03dac6" }}
            >
              🔥 Trending Topics
            </Typography>
            <List>
              {popularEntities.slice(0, 8).map((entity) => (
                <ListItem
                  key={entity.id}
                  sx={{
                    mb: 1,
                    border: "1px solid rgba(3, 218, 198, 0.2)",
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(3, 218, 198, 0.05)",
                    },
                  }}
                  onClick={() => handleEntityClick(entity.name)}
                >
                  <ListItemIcon>
                    <TrendingUp
                      sx={{
                        color: getEntityTypeColor(entity.entityType),
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold">
                        {entity.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Discussed {entity.frequencyCount} times
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          // Show search results
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
                    variant="subtitle2"
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
                        Generating summary...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ lineHeight: 1.6, fontSize: "0.85rem" }}
                    >
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
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#03dac6" }}
                  >
                    Results ({searchResults.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <List>
                    {searchResults.slice(0, 6).map((entity) => (
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
                              fontSize: 18,
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
                              <Typography variant="body2" fontWeight="bold">
                                {entity.name}
                              </Typography>
                              <Chip
                                label={entity.entityType}
                                size="small"
                                sx={{
                                  fontSize: "0.5rem",
                                  height: 16,
                                  backgroundColor: `${getEntityTypeColor(
                                    entity.entityType
                                  )}20`,
                                  color: getEntityTypeColor(entity.entityType),
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {(entity.confidenceScore * 100).toFixed(0)}% •{" "}
                              {entity.frequencyCount} times
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Related Concepts */}
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
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#ff9800" }}
                  >
                    Related
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {relatedEntities.slice(0, 8).map((entity) => (
                      <Chip
                        key={entity.id}
                        label={entity.name}
                        size="small"
                        clickable
                        onClick={() => handleEntityClick(entity.name)}
                        sx={{
                          fontSize: "0.7rem",
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
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "rgba(158, 158, 158, 0.05)",
                  border: "1px solid rgba(158, 158, 158, 0.2)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No results for "{searchQuery}"
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Try broader terms or concepts
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KnowledgeSidebar;
