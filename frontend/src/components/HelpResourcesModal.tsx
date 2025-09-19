import {
  Article,
  Close,
  Help,
  OndemandVideo,
  RssFeed,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { helpResourcesAPI } from "../services/api";
import {
  ArticleResource,
  HelpResourcesResponse,
  VideoResource,
} from "../types";

interface HelpResourcesModalProps {
  open: boolean;
  onClose: () => void;
  materialId?: number;
  materialTitle?: string;
  initialQuery?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-resources-tabpanel-${index}`}
      aria-labelledby={`help-resources-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HelpResourcesModal: React.FC<HelpResourcesModalProps> = ({
  open,
  onClose,
  materialId,
  materialTitle,
  initialQuery,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [resources, setResources] = useState<HelpResourcesResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && materialId) {
      loadInitialResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, materialId]);

  const loadInitialResources = async () => {
    if (!materialId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await helpResourcesAPI.getResourcesForMaterial(
        materialId,
        searchQuery
      );
      setResources(response.data);
    } catch (err) {
      setError("Failed to load help resources. Please try again.");
      console.error("Error loading help resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await helpResourcesAPI.searchResources({
        searchQuery: searchQuery.trim(),
        maxResults: 10,
      });
      setResources(response.data);
    } catch (err) {
      setError("Failed to search resources. Please try again.");
      console.error("Error searching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const VideoCard: React.FC<{ video: VideoResource }> = ({ video }) => (
    <Card
      sx={{ mb: 2, cursor: "pointer" }}
      onClick={() => window.open(video.url, "_blank")}
    >
      <Box sx={{ display: "flex" }}>
        {video.thumbnailUrl && (
          <CardMedia
            component="img"
            sx={{ width: 120, height: 90 }}
            image={video.thumbnailUrl}
            alt={video.title}
          />
        )}
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {video.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {video.description}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Chip
              label={video.channel || "YouTube"}
              size="small"
              color="primary"
              variant="outlined"
            />
            {video.duration && (
              <Typography variant="caption" color="text.secondary">
                {video.duration}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );

  const ArticleCard: React.FC<{
    article: ArticleResource;
    type: "article" | "blog";
  }> = ({ article, type }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          underline="hover"
        >
          <Typography variant="subtitle2" gutterBottom>
            {article.title}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {article.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            label={article.source || "Web"}
            size="small"
            color={type === "blog" ? "secondary" : "info"}
            variant="outlined"
          />
          {article.publishedDate && (
            <Typography variant="caption" color="text.secondary">
              {article.publishedDate}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Help sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">
              Help Resources{materialTitle && ` - ${materialTitle}`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for specific topics or leave empty for material-based suggestions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab
            icon={<OndemandVideo />}
            label={`Videos (${resources?.videos?.length || 0})`}
            iconPosition="start"
          />
          <Tab
            icon={<Article />}
            label={`Articles (${resources?.articles?.length || 0})`}
            iconPosition="start"
          />
          <Tab
            icon={<RssFeed />}
            label={`Blogs (${resources?.blogs?.length || 0})`}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {resources?.videos?.length ? (
                resources.videos.map((video, index) => (
                  <VideoCard key={index} video={video} />
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No video resources found. Try searching with different
                  keywords.
                </Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {resources?.articles?.length ? (
                resources.articles.map((article, index) => (
                  <ArticleCard key={index} article={article} type="article" />
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No article resources found. Try searching with different
                  keywords.
                </Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {resources?.blogs?.length ? (
                resources.blogs.map((blog, index) => (
                  <ArticleCard key={index} article={blog} type="blog" />
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No blog resources found. Try searching with different
                  keywords.
                </Typography>
              )}
            </TabPanel>
          </>
        )}

        {resources && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Found {resources.totalResults} resources for "
              {resources.searchQuery}"
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HelpResourcesModal;
