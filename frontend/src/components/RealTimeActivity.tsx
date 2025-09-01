import {
  Add,
  Clear,
  Delete,
  Lock,
  PushPin,
  Reply,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  DISCUSSION_EVENTS,
  discussionWS,
} from "../services/discussionWebSocket";

interface RealTimeActivityProps {
  maxItems?: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  data?: any;
}

const RealTimeActivity: React.FC<RealTimeActivityProps> = ({
  maxItems = 50,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const addActivity = (type: string, message: string, data?: any) => {
      const activity: ActivityItem = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
        data,
      };

      setActivities((prev) => [activity, ...prev.slice(0, maxItems - 1)]);
    };

    // Subscribe to all real-time events
    const unsubscribers = [
      discussionWS.on(DISCUSSION_EVENTS.THREAD_CREATED, (data) => {
        addActivity(
          "THREAD_CREATED",
          `New thread: "${data.title}" by ${data.authorName}`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.THREAD_UPDATED, (data) => {
        addActivity("THREAD_UPDATED", `Thread updated: "${data.title}"`, data);
      }),

      discussionWS.on(DISCUSSION_EVENTS.THREAD_DELETED, (data) => {
        addActivity(
          "THREAD_DELETED",
          `Thread deleted (ID: ${data.threadId || data.id})`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.REPLY_CREATED, (data) => {
        addActivity(
          "REPLY_CREATED",
          `New reply by ${data.authorName} on thread ${data.threadId}`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.REPLY_UPDATED, (data) => {
        addActivity(
          "REPLY_UPDATED",
          `Reply updated by ${data.authorName}`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.REPLY_DELETED, (data) => {
        addActivity(
          "REPLY_DELETED",
          `Reply deleted (ID: ${data.replyId})`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.THREAD_PINNED, (data) => {
        addActivity(
          "THREAD_PINNED",
          `Thread ${data.isPinned ? "pinned" : "unpinned"}: "${data.title}"`,
          data
        );
      }),

      discussionWS.on(DISCUSSION_EVENTS.THREAD_LOCKED, (data) => {
        addActivity(
          "THREAD_LOCKED",
          `Thread ${data.isLocked ? "locked" : "unlocked"}: "${data.title}"`,
          data
        );
      }),
    ];

    // Add initial connection status
    addActivity("SYSTEM", "Real-time activity monitor started");

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [maxItems]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "THREAD_CREATED":
        return <Add color="success" />;
      case "THREAD_UPDATED":
        return <Add color="info" />;
      case "THREAD_DELETED":
        return <Delete color="error" />;
      case "REPLY_CREATED":
        return <Reply color="success" />;
      case "REPLY_UPDATED":
        return <Reply color="info" />;
      case "REPLY_DELETED":
        return <Delete color="error" />;
      case "THREAD_PINNED":
        return <PushPin color="warning" />;
      case "THREAD_LOCKED":
        return <Lock color="warning" />;
      default:
        return <Visibility color="action" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "THREAD_CREATED":
      case "REPLY_CREATED":
        return "success";
      case "THREAD_UPDATED":
      case "REPLY_UPDATED":
        return "info";
      case "THREAD_DELETED":
      case "REPLY_DELETED":
        return "error";
      case "THREAD_PINNED":
      case "THREAD_LOCKED":
        return "warning";
      default:
        return "default";
    }
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          🔴 Real-time Activity Log
          <Chip
            label={activities.length}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Typography>
        <Box>
          <IconButton size="small" onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
          <IconButton size="small" onClick={clearActivities}>
            <Clear />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isVisible}>
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {activities.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: "center" }}
            >
              No real-time events yet. Try creating a thread or reply in another
              tab!
            </Typography>
          ) : (
            <List dense>
              {activities.map((activity) => (
                <ListItem key={activity.id} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2">
                          {activity.message}
                        </Typography>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={activity.timestamp.toLocaleTimeString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default RealTimeActivity;
