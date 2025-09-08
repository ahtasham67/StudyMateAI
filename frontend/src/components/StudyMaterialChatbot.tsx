import {
  AutoFixHigh,
  Chat,
  Close,
  Send,
  Summarize,
  Topic,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardHeader,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { chatbotAPI } from "../services/api";

interface StudyMaterial {
  id: number;
  fileName: string;
  originalName: string;
  fileType: "PDF" | "PPTX" | "PPT";
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  description?: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  messageType?: "summary" | "topics" | "answer" | "question";
}

interface StudyMaterialChatbotProps {
  open: boolean;
  onClose: () => void;
  selectedMaterial: StudyMaterial | null;
  materials: StudyMaterial[];
}

interface MaterialCache {
  materialId: number;
  content: string;
  tokens: any[];
  timestamp: Date;
  summary?: string;
  topics?: string[];
}

// Enhanced text formatting function for AI responses
const renderFormattedLine = (line: string, message: ChatMessage) => {
  const getThemeColor = (messageType?: string) => {
    switch (messageType) {
      case "summary":
        return "#ff6b35";
      case "topics":
        return "#4caf50";
      default:
        return "#2196f3";
    }
  };

  const themeColor = getThemeColor(message.messageType);

  // Handle bullet points
  if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            color: themeColor,
            mr: 1,
            mt: "2px",
            fontSize: "0.8rem",
          }}
        >
          ▸
        </Box>
        <Box>{parseInlineFormatting(line.replace(/^[•-]\s*/, ""))}</Box>
      </Box>
    );
  }

  // Handle numbered lists
  if (/^\d+\./.test(line.trim())) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            color: themeColor,
            mr: 1,
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {line.match(/^\d+/)?.[0]}.
        </Box>
        <Box>{parseInlineFormatting(line.replace(/^\d+\.\s*/, ""))}</Box>
      </Box>
    );
  }

  // Handle headers (lines starting with #)
  if (line.trim().startsWith("##")) {
    return (
      <Typography
        variant="h6"
        sx={{
          color: themeColor,
          fontWeight: 700,
          fontSize: "1.1rem",
          mb: 1,
          mt: 1.5,
        }}
      >
        {parseInlineFormatting(line.replace(/^#+\s*/, ""))}
      </Typography>
    );
  }

  if (line.trim().startsWith("#")) {
    return (
      <Typography
        variant="h5"
        sx={{
          color: themeColor,
          fontWeight: 700,
          fontSize: "1.2rem",
          mb: 1,
          mt: 2,
        }}
      >
        {parseInlineFormatting(line.replace(/^#+\s*/, ""))}
      </Typography>
    );
  }

  // Handle code blocks (lines starting with ```)
  if (line.trim().startsWith("```")) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(0,0,0,0.3)",
          p: 1.5,
          borderRadius: "8px",
          border: `1px solid ${themeColor}`,
          fontFamily: "monospace",
          fontSize: "0.85rem",
          color: "#e0e0e0",
          my: 1,
          overflow: "auto",
        }}
      >
        {line.replace(/```/g, "")}
      </Box>
    );
  }

  // Regular text with inline formatting
  return <span>{parseInlineFormatting(line)}</span>;
};

// Parse inline formatting like **bold**, *italic*, `code`
const parseInlineFormatting = (text: string) => {
  if (!text) return text;

  const parts: React.ReactNode[] = [];
  let remainingText = text;
  let key = 0;

  while (remainingText.length > 0) {
    // Bold text **text**
    const boldMatch = remainingText.match(/\*\*(.*?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before bold
      if (boldMatch.index > 0) {
        parts.push(remainingText.substring(0, boldMatch.index));
      }
      // Add bold text
      parts.push(
        <span key={key++} style={{ fontWeight: 700, color: "#ffffff" }}>
          {boldMatch[1]}
        </span>
      );
      remainingText = remainingText.substring(
        boldMatch.index + boldMatch[0].length
      );
      continue;
    }

    // Italic text *text*
    const italicMatch = remainingText.match(/\*(.*?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      // Add text before italic
      if (italicMatch.index > 0) {
        parts.push(remainingText.substring(0, italicMatch.index));
      }
      // Add italic text
      parts.push(
        <span key={key++} style={{ fontStyle: "italic", color: "#e3f2fd" }}>
          {italicMatch[1]}
        </span>
      );
      remainingText = remainingText.substring(
        italicMatch.index + italicMatch[0].length
      );
      continue;
    }

    // Code text `text`
    const codeMatch = remainingText.match(/`(.*?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      // Add text before code
      if (codeMatch.index > 0) {
        parts.push(remainingText.substring(0, codeMatch.index));
      }
      // Add code text
      parts.push(
        <span
          key={key++}
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "0.9em",
            color: "#ffeb3b",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {codeMatch[1]}
        </span>
      );
      remainingText = remainingText.substring(
        codeMatch.index + codeMatch[0].length
      );
      continue;
    }

    // No more formatting found, add remaining text
    parts.push(remainingText);
    break;
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
};

const StudyMaterialChatbot: React.FC<StudyMaterialChatbotProps> = ({
  open,
  onClose,
  selectedMaterial,
  materials,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialCache, setMaterialCache] = useState<MaterialCache | null>(
    null
  );
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Additional effect to ensure scroll after message updates
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (open && selectedMaterial) {
      // Check if we need to load/cache material content
      if (!materialCache || materialCache.materialId !== selectedMaterial.id) {
        loadAndCacheMaterial(selectedMaterial);
      }

      // Add welcome message when chatbot opens with a material (no conversation history)
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        type: "bot",
        content: `Hi! I'm here to help you with "${selectedMaterial.originalName}". You can ask me questions about the content, request a summary, or get key topics. How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open, selectedMaterial, materialCache]);

  useEffect(() => {
    // Clear cache when chatbot closes
    if (!open && materialCache) {
      console.log(`Clearing cache for material ${materialCache.materialId}`);
      setMaterialCache(null);
      setMessages([]);
    }
  }, [open, materialCache]);

  const loadAndCacheMaterial = async (material: StudyMaterial) => {
    try {
      setIsCacheLoading(true);
      setError(null);

      console.log(
        `Loading and caching content for material ${material.id}: ${material.originalName}`
      );

      // Call backend to extract and process content
      const response = await chatbotAPI.loadMaterialContent(material.id);

      const cache: MaterialCache = {
        materialId: material.id,
        content: response.data.content,
        tokens: response.data.tokens || [],
        timestamp: new Date(),
        summary: response.data.summary,
        topics: response.data.topics,
      };

      setMaterialCache(cache);
      console.log(
        `Material ${material.id} cached successfully. Content length: ${cache.content.length} chars`
      );
    } catch (error) {
      console.error("Error loading material content:", error);
      setError("Failed to load material content. Please try again.");
    } finally {
      setIsCacheLoading(false);
    }
  };

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    console.log(
      "Adding message:",
      newMessage.type,
      newMessage.content.substring(0, 50)
    );
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      console.log("Messages updated, total count:", updated.length);
      // Trigger scroll after state update
      setTimeout(scrollToBottom, 50);
      return updated;
    });
  };

  const getConversationHistory = (): string => {
    // Return formatted conversation history for context
    return messages
      .map(
        (msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");
  };

  const handleGenerateSummary = async () => {
    if (!selectedMaterial) return;

    setIsLoading(true);
    setError(null);

    // Add user request to conversation history
    addMessage({
      type: "user",
      content: "Generate a summary of this material",
      messageType: "question",
    });

    // Small delay to ensure the user message is rendered before async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      let summaryContent = "";

      // Check if we have cached summary
      if (
        materialCache &&
        materialCache.materialId === selectedMaterial.id &&
        materialCache.summary
      ) {
        console.log("Using cached summary for material", selectedMaterial.id);
        summaryContent = materialCache.summary;
      } else {
        // Generate new summary and update cache
        console.log("Generating new summary for material", selectedMaterial.id);
        const response = await chatbotAPI.generateSummary(selectedMaterial.id);
        summaryContent = response.data.response;

        // Update cache with new summary
        if (materialCache && materialCache.materialId === selectedMaterial.id) {
          setMaterialCache({
            ...materialCache,
            summary: summaryContent,
          });
        }
      }

      // Add bot response to conversation history
      addMessage({
        type: "bot",
        content: summaryContent,
        messageType: "summary",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data || "Failed to generate summary";
      setError(errorMessage);
      addMessage({
        type: "bot",
        content: `Sorry, I couldn't generate a summary. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTopics = async () => {
    if (!selectedMaterial) return;

    setIsLoading(true);
    setError(null);

    // Add user request to conversation history
    addMessage({
      type: "user",
      content: "Show me the key topics and concepts",
      messageType: "question",
    });

    // Small delay to ensure the user message is rendered before async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      let topicsContent = "";

      // Check if we have cached topics
      if (
        materialCache &&
        materialCache.materialId === selectedMaterial.id &&
        materialCache.topics
      ) {
        console.log("Using cached topics for material", selectedMaterial.id);
        topicsContent = Array.isArray(materialCache.topics)
          ? "• " + materialCache.topics.join("\n• ")
          : "• " + String(materialCache.topics);
      } else {
        // Generate new topics and update cache
        console.log("Generating new topics for material", selectedMaterial.id);
        const response = await chatbotAPI.generateTopics(selectedMaterial.id);
        topicsContent = response.data.response;

        // Update cache with new topics
        if (materialCache && materialCache.materialId === selectedMaterial.id) {
          setMaterialCache({
            ...materialCache,
            topics: topicsContent.split("\n").filter((line) => line.trim()),
          });
        }
      }

      // Add bot response to conversation history
      addMessage({
        type: "bot",
        content: topicsContent,
        messageType: "topics",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data || "Failed to generate topics";
      setError(errorMessage);
      addMessage({
        type: "bot",
        content: `Sorry, I couldn't generate key topics. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedMaterial || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Add user message to conversation history
    addMessage({
      type: "user",
      content: userMessage,
      messageType: "question",
    });

    try {
      // Enhanced request with cached context
      const requestData = {
        materialId: selectedMaterial.id,
        question: userMessage,
        conversationHistory: getConversationHistory(),
        useCachedContent: !!(
          materialCache && materialCache.materialId === selectedMaterial.id
        ),
        cacheTimestamp: materialCache?.timestamp?.toISOString(),
      };

      console.log("Sending question with cached context:", {
        materialId: selectedMaterial.id,
        useCachedContent: requestData.useCachedContent,
        cacheAge: materialCache
          ? Date.now() - materialCache.timestamp.getTime()
          : 0,
      });

      const response = await chatbotAPI.askQuestion(requestData);

      // Add bot response to conversation history
      addMessage({
        type: "bot",
        content: response.data.response,
        messageType: "answer",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data || "Failed to get answer";
      setError(errorMessage);
      addMessage({
        type: "bot",
        content: `Sorry, I couldn't answer your question. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 450 },
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          backdropFilter: "blur(10px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "rgba(0,0,0,0.2)",
          backdropFilter: "blur(5px)",
        }}
      >
        {/* Header */}
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              <AutoFixHigh />
            </Avatar>
          }
          title="Study Material Assistant"
          subheader={
            selectedMaterial
              ? `Analyzing: ${selectedMaterial.originalName}`
              : "Select a material to start"
          }
          action={
            <IconButton
              onClick={onClose}
              sx={{
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Close />
            </IconButton>
          }
          sx={{
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            "& .MuiCardHeader-title": {
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "1.2rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            },
            "& .MuiCardHeader-subheader": {
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            },
          }}
        />

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Cache Loading Indicator */}
        {isCacheLoading && (
          <Alert severity="info" sx={{ m: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                Loading and caching material content...
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Quick Actions */}
        {selectedMaterial && (
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(5px)",
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                color: "#ffffff",
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                marginBottom: 1.5,
              }}
            >
              Quick Actions:
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Summarize />}
                onClick={handleGenerateSummary}
                disabled={isLoading}
                sx={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.3)",
                  backgroundColor: "rgba(255,107,53,0.2)",
                  backdropFilter: "blur(5px)",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(255,107,53,0.2)",
                  "&:hover": {
                    borderColor: "rgba(255,107,53,0.8)",
                    backgroundColor: "rgba(255,107,53,0.3)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
                  },
                  "&:disabled": {
                    color: "rgba(255,255,255,0.5)",
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Summary
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Topic />}
                onClick={handleGenerateTopics}
                disabled={isLoading}
                sx={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.3)",
                  backgroundColor: "rgba(76,175,80,0.2)",
                  backdropFilter: "blur(5px)",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(76,175,80,0.2)",
                  "&:hover": {
                    borderColor: "rgba(76,175,80,0.8)",
                    backgroundColor: "rgba(76,175,80,0.3)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
                  },
                  "&:disabled": {
                    color: "rgba(255,255,255,0.5)",
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Key Topics
              </Button>
            </Box>
          </Box>
        )}

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2,
            backgroundColor: "rgba(0,0,0,0.1)",
            backdropFilter: "blur(5px)",
            background: `
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(255,255,255,0.01) 51px,
              rgba(255,255,255,0.01) 52px
            )
          `,
          }}
        >
          {!selectedMaterial ? (
            <Box
              sx={{
                textAlign: "center",
                mt: 8,
                p: 4,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <Chat
                sx={{
                  fontSize: 64,
                  color: "rgba(255,255,255,0.6)",
                  mb: 3,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  color: "#ffffff",
                  fontWeight: 700,
                  mb: 2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Select a Study Material
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                Choose a material from your library to start an intelligent
                conversation about its content.
              </Typography>
            </Box>
          ) : (
            <List sx={{ px: 1 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: "column",
                    alignItems:
                      message.type === "user" ? "flex-end" : "flex-start",
                    pb: 3,
                    px: 1,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      maxWidth: "85%",
                      minWidth: "200px",
                      background:
                        message.type === "user"
                          ? "linear-gradient(135deg, rgba(33,150,243,0.9) 0%, rgba(21,101,192,0.9) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(15px)",
                      border:
                        message.type === "user"
                          ? "1px solid rgba(33,150,243,0.3)"
                          : "1px solid rgba(255,255,255,0.2)",
                      borderRadius:
                        message.type === "user"
                          ? "20px 20px 6px 20px"
                          : "20px 20px 20px 6px",
                      position: "relative",
                      transition: "all 0.3s ease-in-out",
                      boxShadow:
                        message.type === "user"
                          ? "0 8px 32px rgba(33,150,243,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                          : "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                      "&:hover": {
                        transform: "translateY(-2px) scale(1.02)",
                        boxShadow:
                          message.type === "user"
                            ? "0 12px 40px rgba(33,150,243,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
                            : "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                      },
                      "&::before":
                        message.type === "bot" &&
                        message.messageType === "summary"
                          ? {
                              content: '""',
                              position: "absolute",
                              left: "-4px",
                              top: "12px",
                              bottom: "12px",
                              width: "4px",
                              background:
                                "linear-gradient(180deg, #ff6b35 0%, #f7931e 100%)",
                              borderRadius: "4px",
                              boxShadow: "0 0 12px rgba(255,107,53,0.6)",
                            }
                          : message.type === "bot" &&
                            message.messageType === "topics"
                          ? {
                              content: '""',
                              position: "absolute",
                              left: "-4px",
                              top: "12px",
                              bottom: "12px",
                              width: "4px",
                              background:
                                "linear-gradient(180deg, #4caf50 0%, #2e7d32 100%)",
                              borderRadius: "4px",
                              boxShadow: "0 0 12px rgba(76,175,80,0.6)",
                            }
                          : message.type === "bot" &&
                            message.messageType === "answer"
                          ? {
                              content: '""',
                              position: "absolute",
                              left: "-4px",
                              top: "12px",
                              bottom: "12px",
                              width: "4px",
                              background:
                                "linear-gradient(180deg, #2196f3 0%, #1565c0 100%)",
                              borderRadius: "4px",
                              boxShadow: "0 0 12px rgba(33,150,243,0.6)",
                            }
                          : {},
                    }}
                  >
                    {/* Message Type Header for Bot Messages */}
                    {message.messageType && message.type === "bot" && (
                      <Box
                        sx={{
                          mb: 2,
                          pb: 1,
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              message.messageType === "summary"
                                ? "#ff6b35"
                                : message.messageType === "topics"
                                ? "#4caf50"
                                : "#2196f3",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#e0e0e0",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}
                        >
                          {message.messageType === "summary"
                            ? "📄 AI Summary"
                            : message.messageType === "topics"
                            ? "🎯 Key Topics"
                            : "💬 AI Answer"}
                        </Typography>
                      </Box>
                    )}

                    {/* Message Content */}
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        color: "#ffffff",
                        fontWeight: message.type === "bot" ? 400 : 500,
                        fontSize: message.type === "bot" ? "0.95rem" : "0.9rem",
                        lineHeight: message.type === "bot" ? 1.6 : 1.5,
                        fontFamily:
                          message.type === "bot"
                            ? "'Inter', sans-serif"
                            : "inherit",
                        "& strong": {
                          fontWeight: 600,
                          color: "#fff",
                        },
                        "& em": {
                          fontStyle: "italic",
                          color: "#e3f2fd",
                        },
                      }}
                    >
                      {message.content.split("\n").map((line, index) => {
                        return (
                          <React.Fragment key={index}>
                            {renderFormattedLine(line, message)}
                            {index < message.content.split("\n").length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Typography>

                    {/* Enhanced Message Type Chip */}
                    {message.messageType && message.type === "bot" && (
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Chip
                          size="small"
                          label={
                            message.messageType === "summary"
                              ? "Summary"
                              : message.messageType === "topics"
                              ? "Topics"
                              : "Answer"
                          }
                          sx={{
                            bgcolor:
                              message.messageType === "summary"
                                ? "rgba(255, 107, 53, 0.2)"
                                : message.messageType === "topics"
                                ? "rgba(76, 175, 80, 0.2)"
                                : "rgba(33, 150, 243, 0.2)",
                            color:
                              message.messageType === "summary"
                                ? "#ff6b35"
                                : message.messageType === "topics"
                                ? "#4caf50"
                                : "#2196f3",
                            border: `1px solid ${
                              message.messageType === "summary"
                                ? "#ff6b35"
                                : message.messageType === "topics"
                                ? "#4caf50"
                                : "#2196f3"
                            }`,
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            height: "24px",
                          }}
                        />
                      </Box>
                    )}
                  </Paper>

                  {/* Enhanced Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: "#888",
                      fontSize: "0.7rem",
                      fontWeight: 400,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ px: 1, pb: 3 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      maxWidth: "85%",
                      minWidth: "200px",
                      background:
                        "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)",
                      color: "#ffffff",
                      border: "1px solid #444",
                      borderRadius: "18px 18px 18px 4px",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: "-3px",
                        top: "0",
                        bottom: "0",
                        width: "3px",
                        background:
                          "linear-gradient(180deg, #9c27b0 0%, #6a1b9a 100%)",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {/* Loading Header */}
                    <Box
                      sx={{
                        mb: 2,
                        pb: 1,
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#9c27b0",
                          animation: "pulse 1.5s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%": {
                              opacity: 1,
                              transform: "scale(1)",
                            },
                            "50%": {
                              opacity: 0.5,
                              transform: "scale(1.2)",
                            },
                            "100%": {
                              opacity: 1,
                              transform: "scale(1)",
                            },
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#e0e0e0",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                        }}
                      >
                        🤖 AI Processing
                      </Typography>
                    </Box>

                    {/* Loading Progress */}
                    <Box sx={{ width: "100%", mb: 2 }}>
                      <LinearProgress
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          "& .MuiLinearProgress-bar": {
                            background:
                              "linear-gradient(90deg, #9c27b0 0%, #e91e63 50%, #ff9800 100%)",
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Loading Text with Animation */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#e0e0e0",
                        fontStyle: "italic",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        animation: "fadeInOut 2s ease-in-out infinite",
                        "@keyframes fadeInOut": {
                          "0%": { opacity: 0.6 },
                          "50%": { opacity: 1 },
                          "100%": { opacity: 0.6 },
                        },
                      }}
                    >
                      AI is analyzing your content and generating a thoughtful
                      response...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        {/* Enhanced Input Section */}
        {selectedMaterial && (
          <Box
            sx={{
              p: 3,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(20px)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                placeholder="Ask a question about this material..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                multiline
                maxRows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease-in-out",
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderColor: "rgba(255,255,255,0.3)",
                      transform: "translateY(-1px)",
                      boxShadow:
                        "0 6px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderColor: "rgba(33,150,243,0.6)",
                      boxShadow:
                        "0 0 0 3px rgba(33,150,243,0.2), 0 8px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.4)",
                      borderColor: "rgba(255,255,255,0.1)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                    fontWeight: 400,
                    lineHeight: 1.5,
                    "&::placeholder": {
                      color: "rgba(255,255,255,0.6)",
                      opacity: 1,
                      fontStyle: "italic",
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #1565c0 100%)",
                  color: "#ffffff",
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  border: "1px solid rgba(33,150,243,0.3)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease-in-out",
                  boxShadow:
                    "0 4px 15px rgba(33,150,243,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                    transform: "translateY(-2px) scale(1.05)",
                    boxShadow:
                      "0 8px 25px rgba(33,150,243,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                    borderColor: "rgba(33,150,243,0.6)",
                  },
                  "&:active": {
                    transform: "translateY(-1px) scale(1.02)",
                  },
                  "&:disabled": {
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)",
                    transform: "none",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Send sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Box>

            {/* Input Helper Text */}
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.7rem",
                display: "block",
                textAlign: "center",
              }}
            >
              Press Enter to send • Shift+Enter for new line
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default StudyMaterialChatbot;
