<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# StudyMate Application Development Guidelines

## Project Overview

StudyMate is a full-stack web application for student study management, built with:

- **Backend**: Java Spring Boot with PostgreSQL database
- **Frontend**: React with TypeScript and Material-UI
- **Security**: JWT-based authentication
- **Architecture**: RESTful API with JPA/Hibernate ORM

## Code Style Guidelines

### Backend (Spring Boot)

- Use standard Java naming conventions (camelCase for variables/methods, PascalCase for classes)
- Follow Spring Boot best practices for controller, service, and repository layers
- Use `@RestController` for API endpoints with proper HTTP status codes
- Implement proper validation using `@Valid` and Jakarta validation annotations
- Use `@AuthenticationPrincipal` for accessing authenticated user information
- Follow RESTful URL patterns: `/api/resource` and `/api/resource/{id}`
- Use DTOs for request/response objects when appropriate
- Implement proper error handling and exception management

### Frontend (React + TypeScript)

- Use functional components with React Hooks
- Follow TypeScript best practices with proper type definitions
- Use Material-UI components consistently for UI design
- Implement proper state management using React hooks (useState, useEffect, useContext)
- Use axios for HTTP requests with proper error handling
- Follow React Router patterns for navigation
- Use consistent naming: PascalCase for components, camelCase for functions and variables

### Database Design

- Use meaningful table and column names with snake_case convention
- Implement proper foreign key relationships
- Use appropriate data types and constraints
- Include created_at and updated_at timestamps for auditing
- Follow naming conventions: plural table names, singular column names

## Architecture Patterns

### Backend Structure

```
com.studymate.backend/
├── config/          # Configuration classes (Security, CORS, etc.)
├── controller/      # REST API controllers
├── dto/            # Data Transfer Objects
├── model/          # JPA Entity classes
├── repository/     # JPA Repository interfaces
├── security/       # Security-related classes (JWT, Auth filters)
└── service/        # Business logic services
```

### Frontend Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── services/      # API service calls
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── context/       # React Context providers
```

## Key Features to Implement

1. **User Authentication**: Login, register, JWT token management
2. **Study Sessions**: CRUD operations with timing and status tracking
3. **Notes Management**: Create, edit, organize notes by subject/category
4. **Dashboard**: Study statistics and progress tracking
5. **Search & Filter**: Find study sessions and notes efficiently

## Security Guidelines

- Always validate user permissions before data access
- Use parameterized queries to prevent SQL injection
- Implement proper CORS configuration
- Secure JWT token storage and transmission
- Validate all user inputs on both frontend and backend

## API Design Standards

- Use HTTP status codes appropriately (200, 201, 400, 401, 404, 500)
- Return consistent JSON response formats
- Implement proper pagination for list endpoints
- Use query parameters for filtering and searching
- Follow REST conventions for endpoint naming

## Development Best Practices

- Write clean, readable, and well-documented code
- Use meaningful variable and function names
- Implement proper error handling throughout the application
- Follow the DRY (Don't Repeat Yourself) principle
- Write unit tests for critical business logic
- Use proper logging for debugging and monitoring

## Common Patterns

- Use Repository pattern for data access layer
- Implement Service layer for business logic
- Use DTO pattern for API request/response objects
- Apply MVC pattern consistently
- Use dependency injection throughout the application
