# Trackr — DevOps & Infrastructure Architecture Guide

[![CI/CD Pipeline](https://github.com/Hemanshubt/Job-Application-Tracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Hemanshubt/Job-Application-Tracker/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Nginx](https://img.shields.io/badge/Reverse_Proxy-Nginx_Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![Container Registry](https://img.shields.io/badge/Registry-GHCR-181717?logo=github&logoColor=white)](https://ghcr.io)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## 📌 Executive Summary

**Trackr** is an enterprise-grade, microservice-inspired containerized application designed with modern DevOps best practices. This document provides complete architectural documentation, CI/CD pipeline breakdown, multi-stage Docker build specifications, network topology, security hardening protocols, and production operations/runbooks.

---

## 🏛️ System Architecture & Network Topology

```
                                      INTERNET / CLIENTS
                                              │
                                              ▼ (Port 80 / 443 HTTPS)
                             ┌─────────────────────────────────┐
                             │    NGINX EDGE REVERSE PROXY     │
                             │        (trackr-frontend)        │
                             │  • SPA Static Assets Caching    │
                             │  • Gzip Compression (1KB+)      │
                             │  • Security HTTP Headers        │
                             │  • Liveness Probe: /healthz     │
                             └────────────────┬────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │ Internal Docker Network (trackr-net: bridge)  │
                      │ Proxy Pass /api/*                            │
                      ▼                                               ▼
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │     SPA ROUTING ENGINE        │               │     EXPRESS API BACKEND       │
       │    (Static Asset Server)      │               │       (trackr-backend)        │
       │  • try_files $uri /index.html │               │  • Port 5000 (Internal)       │
       │  • Cache-Control: immutable   │               │  • Non-root `node` execution  │
       └───────────────────────────────┘               │  • Zod Validation & Rate Lim  │
                                                       │  • Probe: /api/health         │
                                                       └──────────────┬────────────────┘
                                                                      │
                                                Secure Supabase Client│ (TLS 1.3 / RLS)
                                                                      ▼
                                                       ┌───────────────────────────────┐
                                                       │        SUPABASE CLOUD         │
                                                       │  • Managed PostgreSQL 15      │
                                                       │  • Row-Level Security (RLS)   │
                                                       │  • Object Storage (Resumes)   │
                                                       │  • Auth JWT Verification      │
                                                       └───────────────────────────────┘
```

---

## 🐳 Containerization Strategy & Multi-Stage Builds

The application utilizes multi-stage Docker builds to achieve minimal attack surfaces, layer caching optimization, and lean image footprints.

### 1. Backend Container (`backend/Dockerfile`)
* **Base Image:** `node:20-alpine` (musl-based lightweight runtime)
* **Stage 1 (Builder):**
  * Installs dependencies with deterministic locking via `npm ci`.
  * Compiles TypeScript code (`src/` $\to$ `/dist`) via `tsc`.
  * Prunes development dependencies with `npm prune --omit=dev`.
* **Stage 2 (Runner):**
  * Runs with an unprivileged system user (`USER node` UID 1000) preventing privilege escalation vulnerabilities.
  * Copies only compiled JavaScript (`/dist`) and production `node_modules`.
  * Built-in continuous health check polling `/api/health`.
  * Image footprint: **~180MB** (compared to ~1.2GB standard Node images).

### 2. Frontend Container (`frontend/Dockerfile`)
* **Stage 1 (Builder):**
  * Injects build arguments (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`).
  * Executes Vite production bundler (`npm run build`) generating optimized tree-shaken assets in `/dist`.
* **Stage 2 (Runner):**
  * Powered by `nginx:1.25-alpine`.
  * Discards Node.js tooling, npm modules, and source code.
  * Embeds customized `nginx.conf` configured for reverse proxying and SPA fallback.
  * Lightweight image footprint: **< 28MB**.

---

## 🔄 CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

The continuous integration and continuous delivery workflow is fully automated through GitHub Actions across three discrete pipeline stages:

```
[ Push / Pull Request to main ]
               │
               ▼
   ┌───────────────────────┐
   │ 1. verify-and-build   │ ──► Linting & TypeScript compilation (backend & frontend)
   └───────────┬───────────┘
               │ (Pass)
               ▼
   ┌───────────────────────┐
   │ 2. docker-verify      │ ──► Multi-stage Docker build validation with GitHub Actions cache
   └───────────┬───────────┘
               │ (Pass on 'main' push)
               ▼
   ┌───────────────────────┐
   │ 3. publish-containers │ ──► Automated push to GitHub Container Registry (GHCR)
   └───────────────────────┘     • ghcr.io/<repo>/backend:latest + :<sha>
                                 • ghcr.io/<repo>/frontend:latest + :<sha>
```

### Pipeline Jobs Breakdown

| Job | Trigger | Key Steps & Actions | Artifacts / Output |
|---|---|---|---|
| **`verify-and-build`** | `push`, `pull_request` | • `actions/checkout@v4`<br>• `actions/setup-node@v4` (Node 20, npm caching)<br>• `npm ci && npm run build` (Backend)<br>• `npm ci && npm run build` (Frontend) | Verifies type integrity and build clean state without runtime regressions. |
| **`docker-verify`** | Depends on `verify-and-build` | • `docker/setup-buildx-action@v3`<br>• `docker/build-push-action@v5`<br>• GitHub Actions layer cache (`cache-from/to: type=gha`) | Tests container compilation and Dockerfile sanity without publishing. |
| **`publish-containers`** | `push` to `main` only | • `docker/login-action@v3` (GHCR authentication)<br>• Dual image tagging (`:latest` and `:${{ github.sha }}`)<br>• Push to GitHub Container Registry | Immutable production images stored in GHCR ready for deployment pull. |

---

## 🛡️ Security Hardening & Compliance

1. **Least-Privilege Execution:** Node API container drops root privileges (`USER node`), mitigating container breakout risks.
2. **Layer Stripping:** Build tooling (TypeScript compiler, linters, git) is strictly excluded from production containers.
3. **HTTP Header Hardening:** Nginx injects protective security headers:
   * `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
   * `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
   * `X-XSS-Protection: 1; mode=block`
   * `Referrer-Policy: strict-origin-when-cross-origin`
4. **Backend Security Layer:** Express uses `helmet` middleware for HTTP header enforcement, along with strict CORS origin verification.
5. **Database Security:** PostgreSQL enforcement using Row-Level Security (RLS) policies and JWT cryptographic verification via Supabase.
6. **Immutable Tagging:** Every release container pushed to GHCR is stamped with the Git commit SHA, providing complete auditability and reproducible rollbacks.

---

## 🚀 Deployment Workflows

### Scenario A: Local & Staging Orchestration (Docker Compose)

```bash
# 1. Clone repository
git clone https://github.com/Hemanshubt/Job-Application-Tracker.git
cd Job-Application-Tracker

# 2. Populate environment variables
cp .env.docker.example .env
# Edit .env with your Supabase credentials

# 3. Spin up full stack
docker compose up -d --build

# 4. Verify service status
docker compose ps
```

### Scenario B: Production Server Pull from GHCR

Deploy directly to an Ubuntu/Debian VPS or AWS EC2 using pre-built images:

```bash
# Authenticate with GHCR
echo $CR_PAT | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin

# Pull latest container images
docker pull ghcr.io/hemanshubt/job-application-tracker/backend:latest
docker pull ghcr.io/hemanshubt/job-application-tracker/frontend:latest

# Launch using production docker-compose
docker compose -f docker-compose.prod.yml up -d
```

### Scenario C: Production SSL / TLS Setup (Certbot)

To configure HTTPS on your domain:

```bash
# Install Certbot
sudo apt-get update && sudo apt-get install -y certbot

# Generate certificate in standalone mode
sudo certbot certonly --standalone -d tracker.yourdomain.com

# Auto-renewal cron check
sudo certbot renew --dry-run
```

---

## 📈 Observability, Health Checks & Monitoring

Both services expose dedicated health check probes used by Docker daemon, reverse proxies, and Kubernetes readiness/liveness checks:

| Target | Health Endpoint | Method | Interval | Timeout | Retries |
|---|---|---|---|---|---|
| **Frontend (Nginx)** | `http://localhost/healthz` | `GET` | 30s | 5s | 3 |
| **Backend (Express)** | `http://localhost:5000/api/health` | `GET` | 30s | 5s | 3 |

### Monitoring Commands Quick Reference

```bash
# Follow consolidated streaming logs
docker compose logs -f

# Follow backend service logs with timestamps
docker compose logs -f -t backend

# Inspect container resource metrics (CPU, RAM, Network I/O)
docker stats trackr-backend trackr-frontend

# Inspect container healthcheck history
docker inspect --format='{{json .State.Health}}' trackr-backend | jq .
```

---

## 🔄 Disaster Recovery & Rollback Runbook

### Rolling Back to a Previous Deployment
Because the GitHub Actions CI/CD pipeline pushes images tagged with `${{ github.sha }}`, reverting a deployment takes seconds without re-building:

```bash
# Step 1: Identify previous target commit SHA
TARGET_SHA="e89e0a3"

# Step 2: Update image tags in production compose file or CLI
docker stop trackr-backend trackr-frontend
docker run -d --name trackr-backend --net trackr-net ghcr.io/hemanshubt/job-application-tracker/backend:$TARGET_SHA
docker run -d --name trackr-frontend --net trackr-net -p 80:80 ghcr.io/hemanshubt/job-application-tracker/frontend:$TARGET_SHA

# Step 3: Validate healthy status
docker ps --filter "health=healthy"
```

---

## 🛠️ DevOps Technology Matrix

| Domain | Tool / Technology | Purpose |
|---|---|---|
| **Container Engine** | Docker 24+ & Buildx | Multi-stage build compilation and caching |
| **Orchestration** | Docker Compose v2 | Local & single-node production runtime management |
| **CI/CD Platform** | GitHub Actions | Automated lint, build validation, and container pushing |
| **Artifact Registry**| GitHub Container Registry (GHCR) | Private/public Docker image distribution |
| **Reverse Proxy** | Nginx 1.25 Alpine | Edge routing, proxying, static asset caching, Gzip |
| **Security** | Helmet, Non-Root Alpine, Zod | Layered defense and validation |
| **Database/Storage**| Supabase Cloud (PostgreSQL 15) | Relational persistence, Row-Level Security, Resume storage |
