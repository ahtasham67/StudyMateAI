import {
  Category,
  Psychology,
  Search,
  Timeline,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { knowledgeAPI } from "../services/api";
import { KnowledgeEntity } from "../types";

const KnowledgeExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeEntity[]>([]);
  const [popularEntities, setPopularEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<{
    totalEntities: number;
    topEntities: any[];
  }>({ totalEntities: 0, topEntities: [] });

  useEffect(() => {
    loadPopularEntities();
    loadStats();
  }, []);

  const loadPopularEntities = async () => {
    try {
      const response = await knowledgeAPI.getPopularEntities(0, 20);
      setPopularEntities(response.data.content);
    } catch (error) {
      console.error("Failed to load popular entities:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await knowledgeAPI.getKnowledgeStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await knowledgeAPI.searchEntities(query);
      setSearchResults(response.data.content);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #bb86fc, #03dac6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            🧠 Knowledge Graph Explorer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explore the interconnected web of knowledge from discussions
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mb: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(187, 134, 252, 0.1), rgba(187, 134, 252, 0.05))",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Psychology sx={{ fontSize: 40, color: "#bb86fc", mr: 2 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#bb86fc" }}
                    >
                      {stats.totalEntities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Knowledge Entities
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, rgba(3, 218, 198, 0.1), rgba(3, 218, 198, 0.05))",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Timeline sx={{ fontSize: 40, color: "#03dac6", mr: 2 }} />
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#03dac6" }}
                    >
                      {stats.topEntities.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top Trending Concepts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Search */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search knowledge entities, concepts, and topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            {loading && <LinearProgress sx={{ mt: 2 }} />}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab
                label={
                  searchQuery
                    ? `Search Results (${searchResults.length})`
                    : "Popular Entities"
                }
              />
              <Tab label="Top Concepts" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    <List>
                      {searchResults.map((entity) => (
                        <ListItem
                          key={entity.id}
                          sx={{
                            mb: 1,
                            border: "1px solid rgba(187, 134, 252, 0.2)",
                            borderRadius: 1,
                            "&:hover": {
                              backgroundColor: "rgba(187, 134, 252, 0.05)",
                            },
                          }}
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
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {entity.name}
                                </Typography>
                                <Chip
                                  label={entity.entityType}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${getEntityTypeColor(
                                      entity.entityType
                                    )}20`,
                                    color: getEntityTypeColor(
                                      entity.entityType
                                    ),
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {entity.description}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Confidence:{" "}
                                  {(entity.confidenceScore * 100).toFixed(0)}% •
                                  Frequency: {entity.frequencyCount} • Related
                                  Threads: {entity.relatedThreadCount}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ py: 4 }}
                    >
                      No entities found for "{searchQuery}"
                    </Typography>
                  )
                ) : (
                  <List>
                    {popularEntities.map((entity) => (
                      <ListItem
                        key={entity.id}
                        sx={{
                          mb: 1,
                          border: "1px solid rgba(3, 218, 198, 0.2)",
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: "rgba(3, 218, 198, 0.05)",
                          },
                        }}
                      >
                        <ListItemIcon>
                          <TrendingUp
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
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold">
                                {entity.name}
                              </Typography>
                              <Chip
                                label={entity.entityType}
                                size="small"
                                sx={{
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
                                variant="body2"
                                color="text.secondary"
                              >
                                {entity.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Confidence:{" "}
                                {(entity.confidenceScore * 100).toFixed(0)}% •
                                Frequency: {entity.frequencyCount} • Related
                                Threads: {entity.relatedThreadCount}
                              </Typography>
                              {entity.relatedEntityNames.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Related:
                                  </Typography>
                                  {entity.relatedEntityNames
                                    .slice(0, 3)
                                    .map((name, index) => (
                                      <Chip
                                        key={index}
                                        label={name}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          ml: 0.5,
                                          fontSize: "0.6rem",
                                          height: 20,
                                        }}
                                      />
                                    ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Most Frequently Discussed Concepts
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {stats.topEntities.map((entity, index) => (
                    <Chip
                      key={index}
                      label={`${entity.name} (${entity.frequency})`}
                      sx={{
                        backgroundColor: `${getEntityTypeColor(entity.type)}20`,
                        color: getEntityTypeColor(entity.type),
                        border: `1px solid ${getEntityTypeColor(
                          entity.type
                        )}40`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default KnowledgeExplorer;
