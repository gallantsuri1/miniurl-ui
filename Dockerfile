# Multi-stage Dockerfile for MiniURL UI

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm ci

# Copy source code
COPY . .

# Build arguments for environment variables (required at build time)
ARG VITE_APP_NAME=MiniURL
ARG VITE_APP_DESCRIPTION=Amazon of URL's
ARG VITE_API_URL=https://api.suricloud.uk

# Set environment variables for build
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Add labels
LABEL maintainer="MiniURL"
LABEL description="MiniURL URL Shortener - Frontend"

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
