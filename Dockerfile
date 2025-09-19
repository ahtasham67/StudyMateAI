# Unified Dockerfile for StudyMateAI - Single Service Deployment
# Builds React frontend and serves it alongside Spring Boot backend

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

# Build backend JAR skipping tests
RUN mvn clean package -DskipTests -B

# Stage 3: Production Runtime
FROM openjdk:17-jdk-slim

# Install nginx and curl
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user/group
RUN groupadd -r studymate && useradd -r -g studymate studymate

WORKDIR /app

# Copy built backend JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Copy built frontend to nginx directory
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy nginx unified configuration
COPY nginx-unified.conf /etc/nginx/nginx.conf

# Create necessary directories with correct ownership
RUN mkdir -p /app/uploads && \
    mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    chown -R studymate:studymate /app /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx

# Prepare nginx pid file and fix ownership
RUN touch /var/run/nginx.pid && \
    chown studymate:studymate /var/run/nginx.pid

# Copy startup script and set ownership before changing user
COPY start-unified.sh /app/start-unified.sh
RUN chown studymate:studymate /app/start-unified.sh && chmod +x /app/start-unified.sh

# Switch to non-root user after all ownership and permissions are set
USER studymate

# Expose port 8080 (Spring Boot + nginx unified)
EXPOSE 8080

# Health check for unified service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# JVM options for container optimization
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Entrypoint: run startup script to launch nginx + Spring Boot
ENTRYPOINT ["/app/start-unified.sh"]
