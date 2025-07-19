# StudyMate

A comprehensive full-stack web application for managing study sessions and notes, built with Java Spring Boot backend and React TypeScript frontend.

## 🌟 Features

### User Management
- **User Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: User profile with personal information

### Study Session Management
- **Session Tracking**: Start, end, and monitor study sessions
- **Session Analytics**: View statistics including total time, average duration, and weekly progress
- **Subject Organization**: Categorize sessions by subject
- **Real-time Monitoring**: Track active sessions with live duration display

### Note Management
- **Rich Note Creation**: Create detailed notes with titles, content, and metadata
- **Tagging System**: Organize notes with custom tags
- **Subject Classification**: Categorize notes by subject
- **Search Functionality**: Full-text search across titles, content, subjects, and tags
- **CRUD Operations**: Complete create, read, update, delete functionality

### Dashboard & Analytics
- **Study Statistics**: Comprehensive overview of study habits
- **Recent Activity**: Quick access to recent sessions and notes
- **Progress Tracking**: Monitor learning progress over time

## 🛠️ Technology Stack

### Backend
- **Framework**: Java Spring Boot 3.2.0
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT authentication
- **Build Tool**: Maven
- **API**: RESTful web services

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Date Handling**: date-fns

### Development Tools
- **Version Control**: Git
- **IDE Support**: VS Code configuration included
- **Development Server**: React development server
- **Hot Reload**: Automatic code reloading during development

## 📁 Project Structure

```
StudyMate/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/studymate/
│   │       ├── StudyMateApplication.java
│   │       ├── config/      # Security & CORS configuration
│   │       ├── controller/  # REST API controllers
│   │       ├── entity/      # JPA entities
│   │       ├── repository/  # Data access layer
│   │       └── util/        # JWT utilities
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                # React TypeScript application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

### Database Setup
1. Install PostgreSQL and create a database:
```sql
CREATE USER studymate WITH PASSWORD '123';
CREATE DATABASE studymate_db OWNER studymate;
GRANT ALL PRIVILEGES ON DATABASE studymate_db TO studymate;
```

2. Database configuration in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate_db
spring.datasource.username=studymate
spring.datasource.password=123
```

**Note**: The shell scripts will automatically check PostgreSQL status and start it if needed.

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Quick Start with Shell Scripts

We've provided convenient shell scripts to run the application:

### Main Launcher (Recommended)
```bash
./launcher.sh
```
This interactive script gives you options to start the application in different modes.

### Available Scripts

1. **Development Mode** (with hot reload):
```bash
./start-dev.sh
```
- Starts both backend and frontend with live reload
- Perfect for development work
- Changes are reflected automatically

2. **Standard Mode** (production-like):
```bash
./start-all.sh
```
- Starts both services with full logging
- Includes dependency installation
- Comprehensive error handling and monitoring

3. **Production Build**:
```bash
./start-prod.sh
```
- Builds both applications for production
- Optimized builds with minification
- Ready for deployment

4. **Stop All Services**:
```bash
./stop-all.sh
```
- Stops all running StudyMate services
- Cleans up ports 3000 and 8080
- Kills any remaining processes

### Script Features
- ✅ Automatic prerequisite checking
- ✅ Dependency installation
- ✅ Process monitoring
- ✅ Graceful shutdown with Ctrl+C
- ✅ Comprehensive error handling
- ✅ Real-time status updates

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Study Session Endpoints
- `GET /api/study-sessions` - Get all sessions
- `POST /api/study-sessions` - Create new session
- `GET /api/study-sessions/{id}` - Get specific session
- `PUT /api/study-sessions/{id}` - Update session
- `DELETE /api/study-sessions/{id}` - Delete session
- `PUT /api/study-sessions/{id}/end` - End active session
- `GET /api/study-sessions/stats` - Get session statistics

### Notes Endpoints
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/{id}` - Get specific note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes/search?q={query}` - Search notes

## 💡 Usage Guide

### Creating Your First Study Session
1. Register or login to your account
2. Navigate to "Study Sessions" page
3. Click "Start New Session"
4. Fill in session details (title, subject, description)
5. Click "Start Session" to begin tracking time

### Managing Notes
1. Go to the "Notes" page
2. Click "Create Note" to add a new note
3. Add title, content, subject, and tags
4. Use the search bar to find specific notes
5. Edit or delete notes using the context menu

### Viewing Analytics
1. Visit the Dashboard for an overview
2. Check study statistics including:
   - Total study sessions
   - Total study time
   - Average session duration
   - Sessions completed this week

## 🔧 Configuration

### Environment Variables

#### Backend (`application.properties`)
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate
spring.datasource.username=studymate_user
spring.datasource.password=your_password

# JWT Configuration
app.jwtSecret=mySecretKey
app.jwtExpirationInMs=86400000

# Server Configuration
server.port=8080
```

#### Frontend (`.env`)
```properties
REACT_APP_API_URL=http://localhost:8080/api
PORT=3000
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/studymate-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/studymate/issues) page
2. Create a new issue with detailed description
3. Provide steps to reproduce the problem

## 🎯 Future Enhancements

- **Mobile Application**: React Native mobile app
- **Study Groups**: Collaborative study sessions
- **Calendar Integration**: Sync with external calendars
- **Export Features**: Export notes and statistics
- **Notifications**: Reminder system for study sessions
- **Advanced Analytics**: Detailed progress reports and insights
- **Theme Customization**: Dark/light mode and custom themes

---

Made with ❤️ for students and lifelong learners
