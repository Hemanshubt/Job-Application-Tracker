# ==============================================================================
# Production Dockerfile for React + Vite Frontend
# Multi-stage build producing an ultra-lightweight Nginx container (~25MB)
# ==============================================================================

# Stage 1: Build & Bundle Vite App
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for frontend configuration (injected at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL=/api

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code and build config
COPY . .

# Build production bundle into /dist
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.25-alpine AS runner

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (reverse proxy & SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck to verify Nginx serves requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
