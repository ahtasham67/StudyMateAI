export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  universityName?: string;
  currentTerm?: string;
  academicYear?: string;
  major?: string;
  yearOfStudy?: string;
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

export interface DiscussionThread {
  id: number;
  title: string;
  content: string;
  course: string;
  topic: string;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  lastActivityAt: string;
  aiGeneratedSummary?: string;
  knowledgeScore?: number;
  knowledgeEntities?: KnowledgeEntity[];
}

export interface KnowledgeEntity {
  id: number;
  name: string;
  entityType: string;
  description: string;
  confidenceScore: number;
  frequencyCount: number;
  createdAt: string;
  relatedEntityNames: string[];
  relatedThreadCount: number;
}

export interface KnowledgeSummary {
  aiGeneratedSummary: string;
  knowledgeScore: number;
  keyEntities: KnowledgeEntity[];
  relatedThreads: DiscussionThread[];
  suggestedTopics: string[];
}

export interface ThreadReply {
  id: number;
  content: string;
  authorName: string;
  parentReplyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
  content: string;
  course: string;
  topic: string;
}

export interface CreateReplyRequest {
  content: string;
  parentReplyId?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
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

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  universityName?: string;
  currentTerm?: string;
  academicYear?: string;
  major?: string;
  yearOfStudy?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhotoUrl?: string;
  universityName?: string;
  currentTerm?: string;
  academicYear?: string;
  major?: string;
  yearOfStudy?: string;
}

export interface StudySessionStats {
  completedSessions: number;
  totalStudyTime: number;
}

export interface StudyMaterial {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: "PDF" | "PPTX";
  fileSize: number;
  uploadDate: string;
  subject?: string;
  description?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  studyMaterialId: number;
  studyMaterialName: string;
  totalQuestions: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  questionNumber: number;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  explanation?: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: number;
  optionNumber: number;
  optionText: string;
  isCorrect: boolean;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  studyMaterialId: number;
  numberOfQuestions: number;
  durationMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

// API Response Types
export interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface CoursesResponse extends ApiResponse {
  courses: string[];
}

export interface TopicsResponse extends ApiResponse {
  topics: string[];
}

export interface ThreadsResponse extends ApiResponse {
  threads: DiscussionThread[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
