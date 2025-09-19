# Frontend Dockerfile for StudyMateAI React Application
# Multi-stage build for optimized production deployment

# Stage 1: Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --silent

# Copy all source files
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx cache directory if missing and set permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to nginx user for security
USER nginx

# Expose port 3000 (make sure nginx.conf listens on this port)
EXPOSE 3000

# Health check to verify nginx is serving correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
