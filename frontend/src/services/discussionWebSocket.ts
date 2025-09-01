import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// WebSocket service for real-time discussion updates
class DiscussionWebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private subscriptions: Map<string, any> = new Map();

  connect(token: string) {
    if (this.client && this.client.connected) {
      return;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/api/ws"),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log("🔌 Discussion WebSocket connected");
        this.reconnectAttempts = 0;
        this.setupSubscriptions();
      };

      this.client.onDisconnect = () => {
        console.log("🔌 Discussion WebSocket disconnected");
        this.attemptReconnect(token);
      };

      this.client.onStompError = (frame) => {
        console.error("STOMP Error:", frame);
        this.attemptReconnect(token);
      };

      this.client.activate();
    } catch (error) {
      console.error("Failed to connect to Discussion WebSocket:", error);
      this.attemptReconnect(token);
    }
  }

  private setupSubscriptions() {
    if (!this.client || !this.client.connected) return;

    console.log("🔌 Setting up WebSocket subscriptions...");

    // Subscribe to general discussion updates
    const generalSub = this.client.subscribe(
      "/topic/discussions",
      (message) => {
        try {
          console.log("📨 Received WebSocket message:", message.body);
          const data = JSON.parse(message.body);
          console.log("📨 Parsed WebSocket data:", data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      }
    );
    this.subscriptions.set("general", generalSub);
    console.log("✅ Subscribed to /topic/discussions");
  }

  subscribeToThread(threadId: number) {
    if (!this.client || !this.client.connected) return;

    const topicKey = `thread-${threadId}`;
    if (this.subscriptions.has(topicKey)) return;

    const threadSub = this.client.subscribe(
      `/topic/discussions/thread/${threadId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          this.handleMessage(data);
        } catch (error) {
          console.error("Failed to parse thread WebSocket message:", error);
        }
      }
    );
    this.subscriptions.set(topicKey, threadSub);
  }

  unsubscribeFromThread(threadId: number) {
    const topicKey = `thread-${threadId}`;
    const subscription = this.subscriptions.get(topicKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topicKey);
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect(token);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    console.log("🎯 Handling WebSocket event:", type, payload);

    // Notify all listeners for this event type
    const eventListeners = this.listeners.get(type) || [];
    console.log(
      `📢 Found ${eventListeners.length} listeners for event: ${type}`
    );
    eventListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error("Error in WebSocket event listener:", error);
      }
    });
  }

  // Subscribe to specific event types
  on(eventType: string, callback: (data: any) => void) {
    console.log(`🎧 Registering listener for event: ${eventType}`);
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
          console.log(`🔇 Unregistered listener for event: ${eventType}`);
        }
      }
    };
  }

  // Send message to server
  send(destination: string, payload: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(payload),
      });
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.client ? this.client.connected : false;
  }

  // Get connection statistics for debugging
  getStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      activeSubscriptions: this.subscriptions.size,
      activeListeners: Array.from(this.listeners.entries()).reduce(
        (total, [, listeners]) => total + listeners.length,
        0
      ),
    };
  }
}

// Singleton instance
export const discussionWS = new DiscussionWebSocketService();

// Event types for discussions
export const DISCUSSION_EVENTS = {
  THREAD_CREATED: "thread_created",
  THREAD_UPDATED: "thread_updated",
  THREAD_DELETED: "thread_deleted",
  REPLY_CREATED: "reply_created",
  REPLY_UPDATED: "reply_updated",
  REPLY_DELETED: "reply_deleted",
  THREAD_PINNED: "thread_pinned",
  THREAD_LOCKED: "thread_locked",
} as const;

export type DiscussionEventType =
  (typeof DISCUSSION_EVENTS)[keyof typeof DISCUSSION_EVENTS];
