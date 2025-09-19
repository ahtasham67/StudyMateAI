import {
  Analytics,
  AutoAwesome,
  AutoFixHigh,
  BookmarkBorder,
  Category,
  NetworkCheck,
  School,
  Search,
  Share,
  SmartToy,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fab,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { knowledgeAPI, wikipediaAPI } from "../services/api";
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

  // Wikipedia integration state
  const [wikipediaSummary, setWikipediaSummary] = useState<{
    summary: string;
    url: string;
    title: string;
  } | null>(null);
  const [wikipediaLoading, setWikipediaLoading] = useState(false);

  // Enhanced AI features state
  const [aiMode, setAiMode] = useState<"explore" | "learn" | "analyze">(
    "explore"
  );
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadPopularEntities();
    loadRecentSearches();
  }, []);

  const loadPopularEntities = async () => {
    try {
      const response = await knowledgeAPI.getPopularEntities(0, 10);
      setPopularEntities(response.data.content);
    } catch (error) {
      console.error("Failed to load popular entities:", error);
    }
  };

  const loadRecentSearches = () => {
    // Load from localStorage or API
    const recent = JSON.parse(
      localStorage.getItem("recentKnowledgeSearches") || "[]"
    );
    setRecentSearches(recent.slice(0, 5));
  };

  // Validate if a search term is meaningful enough for Wikipedia search
  const isValidWikipediaQuery = (query: string): boolean => {
    const trimmedQuery = query.trim().toLowerCase();

    // Must be at least 3 characters
    if (trimmedQuery.length < 3) return false;

    // Should not be just numbers
    if (/^\d+$/.test(trimmedQuery)) return false;

    // Should not be very short common words
    const shortWords = [
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "en",
      "it",
      "he",
      "she",
      "we",
      "they",
      "you",
      "i",
      "me",
      "us",
      "him",
      "her",
      "them",
    ];
    if (shortWords.includes(trimmedQuery)) return false;

    // Should contain at least one letter
    if (!/[a-zA-Z]/.test(trimmedQuery)) return false;

    // Should be a meaningful phrase (at least one complete word)
    const words = trimmedQuery.split(/\s+/).filter((word) => word.length > 0);
    const meaningfulWords = words.filter(
      (word) => word.length >= 2 && !/^[0-9]+$/.test(word)
    );

    return (
      meaningfulWords.length > 0 &&
      (trimmedQuery.length >= 4 ||
        meaningfulWords.some((word) => word.length >= 4))
    );
  };

  // Enhanced search with AI insights and Wikipedia integration
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSummary("");
      setRelatedEntities([]);
      setWikipediaSummary(null);
      return;
    }

    try {
      setLoading(true);
      setSummaryLoading(true);
      setWikipediaLoading(true);

      // Save recent search
      if (query.trim()) {
        setRecentSearches((prev) => {
          const updated = [query, ...prev.filter((q) => q !== query)].slice(
            0,
            5
          );
          localStorage.setItem(
            "recentKnowledgeSearches",
            JSON.stringify(updated)
          );
          return updated;
        });
      }

      // Search for entities
      const searchResponse = await knowledgeAPI.searchEntities(query);
      setSearchResults(searchResponse.data.content);

      // Get Wikipedia summary only for valid queries (parallel to other requests for speed)
      let wikipediaPromise: Promise<any> | null = null;
      if (isValidWikipediaQuery(query)) {
        wikipediaPromise = wikipediaAPI.getTopicSummary(query);
      } else {
        // Skip Wikipedia search for invalid queries
        setWikipediaSummary(null);
        setWikipediaLoading(false);
      }

      // Get AI summary for the search query
      if (searchResponse.data.content.length > 0) {
        try {
          const summaryResponse = await knowledgeAPI.generateTopicSummary(
            query
          );
          setSummary(summaryResponse.data.summary);
        } catch (error) {
          console.error("Failed to get discussion summary:", error);
          setSummary("");
        }
      }

      // Get Wikipedia summary only if we made the request
      if (wikipediaPromise) {
        try {
          const wikiResult = await wikipediaPromise;
          setWikipediaSummary(wikiResult);
        } catch (error) {
          console.error("Failed to get Wikipedia summary:", error);
          setWikipediaSummary(null);
        } finally {
          setWikipediaLoading(false);
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
      setWikipediaSummary(null);
    } finally {
      setLoading(false);
      setSummaryLoading(false);
      setWikipediaLoading(false);
    }
  }, []); // Remove recentSearches dependency to prevent loop

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

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "explore":
        return <Search />;
      case "learn":
        return <School />;
      case "analyze":
        return <Analytics />;
      default:
        return <Search />;
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        position: "relative",
      }}
    >
      {/* Enhanced Header */}
      <Card
        sx={{
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(187, 134, 252, 0.15), rgba(3, 218, 198, 0.15))",
          border: "1px solid rgba(187, 134, 252, 0.3)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{ background: "linear-gradient(135deg, #bb86fc, #03dac6)" }}
              >
                <SmartToy />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#bb86fc" }}
                >
                  AI Knowledge Explorer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Intelligent Discovery Engine
                </Typography>
              </Box>
            </Box>
            <Tooltip title="AI Assistant">
              <IconButton
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                sx={{
                  background: "rgba(187, 134, 252, 0.1)",
                  "&:hover": { background: "rgba(187, 134, 252, 0.2)" },
                }}
              >
                <AutoFixHigh sx={{ color: "#bb86fc" }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* AI Mode Selector */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {["explore", "learn", "analyze"].map((mode) => (
              <Chip
                key={mode}
                icon={getModeIcon(mode)}
                label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                clickable
                variant={aiMode === mode ? "filled" : "outlined"}
                size="small"
                onClick={() => setAiMode(mode as typeof aiMode)}
                sx={{
                  backgroundColor: aiMode === mode ? "#bb86fc" : "transparent",
                  color: aiMode === mode ? "white" : "#bb86fc",
                  "&:hover": {
                    backgroundColor:
                      aiMode === mode ? "#bb86fc" : "rgba(187, 134, 252, 0.1)",
                  },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`${
            aiMode === "explore"
              ? "Explore concepts..."
              : aiMode === "learn"
              ? "What do you want to learn?"
              : "Analyze knowledge patterns..."
          }`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {getModeIcon(aiMode)}
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              background:
                "linear-gradient(145deg, rgba(187, 134, 252, 0.05), rgba(3, 218, 198, 0.05))",
              border: "1px solid rgba(187, 134, 252, 0.2)",
              "&:hover": {
                background:
                  "linear-gradient(145deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.1))",
              },
              "&.Mui-focused": {
                border: "2px solid #bb86fc",
              },
            },
          }}
        />

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              Recent searches:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {recentSearches.map((recent, index) => (
                <Chip
                  key={index}
                  label={recent}
                  size="small"
                  clickable
                  onClick={() => setSearchQuery(recent)}
                  sx={{
                    fontSize: "0.7rem",
                    height: 24,
                    backgroundColor: "rgba(187, 134, 252, 0.1)",
                    "&:hover": { backgroundColor: "rgba(187, 134, 252, 0.2)" },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {!searchQuery ? (
          <Stack spacing={2}>
            {/* Popular Entities */}
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TrendingUp sx={{ color: "#03dac6", mr: 1 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#03dac6" }}
                  >
                    🔥 Trending Knowledge
                  </Typography>
                  <Badge
                    badgeContent={popularEntities.length}
                    color="primary"
                    sx={{ ml: "auto" }}
                  />
                </Box>
                <List sx={{ p: 0 }}>
                  {popularEntities.slice(0, 6).map((entity, index) => (
                    <ListItem
                      key={entity.id}
                      sx={{
                        mb: 1,
                        p: 1,
                        border: "1px solid rgba(3, 218, 198, 0.2)",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(3, 218, 198, 0.1)",
                          transform: "translateX(4px)",
                        },
                      }}
                      onClick={() => handleEntityClick(entity.name)}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            background: getEntityTypeColor(entity.entityType),
                            fontSize: "0.7rem",
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {entity.name}
                          </Typography>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {entity.frequencyCount}x discussed
                            </Typography>
                            <Chip
                              label={entity.entityType}
                              size="small"
                              sx={{
                                fontSize: "0.6rem",
                                height: 16,
                                backgroundColor: `${getEntityTypeColor(
                                  entity.entityType
                                )}20`,
                                color: getEntityTypeColor(entity.entityType),
                              }}
                            />
                          </Box>
                        }
                      />
                      <IconButton
                        size="small"
                        sx={{ color: getEntityTypeColor(entity.entityType) }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {/* Wikipedia Overview */}
            {(wikipediaLoading || wikipediaSummary) && (
              <Card
                sx={{
                  background:
                    "linear-gradient(145deg, rgba(52, 168, 83, 0.1), rgba(52, 168, 83, 0.05))",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Search sx={{ color: "#34a853", mr: 1 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#34a853" }}
                    >
                      📖 Wikipedia Overview
                    </Typography>
                    {wikipediaSummary && (
                      <IconButton
                        size="small"
                        sx={{ ml: "auto" }}
                        onClick={() =>
                          window.open(wikipediaSummary.url, "_blank")
                        }
                      >
                        <Share fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {wikipediaLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Fetching Wikipedia overview...
                      </Typography>
                    </Box>
                  ) : wikipediaSummary ? (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          fontSize: "1rem",
                          color: "#34a853",
                        }}
                      >
                        {wikipediaSummary.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.6,
                          fontSize: "0.85rem",
                          textAlign: "justify",
                        }}
                      >
                        {wikipediaSummary.summary}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          pt: 1,
                          borderTop: "1px solid rgba(52, 168, 83, 0.2)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Source: Wikipedia •
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: "#34a853",
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              window.open(wikipediaSummary.url, "_blank")
                            }
                          >
                            Read full article
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No Wikipedia article found for this topic.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Discussion Summary */}
            {summary && (
              <Card
                sx={{
                  background:
                    "linear-gradient(145deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.05))",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AutoAwesome sx={{ color: "#bb86fc", mr: 1 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#bb86fc" }}
                    >
                      💬 Summary from Discussion
                    </Typography>
                    <IconButton size="small" sx={{ ml: "auto" }}>
                      <Share fontSize="small" />
                    </IconButton>
                  </Box>
                  {summaryLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Analyzing discussion patterns...
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.7,
                          fontSize: "0.85rem",
                          textAlign: "justify",
                          "& strong": {
                            color: "#bb86fc",
                            fontWeight: 700,
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: summary
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br />"),
                        }}
                      />
                      <Box
                        sx={{
                          mt: 1,
                          pt: 1,
                          borderTop: "1px solid rgba(187, 134, 252, 0.2)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Generated from community discussions and knowledge
                          entities
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Search sx={{ color: "#03dac6", mr: 1 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#03dac6" }}
                    >
                      🎯 Search Results
                    </Typography>
                    <Badge
                      badgeContent={searchResults.length}
                      color="primary"
                      sx={{ ml: "auto" }}
                    />
                  </Box>
                  <List sx={{ p: 0 }}>
                    {searchResults.slice(0, 6).map((entity) => (
                      <ListItem
                        key={entity.id}
                        sx={{
                          border: "1px solid rgba(187, 134, 252, 0.1)",
                          borderRadius: 2,
                          mb: 1,
                          p: 1,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(187, 134, 252, 0.1)",
                            transform: "scale(1.02)",
                          },
                        }}
                        onClick={() => handleEntityClick(entity.name)}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              background: getEntityTypeColor(entity.entityType),
                            }}
                          >
                            <Category fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              sx={{ fontSize: "0.85rem" }}
                            >
                              {entity.name}
                            </Typography>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(entity.confidenceScore * 100).toFixed(0)}%
                                confidence
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {entity.frequencyCount}x mentioned
                              </Typography>
                              <Chip
                                label={entity.entityType}
                                size="small"
                                sx={{
                                  fontSize: "0.6rem",
                                  height: 16,
                                  backgroundColor: `${getEntityTypeColor(
                                    entity.entityType
                                  )}20`,
                                  color: getEntityTypeColor(entity.entityType),
                                }}
                              />
                            </Box>
                          }
                        />
                        <IconButton size="small">
                          <BookmarkBorder fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Related Concepts */}
            {relatedEntities.length > 0 && (
              <Card sx={{ background: "rgba(255, 152, 0, 0.05)" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <NetworkCheck sx={{ color: "#ff9800", mr: 1 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#ff9800" }}
                    >
                      🔗 Related Concepts
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: `${getEntityTypeColor(
                              entity.entityType
                            )}30`,
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {searchQuery && !loading && searchResults.length === 0 && (
              <Alert
                severity="info"
                sx={{
                  background:
                    "linear-gradient(145deg, rgba(158, 158, 158, 0.1), rgba(158, 158, 158, 0.05))",
                }}
                action={
                  <Button size="small" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                }
              >
                <Typography variant="body2">
                  No results found for "{searchQuery}"
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try broader terms, different concepts, or use our AI
                  suggestions
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
      </Box>

      {/* Floating AI Assistant */}
      <Slide direction="up" in={showAiAssistant} mountOnEnter unmountOnExit>
        <Fab
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "linear-gradient(135deg, #bb86fc, #03dac6)",
            "&:hover": {
              background: "linear-gradient(135deg, #9c27b0, #00acc1)",
            },
          }}
          onClick={() => setShowAiAssistant(false)}
        >
          <SmartToy />
        </Fab>
      </Slide>
    </Box>
  );
};

export default KnowledgeSidebar;
