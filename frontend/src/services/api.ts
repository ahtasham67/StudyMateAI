import axios, { AxiosResponse } from "axios";
import {
  AuthResponse,
  CoursesResponse,
  CreateReplyRequest,
  CreateThreadRequest,
  DiscussionThread,
  KnowledgeEntity,
  KnowledgeSummary,
  LoginRequest,
  Note,
  ProfileUpdateRequest,
  RegisterRequest,
  StudySession,
  StudySessionStats,
  ThreadReply,
  ThreadsResponse,
  TopicsResponse,
  User,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Success: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.status
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data,
        }
      );
    }

    // Handle different error types
    if (error.response?.status === 401) {
      console.warn("🔐 Session expired, redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.warn("🚫 Access forbidden");
    } else if (error.response?.status >= 500) {
      console.error("🔥 Server error detected");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/auth/signin", credentials),

  register: (userData: RegisterRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/auth/signup", userData),

  getCurrentUser: (): Promise<AxiosResponse<User>> => api.get("/auth/me"),
};

// Study Sessions API
export const studySessionAPI = {
  getAll: (): Promise<AxiosResponse<StudySession[]>> =>
    api.get("/study-sessions"),

  getById: (id: number): Promise<AxiosResponse<StudySession>> =>
    api.get(`/study-sessions/${id}`),

  create: (
    session: Omit<StudySession, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<AxiosResponse<StudySession>> =>
    api.post("/study-sessions", session),

  update: (
    id: number,
    session: Partial<StudySession>
  ): Promise<AxiosResponse<StudySession>> =>
    api.put(`/study-sessions/${id}`, session),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/study-sessions/${id}`),

  endSession: (id: number): Promise<AxiosResponse<StudySession>> =>
    api.put(`/study-sessions/${id}/end`),

  getStats: (): Promise<AxiosResponse<StudySessionStats>> =>
    api.get("/study-sessions/stats"),
};

// Notes API
export const notesAPI = {
  getAll: (): Promise<AxiosResponse<Note[]>> => api.get("/notes"),

  getById: (id: number): Promise<AxiosResponse<Note>> =>
    api.get(`/notes/${id}`),

  create: (
    note: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<AxiosResponse<Note>> => api.post("/notes", note),

  update: (id: number, note: Partial<Note>): Promise<AxiosResponse<Note>> =>
    api.put(`/notes/${id}`, note),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/notes/${id}`),

  search: (query: string): Promise<AxiosResponse<Note[]>> =>
    api.get(`/notes/search?q=${encodeURIComponent(query)}`),
};

// Study Materials API
export const studyMaterialsAPI = {
  getAll: (): Promise<AxiosResponse<any[]>> => api.get("/study-materials"),

  upload: (formData: FormData): Promise<AxiosResponse<any>> => {
    return api.post("/study-materials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  download: (id: number): Promise<AxiosResponse<Blob>> =>
    api.get(`/study-materials/${id}/download`, {
      responseType: "blob",
    }),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/study-materials/${id}`),

  search: (query: string): Promise<AxiosResponse<any[]>> =>
    api.get(`/study-materials/search?q=${encodeURIComponent(query)}`),
};

// Quiz API
export const quizAPI = {
  generateQuiz: (request: any): Promise<AxiosResponse<any>> =>
    api.post("/quizzes/generate", request),

  getAll: (): Promise<AxiosResponse<any[]>> => api.get("/quizzes"),

  getById: (id: number): Promise<AxiosResponse<any>> =>
    api.get(`/quizzes/${id}`),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/quizzes/${id}`),

  search: (query: string): Promise<AxiosResponse<any[]>> =>
    api.get(`/quizzes/search?q=${encodeURIComponent(query)}`),
};

// Profile API
export const profileAPI = {
  updateProfile: (
    profile: ProfileUpdateRequest
  ): Promise<AxiosResponse<User>> => api.put("/profile", profile),

  uploadProfilePhoto: (formData: FormData): Promise<AxiosResponse<User>> => {
    return api.post("/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getProfile: (): Promise<AxiosResponse<User>> => api.get("/profile"),
};

// Discussion Threads API
export const discussionAPI = {
  // Thread operations
  getAllThreads: (
    page = 0,
    size = 10,
    sortBy = "lastActivityAt",
    sortDirection = "desc"
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(
      `/discussions/threads?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    ),

  getThreadById: (id: number): Promise<AxiosResponse<DiscussionThread>> =>
    api.get(`/discussions/threads/${id}`),

  getThreadsByCourse: (
    course: string,
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(
      `/discussions/threads/course/${encodeURIComponent(
        course
      )}?page=${page}&size=${size}`
    ),

  getThreadsByTopic: (
    topic: string,
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(
      `/discussions/threads/topic/${encodeURIComponent(
        topic
      )}?page=${page}&size=${size}`
    ),

  getThreadsByCourseAndTopic: (
    course: string,
    topic: string,
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(
      `/discussions/threads/course/${encodeURIComponent(
        course
      )}/topic/${encodeURIComponent(topic)}?page=${page}&size=${size}`
    ),

  searchThreads: (
    query: string,
    course?: string,
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });
    if (course) params.append("course", course);
    return api.get(`/discussions/threads/search?${params}`);
  },

  searchThreadsEnhanced: (
    query: string,
    course?: string,
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });
    if (course) params.append("course", course);
    return api.get(`/discussions/threads/search/enhanced?${params}`);
  },

  getPinnedThreads: (
    page = 0,
    size = 10
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(`/discussions/threads/pinned?page=${page}&size=${size}`),

  getRecentActivityThreads: (
    page = 0,
    size = 5
  ): Promise<AxiosResponse<ThreadsResponse>> =>
    api.get(`/discussions/threads/recent?page=${page}&size=${size}`),

  createThread: (
    threadData: CreateThreadRequest
  ): Promise<AxiosResponse<DiscussionThread>> =>
    api.post("/discussions/threads", threadData),

  deleteThread: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/discussions/threads/${id}`),

  // Reply operations
  getRepliesByThread: (
    threadId: number,
    page = 0,
    size = 20
  ): Promise<
    AxiosResponse<{
      content: ThreadReply[];
      totalElements: number;
      totalPages: number;
    }>
  > =>
    api.get(
      `/discussions/threads/${threadId}/replies?page=${page}&size=${size}`
    ),

  createReply: (
    threadId: number,
    replyData: CreateReplyRequest
  ): Promise<AxiosResponse<ThreadReply>> =>
    api.post(`/discussions/threads/${threadId}/replies`, replyData),

  deleteReply: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/discussions/replies/${id}`),

  // Moderation operations
  pinThread: (id: number): Promise<AxiosResponse<void>> =>
    api.post(`/discussions/threads/${id}/pin`),

  lockThread: (id: number): Promise<AxiosResponse<void>> =>
    api.post(`/discussions/threads/${id}/lock`),

  // Metadata operations
  getAllCourses: (): Promise<AxiosResponse<CoursesResponse>> =>
    api.get("/discussions/courses"),

  getTopicsByCourse: (course: string): Promise<AxiosResponse<TopicsResponse>> =>
    api.get(`/discussions/courses/${encodeURIComponent(course)}/topics`),
};

// Knowledge Graph API
export const knowledgeAPI = {
  // Get knowledge summary for a thread
  getThreadKnowledgeSummary: (
    threadId: number
  ): Promise<AxiosResponse<KnowledgeSummary>> =>
    api.get(`/knowledge/threads/${threadId}/summary`),

  // Search knowledge entities
  searchEntities: (
    query: string,
    page = 0,
    size = 20
  ): Promise<
    AxiosResponse<{
      content: KnowledgeEntity[];
      totalElements: number;
      totalPages: number;
    }>
  > =>
    api.get(
      `/knowledge/entities/search?query=${encodeURIComponent(
        query
      )}&page=${page}&size=${size}`
    ),

  // Get popular entities
  getPopularEntities: (
    page = 0,
    size = 20
  ): Promise<
    AxiosResponse<{
      content: KnowledgeEntity[];
      totalElements: number;
      totalPages: number;
    }>
  > => api.get(`/knowledge/entities/popular?page=${page}&size=${size}`),

  // Get entities by type
  getEntitiesByType: (
    entityType: string
  ): Promise<AxiosResponse<KnowledgeEntity[]>> =>
    api.get(`/knowledge/entities/type/${encodeURIComponent(entityType)}`),

  // Get related entities
  getRelatedEntities: (
    entityId: number
  ): Promise<AxiosResponse<KnowledgeEntity[]>> =>
    api.get(`/knowledge/entities/${entityId}/related`),

  // Get entity details
  getEntityById: (entityId: number): Promise<AxiosResponse<KnowledgeEntity>> =>
    api.get(`/knowledge/entities/${entityId}`),

  // Get knowledge graph statistics
  getKnowledgeStats: (): Promise<
    AxiosResponse<{ totalEntities: number; topEntities: any[] }>
  > => api.get("/knowledge/stats"),

  // Generate AI summary for a topic/query
  generateTopicSummary: (
    query: string
  ): Promise<AxiosResponse<{ summary: string }>> =>
    api.get(`/knowledge/summary?query=${encodeURIComponent(query)}`),
};

export default api;
