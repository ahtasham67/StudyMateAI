# StudyMateAI

A comprehensive AI-powered study management platform featuring real-time collaboration, knowledge graphs, and intelligent learning analytics.

## 🌟 Key Features

### 📚 Core Study Management

- **Study Sessions**: Timer-based session tracking with analytics
- **Notes Management**: Rich text notes with tagging and search
- **Study Materials**: File upload and organization system
- **Quizzes**: Interactive quiz creation and taking system
- **Dashboard**: Comprehensive study analytics and progress tracking

### 💬 Collaborative Learning

- **Discussion Threads**: Real-time threaded discussions with WebSocket support
- **Reply System**: Nested replies with live updates
- **Search Integration**: Enhanced search across threads and replies
- **Real-time Activity**: Live activity feed and WebSocket status monitoring

### 🧠 AI-Powered Knowledge Graph

- **Entity Recognition**: Automatic extraction of key concepts from content
- **Knowledge Mapping**: Visual representation of learning connections
- **AI Summaries**: Intelligent content summarization
- **Contextual Search**: Knowledge-aware search with entity relationships

### 🔐 Security & Authentication

- **JWT Authentication**: Secure token-based user authentication
- **User Profiles**: Comprehensive user management system
- **Role-based Access**: Granular permission control

### 🚀 Real-time Features

- **WebSocket Integration**: Live updates for discussions and activities
- **Status Monitoring**: Real-time connection status indicators
- **Live Notifications**: Instant updates for new content

## 🛠️ Technology Stack

### Backend

- **Java Spring Boot 3.2.0** with WebSocket support
- **PostgreSQL** with JPA/Hibernate ORM
- **Spring Security** with JWT authentication
- **Maven** build system
- **RESTful APIs** with real-time WebSocket endpoints

### Frontend

- **React 19** with TypeScript
- **Material-UI (MUI) v7** component library
- **React Router DOM v7** for navigation
- **Axios** for HTTP requests
- **STOMP/SockJS** for WebSocket communication
- **Dark theme** with gradient design system

## 📁 Project Structure

```
StudyMateAI/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/studymate/backend/
│   │   ├── StudyMateApplication.java
│   │   ├── config/            # Security, CORS, WebSocket config
│   │   ├── controller/        # REST & WebSocket controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA entities (User, Note, Thread, etc.)
│   │   ├── repository/       # Data access with custom queries
│   │   ├── security/         # JWT utilities & authentication
│   │   └── service/          # Business logic & AI services
│   └── src/main/resources/application.properties
├── frontend/                   # React TypeScript application
│   ├── src/
│   │   ├── components/       # UI components (Navigation, WebSocket, etc.)
│   │   ├── context/         # React Context (Auth, theme)
│   │   ├── pages/           # Route pages (Dashboard, Discussions, etc.)
│   │   ├── services/        # API services & WebSocket clients
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── *.sh                      # Deployment & management scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Java 17+** | **Node.js 18+** | **PostgreSQL 12+** | **Maven 3.6+**

### 🎯 One-Command Setup

```bash
# Interactive launcher with multiple options
./launcher.sh

# Or choose specific mode:
./start-dev.sh     # Development with hot reload
./start-all.sh     # Production-like with full logging
./stop-all.sh      # Stop all services
```

### 📊 Manual Setup

#### Database

```sql
CREATE USER studymate WITH PASSWORD '123';
CREATE DATABASE studymate_db OWNER studymate;
GRANT ALL PRIVILEGES ON DATABASE studymate_db TO studymate;
```

#### Backend

```bash
cd backend && mvn clean install && mvn spring-boot:run
# Runs on http://localhost:8080
```

#### Frontend

```bash
cd frontend && npm install && npm start
# Runs on http://localhost:3000
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user profile

### Study Management

- `GET/POST /api/study-sessions` - Session CRUD operations
- `GET /api/study-sessions/stats` - Study analytics
- `GET/POST /api/notes` - Notes with search capabilities
- `GET/POST /api/quizzes` - Quiz management system

### Discussions & Collaboration

- `GET/POST /api/discussions/threads` - Thread management
- `POST /api/discussions/threads/{id}/replies` - Reply system
- `GET /api/discussions/threads/search/enhanced` - Advanced search

### Knowledge Graph

- `GET /knowledge/search` - Entity search with pagination
- `GET /knowledge/threads/{id}/summary` - AI-generated summaries
- `GET /knowledge/entities/{id}/related` - Related content discovery

### WebSocket Endpoints

- `/ws/discussions` - Real-time discussion updates
- `/ws/activity` - Live activity feed
- `/ws/test` - Connection testing

## 🎨 User Interface

### Pages & Features

- **🏠 Dashboard**: Study analytics, recent activity, progress charts
- **📖 Study Sessions**: Timer-based session tracking with statistics
- **📝 Notes**: Rich text editor with tagging and full-text search
- **📁 Study Materials**: File upload and organization system
- **❓ Quizzes**: Interactive quiz creation and taking interface
- **💬 Discussions**: Real-time threaded discussions with WebSocket
- **🧠 Knowledge Explorer**: AI-powered knowledge graph visualization
- **👤 Profile**: User settings and account management

### Design System

- **Dark Theme**: Modern dark UI with purple/cyan gradient accents
- **Responsive Layout**: Mobile-first design with Material-UI components
- **Real-time Indicators**: Live WebSocket status and activity updates
- **Interactive Components**: Hover effects, smooth transitions, loading states

## 🔧 Configuration

### Backend Environment

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate_db
spring.datasource.username=studymate
spring.datasource.password=123

# JWT Security
app.jwtSecret=mySecretKey
app.jwtExpirationInMs=86400000

# WebSocket
spring.websocket.allowed-origins=http://localhost:3000
```

### Frontend Environment

```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
PORT=3000
```

## 🧪 Testing & Deployment

### Testing

```bash
# Backend tests
cd backend && mvn test

# Frontend tests
cd frontend && npm test

# WebSocket testing
# Use built-in WebSocket test panel at /ws-test
```

### Production Build

```bash
# Build both applications
./start-prod.sh

# Manual build
cd backend && mvn clean package
cd frontend && npm run build
```

## 🚀 Key Innovations

- **🔄 Real-time Collaboration**: WebSocket-powered live discussions and activity feeds
- **🧠 AI Knowledge Graph**: Intelligent entity recognition and content summarization
- **🔍 Enhanced Search**: Multi-layered search across threads, replies, and knowledge entities
- **📊 Smart Analytics**: Comprehensive study tracking with visual progress indicators
- **🎨 Modern UI/UX**: Dark theme with gradient design and responsive layout
- **⚡ Hot Deployment**: Shell scripts for easy development and production deployment

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ahtasham67/StudyMateAI/issues)
- **Discussions**: Use the built-in discussion feature
- **Documentation**: Check API endpoints and configuration sections above

---

**Built with ❤️ for enhanced learning experiences**

_StudyMateAI - Where AI meets collaborative learning_
