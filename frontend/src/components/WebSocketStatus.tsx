import { Sync, Wifi, WifiOff } from "@mui/icons-material";
import { Box, Chip, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  DISCUSSION_EVENTS,
  discussionWS,
} from "../services/discussionWebSocket";

interface WebSocketStatusProps {
  showText?: boolean;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showText = false,
}) => {
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Check initial connection status
    const checkStatus = () => {
      const isConnected = discussionWS.isConnected();
      const currentStats = discussionWS.getStats();

      setStats(currentStats);

      if (isConnected) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    };

    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);

    // Listen for any WebSocket events to track activity
    const handleAnyEvent = () => {
      setLastUpdate(new Date());
    };

    // Subscribe to all discussion events to track activity
    const unsubscribers = [
      discussionWS.on(DISCUSSION_EVENTS.THREAD_CREATED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.THREAD_UPDATED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.THREAD_DELETED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.REPLY_CREATED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.REPLY_UPDATED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.REPLY_DELETED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.THREAD_PINNED, handleAnyEvent),
      discussionWS.on(DISCUSSION_EVENTS.THREAD_LOCKED, handleAnyEvent),
    ];

    // Initial check
    checkStatus();

    return () => {
      clearInterval(interval);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      case "disconnected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Wifi sx={{ fontSize: 16 }} />;
      case "connecting":
        return <Sync sx={{ fontSize: 16 }} className="animate-spin" />;
      case "disconnected":
        return <WifiOff sx={{ fontSize: 16 }} />;
      default:
        return <WifiOff sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Real-time updates active";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Real-time updates offline";
      default:
        return "Unknown status";
    }
  };

  const getTooltipText = () => {
    let text = getStatusText();
    if (lastUpdate && status === "connected") {
      text += `\nLast update: ${lastUpdate.toLocaleTimeString()}`;
    }
    if (stats) {
      text += `\nSubscriptions: ${stats.activeSubscriptions}`;
      text += `\nListeners: ${stats.activeListeners}`;
      if (stats.reconnectAttempts > 0) {
        text += `\nReconnect attempts: ${stats.reconnectAttempts}`;
      }
    }
    return text;
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Chip
          icon={getStatusIcon()}
          label={showText ? getStatusText() : undefined}
          color={getStatusColor() as any}
          size="small"
          variant={status === "connected" ? "filled" : "outlined"}
          sx={{
            "& .MuiChip-icon": {
              marginLeft: showText ? 1 : 0,
              marginRight: showText ? 0.5 : 0,
            },
            minWidth: showText ? "auto" : 32,
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default WebSocketStatus;
