# Unified Dockerfile for StudyMateAI - Single Service Deployment
# Builds React frontend and serves it alongside Spring Boot backend

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production --silent

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend

# Copy backend pom.xml
COPY backend/pom.xml ./

# Download backend dependencies
RUN mvn dependency:go-offline -B

# Copy backend source
COPY backend/src ./src

# Build backend JAR
RUN mvn clean package -DskipTests -B

# Stage 3: Production Runtime
FROM openjdk:17-jdk-slim

# Install nginx and curl
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r studymate && useradd -r -g studymate studymate

WORKDIR /app

# Copy built backend JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Copy built frontend to nginx
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration for single service
COPY nginx-unified.conf /etc/nginx/nginx.conf

# Create upload directory
RUN mkdir -p /app/uploads && chown -R studymate:studymate /app

# Set permissions for nginx
RUN chown -R studymate:studymate /usr/share/nginx/html && \
    chown -R studymate:studymate /var/cache/nginx && \
    chown -R studymate:studymate /var/log/nginx && \
    chown -R studymate:studymate /etc/nginx && \
    touch /var/run/nginx.pid && \
    chown -R studymate:studymate /var/run/nginx.pid

# Switch to non-root user
USER studymate

# Expose port 8080 (unified service)
EXPOSE 8080

# Health check for unified service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# JVM optimization
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Create startup script
COPY start-unified.sh /app/start-unified.sh
RUN chmod +x /app/start-unified.sh

# Start both nginx and Spring Boot
ENTRYPOINT ["/app/start-unified.sh"]