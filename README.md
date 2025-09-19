# StudyMateAI

A comprehensive AI-powered study platform with intelligent resource discovery, discussion forums, knowledge graphs, and advanced study management built with Java Spring Boot and React TypeScript.

## 🌟 Key Features

### 🎓 Study Management

- **Study Sessions**: Real-time session tracking with analytics and progress monitoring
- **Study Materials**: Upload and manage PDFs, PPTX files with intelligent content extraction
- **Study Folders**: Hierarchical organization system for materials and sessions
- **Notes System**: Rich note creation with tagging, search, and subject categorization

### 🤖 AI-Powered Features

- **Intelligent Help Resources**: AI-powered search across articles, videos, and academic papers
- **Material Chatbot**: Interactive Q&A with study materials using Google Gemini AI
- **Quiz Generation**: Auto-generated quizzes from uploaded study materials
- **Smart Content Analysis**: Automatic topic extraction and content recommendations
- **Knowledge Graph**: AI-driven entity extraction and relationship mapping

### 💬 Discussion & Collaboration

- **Discussion Forums**: Subject-based threaded discussions with real-time updates
- **Reply System**: Nested replies with key phrase extraction and knowledge linking
- **Knowledge Entities**: Automatic extraction and linking of concepts, terms, and topics
- **Thread Analytics**: AI-generated summaries and knowledge scoring

### 📊 Advanced Analytics

- **Study Statistics**: Comprehensive progress tracking and time analytics
- **Knowledge Mapping**: Visual representation of learning concepts and relationships
- **Performance Insights**: AI-driven recommendations and learning pattern analysis

### 🔍 Search & Discovery

- **Global Search**: Unified search across materials, notes, discussions, and knowledge entities
- **Content Recommendations**: AI-powered suggestions based on study patterns
- **Resource Discovery**: Multi-platform search (YouTube, Google Scholar, articles)

## 🛠️ Technology Stack

### Backend

- **Framework**: Java Spring Boot 3.2.0
- **Database**: PostgreSQL with JPA/Hibernate ORM
- **AI Integration**: Google Gemini API for intelligent features
- **Security**: JWT-based authentication with Spring Security
- **Real-time**: WebSocket support for live updates
- **NLP**: OpenNLP for text processing and entity extraction
- **Document Processing**: Apache PDFBox, POI for file parsing

### Frontend

- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7 with responsive design
- **State Management**: React Context API with optimized data flow
- **Real-time**: WebSocket client for live discussions
- **File Handling**: Multi-format file upload and preview
- **Routing**: React Router DOM v7

### Infrastructure

- **Database**: Supabase PostgreSQL with connection pooling
- **File Storage**: Local file system with metadata tracking
- **API**: RESTful services with comprehensive error handling
- **Development**: Hot reload, automated testing, production builds

## 📁 Project Architecture

```
StudyMateAI/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/studymate/
│   │   ├── StudyMateApplication.java # Main application entry
│   │   ├── config/                   # Security, CORS, WebSocket config
│   │   ├── controller/               # REST API endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── StudySessionController.java
│   │   │   ├── StudyMaterialController.java
│   │   │   ├── ChatbotController.java
│   │   │   ├── DiscussionThreadController.java
│   │   │   ├── KnowledgeGraphController.java
│   │   │   └── HelpResourcesController.java
│   │   ├── model/                    # JPA Entity classes
│   │   │   ├── User.java
│   │   │   ├── StudySession.java
│   │   │   ├── StudyMaterial.java
│   │   │   ├── DiscussionThread.java
│   │   │   ├── KnowledgeEntity.java
│   │   │   └── Note.java
│   │   ├── service/                  # Business logic layer
│   │   │   ├── GeminiService.java
│   │   │   ├── KnowledgeGraphService.java
│   │   │   ├── HelpResourcesService.java
│   │   │   ├── NLPService.java
│   │   │   └── DocumentTextExtractorService.java
│   │   ├── repository/               # Data access layer
│   │   ├── dto/                      # Data transfer objects
│   │   └── security/                 # JWT and authentication
│   └── src/main/resources/
│       └── application.properties    # Database and API configuration
├── frontend/                         # React TypeScript Application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navigation.tsx
│   │   │   ├── KnowledgeGraphPanel.tsx
│   │   │   ├── StudyMaterialChatbot.tsx
│   │   │   └── HelpResourcesModal.tsx
│   │   ├── pages/                    # Application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StudyFiles.tsx
│   │   │   ├── Discussions.tsx
│   │   │   ├── ThreadDetail.tsx
│   │   │   └── Notes.tsx
│   │   ├── services/                 # API service layer
│   │   ├── context/                  # React context providers
│   │   └── types/                    # TypeScript definitions
│   └── package.json
├── launcher.sh                       # Interactive application launcher
├── start-dev.sh                      # Development mode with hot reload
├── start-all.sh                      # Standard production mode
├── stop-all.sh                       # Service cleanup
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Java 17+**: For Spring Boot backend
- **Node.js 18+**: For React frontend
- **PostgreSQL 12+**: Database server
- **Maven 3.6+**: Build tool

### Database Setup

```sql
-- Create database and user
CREATE USER studymate WITH PASSWORD 'your_password';
CREATE DATABASE studymate_db OWNER studymate;
GRANT ALL PRIVILEGES ON DATABASE studymate_db TO studymate;
```

### One-Command Launch

```bash
# Interactive launcher with options
./launcher.sh

