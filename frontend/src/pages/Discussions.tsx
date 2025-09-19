import {
  Add,
  Book,
  Delete,
  FilterList,
  Forum,
  Lock,
  MoreVert,
  PushPin,
  Reply,
  Search,
  Sort,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import { useAuth } from "../context/AuthContext";
import { discussionAPI } from "../services/api";
import {
  DISCUSSION_EVENTS,
  discussionWS,
} from "../services/discussionWebSocket";
import { DiscussionThread } from "../types";

const Discussions: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sortBy, setSortBy] = useState("lastActivityAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [courses, setCourses] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<DiscussionThread | null>(
    null
  );
  const [deleteMenuAnchor, setDeleteMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [deleteMenuThreadId, setDeleteMenuThreadId] = useState<number | null>(
    null
  );

  const loadThreads = React.useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm) {
        // Use advanced search for better relevance and comprehensive matching
        response = await discussionAPI.searchThreadsAdvanced(
          searchTerm,
          selectedCourse || undefined,
          page,
          10
        );
      } else if (selectedCourse && selectedTopic) {
        response = await discussionAPI.getThreadsByCourseAndTopic(
          selectedCourse,
          selectedTopic,
          page,
          10
        );
      } else if (selectedCourse) {
        response = await discussionAPI.getThreadsByCourse(
          selectedCourse,
          page,
          10
        );
      } else if (selectedTopic) {
        response = await discussionAPI.getThreadsByTopic(
          selectedTopic,
          page,
          10
        );
      } else {
        response = await discussionAPI.getAllThreads(
          page,
          10,
          sortBy,
          sortDirection
        );
      }

      setThreads(response.data.threads); // Access threads from the response object
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortDirection, selectedCourse, selectedTopic, searchTerm]);

  useEffect(() => {
    loadThreads();
    loadCourses();

    // Connect to WebSocket for real-time updates
    if (token) {
      discussionWS.connect(token);

      let cleanupFunctions: (() => void)[] = [];
      let checkConnectionTimer: NodeJS.Timeout;

      // Function to register event listeners once connected
      const registerEventListeners = () => {
        if (discussionWS.isConnected()) {
          // Subscribe to real-time events
          const unsubscribeThreadCreated = discussionWS.on(
            DISCUSSION_EVENTS.THREAD_CREATED,
            (newThread) => {
              setThreads((prev) => [newThread, ...prev]);
            }
          );

          const unsubscribeThreadUpdated = discussionWS.on(
            DISCUSSION_EVENTS.THREAD_UPDATED,
            (updatedThread) => {
              setThreads((prev) =>
                prev.map((thread) =>
                  thread.id === updatedThread.id ? updatedThread : thread
                )
              );
            }
          );

          const unsubscribeThreadDeleted = discussionWS.on(
            DISCUSSION_EVENTS.THREAD_DELETED,
            (threadId) => {
              setThreads((prev) =>
                prev.filter((thread) => thread.id !== threadId)
              );
            }
          );

          const unsubscribeReplyCreated = discussionWS.on(
            DISCUSSION_EVENTS.REPLY_CREATED,
            (data) => {
              // Update reply count for the thread
              setThreads((prev) =>
                prev.map((thread) =>
                  thread.id === data.threadId
                    ? {
                        ...thread,
                        replyCount: thread.replyCount + 1,
                        lastActivityAt: data.createdAt,
                      }
                    : thread
                )
              );
            }
          );

          // Store cleanup functions
          cleanupFunctions = [
            unsubscribeThreadCreated,
            unsubscribeThreadUpdated,
            unsubscribeThreadDeleted,
            unsubscribeReplyCreated,
          ];
        } else {
          checkConnectionTimer = setTimeout(registerEventListeners, 500);
        }
      };

      // Start checking for connection
      checkConnectionTimer = setTimeout(registerEventListeners, 100);

      // Cleanup function
      return () => {
        clearTimeout(checkConnectionTimer);
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    }
  }, [loadThreads, token]);

  useEffect(() => {
    if (selectedCourse) {
      loadTopics(selectedCourse);
    } else {
      setTopics([]);
      setSelectedTopic("");
    }
  }, [selectedCourse]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  const loadCourses = async () => {
    try {
      const response = await discussionAPI.getAllCourses();
      setCourses(response.data.courses); // Access courses from the response object
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const loadTopics = async (course: string) => {
    try {
      const response = await discussionAPI.getTopicsByCourse(course);
      setTopics(response.data.topics); // Access topics from the response object
    } catch (error) {
      console.error("Error loading topics:", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);

    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      setSearchTerm(value);
      setPage(0);
    }, 300); // 300ms debounce

    setSearchDebounceTimer(timer);
  };

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    setSelectedTopic("");
    setPage(0);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: string) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPage(0);
    setSortMenuAnchor(null);
  };

  const clearFilters = () => {
    setSelectedCourse("");
    setSelectedTopic("");
    setSearchTerm("");
    setSearchInput("");
    setPage(0);

    // Clear debounce timer if active
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      setSearchDebounceTimer(null);
    }
  };

  const isAuthor = (thread: DiscussionThread) => {
    return user && user.username === thread.authorName;
  };

  const isAdmin = () => {
    // For now, we'll just check if the user can delete (owners can delete their own threads)
    return false;
  };

  const handleDeleteMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    threadId: number
  ) => {
    event.stopPropagation();
    setDeleteMenuAnchor(event.currentTarget);
    setDeleteMenuThreadId(threadId);
  };

  const handleDeleteMenuClose = () => {
    setDeleteMenuAnchor(null);
    setDeleteMenuThreadId(null);
  };

  const handleDeleteClick = (thread: DiscussionThread) => {
    setThreadToDelete(thread);
    setDeleteDialogOpen(true);
    handleDeleteMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!threadToDelete) return;

    try {
      await discussionAPI.deleteThread(threadToDelete.id);
      setThreads(threads.filter((t) => t.id !== threadToDelete.id));
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setThreadToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Highlight search terms in text
  const highlightSearchTerms = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const terms = searchTerm.trim().toLowerCase().split(/\s+/);
    let highlightedText = text;

    terms.forEach((term) => {
      if (term.length > 1) {
        const regex = new RegExp(`(${term})`, "gi");
        highlightedText = highlightedText.replace(
          regex,
          '<mark style="background-color: rgba(187, 134, 252, 0.3); padding: 2px 4px; border-radius: 4px;">$1</mark>'
        );
      }
    });

    return highlightedText;
  };

  const ThreadCard: React.FC<{ thread: DiscussionThread }> = ({ thread }) => (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(187, 134, 252, 0.15)",
        },
      }}
      onClick={() => navigate(`/discussions/thread/${thread.id}`)}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              {thread.isPinned && (
                <PushPin sx={{ fontSize: 16, color: "#bb86fc" }} />
              )}
              {thread.isLocked && (
                <Lock sx={{ fontSize: 16, color: "#f44336" }} />
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: thread.isPinned ? "#bb86fc" : "text.primary",
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerms(thread.title, searchTerm),
                }}
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerms(thread.content, searchTerm),
              }}
            />

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip
                label={thread.course}
                size="small"
                icon={<Book sx={{ fontSize: 16 }} />}
                sx={{
                  background:
                    "linear-gradient(45deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.1))",
                  border: "1px solid rgba(187, 134, 252, 0.3)",
                  color: "#bb86fc",
                }}
              />
              <Chip
                label={thread.topic}
                size="small"
                variant="outlined"
                sx={{ borderColor: "rgba(3, 218, 198, 0.3)", color: "#03dac6" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {thread.authorName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  by {thread.authorName} • {formatDate(thread.createdAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Visibility sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {thread.viewCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Reply sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {thread.replyCount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Three-dots menu for thread owner */}
          {(isAuthor(thread) || isAdmin()) && (
            <Box sx={{ ml: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteMenuOpen(e, thread.id)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "text.primary",
                  },
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const ThreadSkeleton: React.FC = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={100} height={24} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Skeleton variant="text" width={200} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, pr: 2, pl: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, px: 4 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  Discussion Threads
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Collaborate, share insights, and ask questions
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/discussions/create")}
                sx={{
                  borderRadius: "12px",
                  px: 3,
                  py: 1.5,
                  background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                }}
              >
                New Thread
              </Button>
            </Box>

            {/* Search and Filters */}
            <Card sx={{ mb: 4, p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  alignItems: { xs: "stretch", md: "center" },
                }}
              >
                <Box sx={{ flex: { xs: 1, md: 3 } }}>
                  <TextField
                    fullWidth
                    placeholder="Search by keywords, titles, content, topics... (e.g., 'java programming', 'algorithm')"
                    value={searchInput}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(187, 134, 252, 0.5)",
                          },
                        },
                        "&.Mui-focused": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#bb86fc",
                          },
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={selectedCourse}
                      label="Course"
                      onChange={(e) => handleCourseChange(e.target.value)}
                    >
                      <MenuItem value="">All Courses</MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course} value={course}>
                          {course}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth disabled={!selectedCourse}>
                    <InputLabel>Topic</InputLabel>
                    <Select
                      value={selectedTopic}
                      label="Topic"
                      onChange={(e) => handleTopicChange(e.target.value)}
                    >
                      <MenuItem value="">All Topics</MenuItem>
                      {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          {topic}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <Sort />
                    </IconButton>
                    <IconButton
                      onClick={clearFilters}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <FilterList />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Search Results Status */}
            {searchTerm && (
              <Card
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: "rgba(187, 134, 252, 0.05)",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Searching for:</strong> "{searchTerm}"
                  {selectedCourse && ` in course "${selectedCourse}"`}
                  {!loading &&
                    ` • Found ${threads.length} result${
                      threads.length !== 1 ? "s" : ""
                    }`}
                </Typography>
              </Card>
            )}

            {/* Threads List */}
            <Box>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <ThreadSkeleton key={index} />
                ))
              ) : threads.length === 0 ? (
                <Card sx={{ textAlign: "center", py: 8 }}>
                  <CardContent>
                    <Forum
                      sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      No discussions found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {searchTerm || selectedCourse || selectedTopic
                        ? "Try adjusting your search criteria or filters."
                        : "Be the first to start a discussion!"}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/discussions/create")}
                      sx={{
                        background: "linear-gradient(45deg, #bb86fc, #03dac6)",
                      }}
                    >
                      Create First Thread
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {threads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}

                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, newPage) => setPage(newPage - 1)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Floating Action Button */}
            <Fab
              color="primary"
              onClick={() => navigate("/discussions/create")}
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                background: "linear-gradient(45deg, #bb86fc, #03dac6)",
              }}
            >
              <Add />
            </Fab>

            {/* Sort Menu */}
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={() => setSortMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => handleSortChange("lastActivityAt", "desc")}
              >
                Recent Activity
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("createdAt", "desc")}>
                Newest First
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("createdAt", "asc")}>
                Oldest First
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("title", "asc")}>
                Title A-Z
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("replyCount", "desc")}>
                Most Replies
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("viewCount", "desc")}>
                Most Views
              </MenuItem>
            </Menu>

            {/* Delete Menu */}
            <Menu
              anchorEl={deleteMenuAnchor}
              open={Boolean(deleteMenuAnchor)}
              onClose={handleDeleteMenuClose}
            >
              <MenuItem
                onClick={() => {
                  const thread = threads.find(
                    (t) => t.id === deleteMenuThreadId
                  );
                  if (thread) handleDeleteClick(thread);
                }}
                sx={{ color: "error.main" }}
              >
                <Delete sx={{ mr: 1, fontSize: 20 }} />
                Delete Thread
              </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={handleDeleteCancel}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Delete Thread</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this thread? This action
                  cannot be undone and will remove all replies.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel}>Cancel</Button>
                <Button
                  onClick={handleDeleteConfirm}
                  color="error"
                  variant="contained"
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Container>
      </Box>

      {/* Right Sidebar - Knowledge Section */}
      <Box
        sx={{
          width: 400,
          minHeight: "100vh",
          backgroundColor: "rgba(26, 26, 26, 0.98)",
          borderLeft: "1px solid rgba(187, 134, 252, 0.2)",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <KnowledgeSidebar />
      </Box>
    </Box>
  );
};

export default Discussions;
