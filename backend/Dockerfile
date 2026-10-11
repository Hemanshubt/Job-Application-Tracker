# ==============================================================================
# Production Dockerfile for Express + TypeScript Backend
# Multi-stage build with minimal attack surface and non-root execution
# ==============================================================================

# Stage 1: Build & Compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and config files
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Remove development dependencies to keep production footprint minimal
RUN npm prune --omit=dev

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Security: Run as unprivileged node user
USER node

# Copy production artifacts from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
