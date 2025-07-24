import axios, { AxiosResponse } from "axios";
import {
  AuthResponse,
  LoginRequest,
  Note,
  RegisterRequest,
  StudySession,
  StudySessionStats,
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

export default api;
