export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface StudySession {
  id: number;
  title: string;
  subject: string;
  description?: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface StudySessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageDuration: number;
  sessionsThisWeek: number;
}
