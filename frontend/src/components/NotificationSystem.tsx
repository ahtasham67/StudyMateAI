import {
  Close as CloseIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Slide,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { createContext, useCallback, useContext, useState } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  }>;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, "id">) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

function SlideTransition(props: any) {
  return <Slide {...props} direction="down" />;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback(
    (notification: Omit<NotificationData, "id">) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: NotificationData = {
        id,
        duration: 6000,
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-hide non-persistent notifications
      if (
        !newNotification.persistent &&
        newNotification.duration &&
        newNotification.duration > 0
      ) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, newNotification.duration);
      }
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <SuccessIcon sx={{ fontSize: 20 }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 20 }} />;
      case "info":
        return <InfoIcon sx={{ fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getSeverity = (type: NotificationType) => {
    return type;
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification, clearAll }}
    >
      {children}

      {/* Notification Stack */}
      <Box
        sx={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: 400,
          width: "100%",
        }}
      >
        {notifications.map((notification, index) => (
          <Snackbar
            key={notification.id}
            open={true}
            TransitionComponent={SlideTransition}
            sx={{
              position: "relative",
              width: "100%",
              transform: `translateY(${index * 10}px)`,
              transition: "all 0.3s ease",
            }}
          >
            <Alert
              severity={getSeverity(notification.type)}
              icon={getIcon(notification.type)}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => hideNotification(notification.id)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{
                width: "100%",
                background:
                  notification.type === "success"
                    ? "linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(129, 199, 132, 0.9) 100%)"
                    : notification.type === "error"
                    ? "linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(255, 138, 128, 0.9) 100%)"
                    : notification.type === "warning"
                    ? "linear-gradient(135deg, rgba(255, 152, 0, 0.9) 0%, rgba(255, 204, 128, 0.9) 100%)"
                    : "linear-gradient(135deg, rgba(33, 150, 243, 0.9) 0%, rgba(144, 202, 249, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
                color: "#ffffff",
                "& .MuiAlert-icon": {
                  color: "#ffffff",
                },
                "& .MuiAlert-action": {
                  color: "#ffffff",
                },
              }}
            >
              {notification.title && (
                <AlertTitle sx={{ fontWeight: 600, marginBottom: 0.5 }}>
                  {notification.title}
                </AlertTitle>
              )}
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {notification.message}
              </Typography>

              {notification.actions && notification.actions.length > 0 && (
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  {notification.actions.map((action, actionIndex) => (
                    <IconButton
                      key={actionIndex}
                      size="small"
                      onClick={() => {
                        action.onClick();
                        hideNotification(notification.id);
                      }}
                      sx={{
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      {action.label}
                    </IconButton>
                  ))}
                </Box>
              )}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

// Helper hooks for common notification types
export const useNotificationHelpers = () => {
  const { showNotification } = useNotification();

  const showSuccess = useCallback(
    (message: string, title?: string, options?: Partial<NotificationData>) => {
      showNotification({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string, options?: Partial<NotificationData>) => {
      showNotification({
        type: "error",
        title,
        message,
        duration: 8000, // Longer duration for errors
        ...options,
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string, options?: Partial<NotificationData>) => {
      showNotification({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string, options?: Partial<NotificationData>) => {
      showNotification({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