# Or directly start in development mode
./start-dev.sh
```

### Manual Setup

#### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
```

#### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 🎯 Core Features Guide

### 1. AI-Powered Study Assistant

- Upload study materials (PDF, PPTX)
- Ask questions directly to your materials via AI chatbot
- Get intelligent help resources from across the web
- Auto-generate quizzes from content

### 2. Discussion Forums

- Create topic-based discussion threads
- Real-time threaded conversations
- AI-powered knowledge entity extraction
- Smart content linking and recommendations

### 3. Knowledge Graph

- Automatic concept extraction from discussions
- Visual relationship mapping between topics
- AI-generated summaries and insights
- Cross-reference learning materials

### 4. Study Analytics

- Comprehensive session tracking
- Progress visualization
- AI-driven learning recommendations
- Performance pattern analysis

## 📚 API Documentation

### Core Endpoints

#### Authentication

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User authentication
GET  /api/auth/me          # Current user profile
```

#### Study Management

```
GET    /api/study-sessions           # List sessions
POST   /api/study-sessions           # Create session
PUT    /api/study-sessions/{id}/end  # End session
GET    /api/study-materials          # List materials
POST   /api/study-materials          # Upload material
DELETE /api/study-materials/{id}     # Delete material
```

#### AI Features

```
POST /api/chatbot/ask                # Ask AI about materials
POST /api/help-resources/search      # AI-powered resource search
POST /api/quiz/generate              # Generate quiz from material
```

#### Discussions

```
GET  /api/discussions/threads        # List discussion threads
POST /api/discussions/threads        # Create new thread
POST /api/discussions/threads/{id}/replies  # Add reply
```

#### Knowledge Graph

```
GET /api/knowledge/entities          # List knowledge entities
GET /api/knowledge/entities/search   # Search entities
GET /api/knowledge/entities/{id}     # Get entity details
```

## ⚙️ Configuration

### Environment Variables

#### Backend (`application.properties`)

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate_db
spring.datasource.username=studymate
spring.datasource.password=your_password

# AI Integration
gemini.api.key=your_gemini_api_key
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent

# JWT Security
jwt.secret=your_jwt_secret_key
jwt.expiration=604800000

# File Upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

#### Frontend (`.env`)

```properties
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/api/ws
PORT=3000
```

## 🧪 Testing & Development

### Run Tests

```bash
# Backend tests
cd backend && mvn test

# Frontend tests
cd frontend && npm test
```

### Development Features

- **Hot Reload**: Automatic code reloading
- **Live Updates**: Real-time WebSocket connections
- **Error Handling**: Comprehensive error boundaries
- **API Monitoring**: Request/response logging
- **Database Migrations**: Automatic schema updates

## 📦 Production Deployment

### Build for Production

```bash
# Build backend JAR
cd backend && mvn clean package

# Build frontend
cd frontend && npm run build

# Or use production script
./start-prod.sh
```

### Deployment Requirements

- Java 17+ runtime environment
- PostgreSQL database server
- Web server (Nginx recommended)
- SSL certificate for HTTPS
- Environment-specific configuration

## 🔥 Advanced Features

### AI-Powered Learning

- **Smart Content Analysis**: Automatic topic and concept extraction
- **Personalized Recommendations**: Learning path suggestions
- **Intelligent Search**: Context-aware multi-platform resource discovery
- **Adaptive Quizzing**: Difficulty-adjusted quiz generation

### Real-time Collaboration

- **Live Discussions**: WebSocket-powered real-time conversations
- **Knowledge Sharing**: Community-driven learning insights
- **Progress Sharing**: Collaborative study session tracking

### Data Intelligence

- **Learning Analytics**: Advanced progress tracking and insights
- **Knowledge Mapping**: Visual concept relationship graphs
- **Study Patterns**: AI-driven learning behavior analysis

## 🆘 Support & Documentation

- **Discussions**: [GitHub Discussions](https://github.com/ahtasham67/StudyMateAI/discussions)

**Built for the future of education** 🎓✨

Made with ❤️ by Ahtasham67.
