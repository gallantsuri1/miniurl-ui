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

# Build arguments - use placeholder tokens for runtime substitution
ARG VITE_APP_NAME=__VITE_APP_NAME__
ARG VITE_APP_DESCRIPTION=__VITE_APP_DESCRIPTION__
ARG VITE_API_URL=__VITE_API_URL__

ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application (JS files will contain placeholder tokens)
RUN npm run build

# Production stage
FROM nginx:alpine

# Add labels
LABEL maintainer="MiniURL"
LABEL description="MiniURL URL Shortener - Frontend"

# Runtime environment variables (can be overridden with docker run -e or docker-compose)
ENV VITE_APP_NAME="MiniURL"
ENV VITE_APP_DESCRIPTION="Amazon of URL's"
ENV VITE_API_URL="http://localhost:8080"

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create runtime config injection script
# This runs before nginx starts and creates config.js with the actual env var values
RUN cat > /docker-entrypoint.d/10-substitute-env.sh << 'ENTRYPOINT'
#!/bin/sh
echo "Setting runtime environment variables..."

# Create config.js with current env var values
cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
  VITE_APP_NAME: '${VITE_APP_NAME}',
  VITE_APP_DESCRIPTION: '${VITE_APP_DESCRIPTION}',
  VITE_API_URL: '${VITE_API_URL}'
};
console.log('[Runtime Config]', window.__APP_CONFIG__);
EOF

# Inject config.js before </head> in index.html
sed -i 's|</head>|<script src="/config.js"></script></head>|' /usr/share/nginx/html/index.html

echo "Runtime config set: VITE_APP_NAME=${VITE_APP_NAME}, VITE_API_URL=${VITE_API_URL}"
ENTRYPOINT
RUN chmod +x /docker-entrypoint.d/10-substitute-env.sh

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
