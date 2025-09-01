import { Add, Reply, Send } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";

interface WebSocketTestPanelProps {
  threadId?: number;
}

const WebSocketTestPanel: React.FC<WebSocketTestPanelProps> = ({
  threadId,
}) => {
  const triggerTest = async (endpoint: string, params?: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const url = new URL(`http://localhost:8080/test/websocket/${endpoint}`);
      if (params) {
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧪 WebSocket Test Panel
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use these buttons to manually trigger WebSocket events and verify
        real-time updates
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => triggerTest("thread-created")}
          color="success"
        >
          Test Thread Created
        </Button>

        {threadId && (
          <Button
            variant="outlined"
            startIcon={<Reply />}
            onClick={() => triggerTest("reply-created", { threadId })}
            color="info"
          >
            Test Reply Created
          </Button>
        )}

        {threadId && (
          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => triggerTest("thread-deleted", { threadId })}
            color="error"
          >
            Test Thread Deleted
          </Button>
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        These are test events only - they won't create real threads/replies in
        the database
      </Typography>
    </Paper>
  );
};

export default WebSocketTestPanel;
