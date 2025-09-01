import {
  ArrowBack,
  Delete,
  Lock,
  MoreVert,
  PushPin,
  Reply,
  Send,
} from "@mui/icons-material";
import {
  Alert,
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
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { discussionAPI } from "../services/api";
import {
  DISCUSSION_EVENTS,
  discussionWS,
} from "../services/discussionWebSocket";
import { CreateReplyRequest, DiscussionThread, ThreadReply } from "../types";

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [parentReplyId, setParentReplyId] = useState<number | null>(null);
  const [replyPage, setReplyPage] = useState(0);
  const [totalReplyPages, setTotalReplyPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadThread = async () => {
    try {
      setLoading(true);
      const response = await discussionAPI.getThreadById(Number(id));
      console.log("Loaded thread response:", response.data); // Debug log

      // Extract thread from wrapped response
      const threadData = (response.data as any).thread || response.data;
      console.log("Thread data:", threadData); // Debug log
      setThread(threadData as any);
    } catch (error) {
      console.error("Error loading thread:", error);
      setSnackbar({
        open: true,
        message: "Failed to load thread",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (silent = false) => {
    try {
      if (!silent) setRepliesLoading(true);
      const response = await discussionAPI.getRepliesByThread(
        Number(id),
        replyPage,
        20
      );
      setReplies(response.data.content);
      setTotalReplyPages(response.data.totalPages);
    } catch (error) {
      console.error("Error loading replies:", error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: "Failed to load replies",
          severity: "error",
        });
      }
    } finally {
      if (!silent) setRepliesLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadThread();
      loadReplies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id) {
      loadReplies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyPage]);

  // Auto-refresh replies every 30 seconds for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      discussionWS.connect(token);

      if (id) {
        discussionWS.subscribeToThread(Number(id));

        // Subscribe to real-time events for this thread
        const unsubscribeReplyCreated = discussionWS.on(
          DISCUSSION_EVENTS.REPLY_CREATED,
          (data: any) => {
            if (data.threadId === Number(id)) {
              loadReplies(true); // Silent refresh to get new replies
              loadThread(); // Update thread reply count
            }
          }
        );

        const unsubscribeReplyDeleted = discussionWS.on(
          DISCUSSION_EVENTS.REPLY_DELETED,
          (data: any) => {
            if (data.threadId === Number(id)) {
              loadReplies(true);
              loadThread();
            }
          }
        );

        const unsubscribeThreadUpdated = discussionWS.on(
          DISCUSSION_EVENTS.THREAD_UPDATED,
          (updatedThread: any) => {
            if (updatedThread.id === Number(id)) {
              setThread(updatedThread);
            }
          }
        );

        const unsubscribeThreadLocked = discussionWS.on(
          DISCUSSION_EVENTS.THREAD_LOCKED,
          (updatedThread: any) => {
            if (updatedThread.id === Number(id)) {
              setThread(updatedThread);
            }
          }
        );

        const unsubscribeThreadPinned = discussionWS.on(
          DISCUSSION_EVENTS.THREAD_PINNED,
          (updatedThread: any) => {
            if (updatedThread.id === Number(id)) {
              setThread(updatedThread);
            }
          }
        );

        return () => {
          discussionWS.unsubscribeFromThread(Number(id));
          unsubscribeReplyCreated();
          unsubscribeReplyDeleted();
          unsubscribeThreadUpdated();
          unsubscribeThreadLocked();
          unsubscribeThreadPinned();
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      const replyData: CreateReplyRequest = {
        content: replyText,
        parentReplyId: parentReplyId || undefined,
      };

      await discussionAPI.createReply(Number(id), replyData);
      setReplyText("");
      setParentReplyId(null);
      loadReplies();
      loadThread(); // Reload thread to update reply count

      setSnackbar({
        open: true,
        message: "Reply posted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error posting reply:", error);
      setSnackbar({
        open: true,
        message: "Failed to post reply",
        severity: "error",
      });
    }
  };

  const handleDeleteThread = async () => {
    try {
      await discussionAPI.deleteThread(Number(id));
      setSnackbar({
        open: true,
        message: "Thread deleted successfully",
        severity: "success",
      });
      setTimeout(() => navigate("/discussions"), 1500);
    } catch (error) {
      console.error("Error deleting thread:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete thread",
        severity: "error",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      await discussionAPI.deleteReply(replyId);
      loadReplies();
      loadThread(); // Reload thread to update reply count
      setSnackbar({
        open: true,
        message: "Reply deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting reply:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete reply",
        severity: "error",
      });
    }
  };

  const handlePinThread = async () => {
    try {
      await discussionAPI.pinThread(Number(id));
      loadThread();
      setSnackbar({
        open: true,
        message: thread?.isPinned ? "Thread unpinned" : "Thread pinned",
        severity: "success",
      });
    } catch (error) {
      console.error("Error pinning thread:", error);
      setSnackbar({
        open: true,
        message: "Failed to pin/unpin thread",
        severity: "error",
      });
    }
    setMenuAnchor(null);
  };

  const handleLockThread = async () => {
    try {
      await discussionAPI.lockThread(Number(id));
      loadThread();
      setSnackbar({
        open: true,
        message: thread?.isLocked ? "Thread unlocked" : "Thread locked",
        severity: "success",
      });
    } catch (error) {
      console.error("Error locking thread:", error);
      setSnackbar({
        open: true,
        message: "Failed to lock/unlock thread",
        severity: "error",
      });
    }
    setMenuAnchor(null);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Date unavailable";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
  };

  const isAuthor = (authorName: string) => {
    return user?.username === authorName;
  };

  const isAdmin = () => {
    return (user as any)?.role === "ADMIN";
  };

  const ReplyCard: React.FC<{ reply: ThreadReply; isNested?: boolean }> = ({
    reply,
    isNested = false,
  }) => (
    <Card
      sx={{
        mb: 2,
        ml: isNested ? 4 : 0,
        border: isNested
          ? "1px solid rgba(3, 218, 198, 0.2)"
          : "1px solid rgba(187, 134, 252, 0.1)",
      }}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {reply.authorName
                ? reply.authorName.charAt(0).toUpperCase()
                : "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {reply.authorName || "Unknown User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(reply.createdAt)}
              </Typography>
            </Box>
          </Box>
          {(isAuthor(reply.authorName) || isAdmin()) && (
            <IconButton
              size="small"
              onClick={() => handleDeleteReply(reply.id)}
              sx={{ color: "error.main" }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          {reply.content}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            startIcon={<Reply />}
            onClick={() => {
              setParentReplyId(reply.id);
              setReplyText(`@${reply.authorName} `);
            }}
            sx={{ color: "#03dac6" }}
          >
            Reply
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mb: 4 }} />
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </Container>
    );
  }

  if (!thread) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error">
            Thread not found
          </Typography>
          <Button onClick={() => navigate("/discussions")} sx={{ mt: 2 }}>
            Back to Discussions
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4, px: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/discussions")}
          >
            Back to Discussions
          </Button>

          {(isAuthor(thread.authorName) || isAdmin()) && (
            <Box>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {isAdmin() && (
                  <MenuItem onClick={handlePinThread}>
                    <PushPin sx={{ mr: 1 }} />
                    {thread.isPinned ? "Unpin" : "Pin"} Thread
                  </MenuItem>
                )}
                {isAdmin() && (
                  <MenuItem onClick={handleLockThread}>
                    <Lock sx={{ mr: 1 }} />
                    {thread.isLocked ? "Unlock" : "Lock"} Thread
                  </MenuItem>
                )}
                {(isAuthor(thread.authorName) || isAdmin()) && (
                  <MenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ color: "error.main" }}
                  >
                    <Delete sx={{ mr: 1 }} />
                    Delete Thread
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Box>

        {/* Two Column Layout */}
        <Box
          sx={{ display: "flex", gap: 4, height: "calc(100vh - 200px)", ml: 2 }}
        >
          {/* Left Column - Thread Content and Reply Form */}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", pl: 2 }}
          >
            {/* Thread Content */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                {thread.isPinned && (
                  <PushPin sx={{ fontSize: 20, color: "#bb86fc" }} />
                )}
                {thread.isLocked && (
                  <Lock sx={{ fontSize: 20, color: "#f44336" }} />
                )}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: thread.isPinned ? "#bb86fc" : "text.primary",
                  }}
                >
                  {thread.title}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <Chip
                  label={thread.course}
                  size="small"
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
                  sx={{
                    borderColor: "rgba(3, 218, 198, 0.3)",
                    color: "#03dac6",
                  }}
                />
              </Box>

              <Typography
                variant="body1"
                sx={{ mb: 4, whiteSpace: "pre-wrap", lineHeight: 1.7 }}
              >
                {thread.content}
              </Typography>
            </Box>

            {/* Reply Form */}
            {!thread.isLocked && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {parentReplyId ? "Reply to comment" : "Add a reply"}
                  </Typography>
                  {parentReplyId && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Replying to a comment.
                      <Button
                        size="small"
                        onClick={() => {
                          setParentReplyId(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Alert>
                  )}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      endIcon={<Send />}
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                    >
                      Post Reply
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {thread.isLocked && (
              <Alert severity="warning" sx={{ mb: 4 }}>
                This thread is locked. No new replies can be added.
              </Alert>
            )}
          </Box>

          {/* Right Column - Replies Section */}
          <Box
            sx={{
              width: "500px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Replies ({thread.replyCount})
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 3,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(187, 134, 252, 0.5)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(187, 134, 252, 0.7)",
                },
              }}
            >
              {repliesLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width={200} />
                          <Skeleton variant="text" width={100} />
                        </Box>
                      </Box>
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                ))
              ) : replies.length === 0 ? (
                <Card sx={{ textAlign: "center", py: 6 }}>
                  <CardContent>
                    <Reply
                      sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No replies yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Be the first to reply to this thread!
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {replies.map((reply) => (
                    <ReplyCard key={reply.id} reply={reply} />
                  ))}

                  {totalReplyPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalReplyPages}
                        page={replyPage + 1}
                        onChange={(_, newPage) => setReplyPage(newPage - 1)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Delete Thread Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Thread</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this thread? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteThread}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ThreadDetail;
