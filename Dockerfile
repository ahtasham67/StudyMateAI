# Unified Dockerfile for StudyMateAI - Single Service Deployment
# Builds React frontend and embeds it in Spring Boot backend static resources

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --silent

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend

# Copy backend pom.xml
COPY backend/pom.xml ./

# Download backend dependencies offline
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Copy built frontend to backend static resources
COPY --from=frontend-build /app/frontend/build ./src/main/resources/static

# Build backend JAR skipping tests
RUN mvn clean package -DskipTests -B

# Stage 3: Production Runtime
FROM openjdk:17-jdk-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built backend JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Expose the port that will be provided by PORT environment variable
EXPOSE ${PORT:-8080}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/api/actuator/health || exit 1

# JVM options for container optimization
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Start Spring Boot application directly
CMD java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar
