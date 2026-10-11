# Trackr — Resume Project Descriptions & Career Showcase

This guide provides high-impact, ATS-optimized project descriptions, bullet points, and technical summaries for **Trackr (Job Application & Pipeline Platform)**.

Choose the section that matches the role you are targeting (DevOps/Cloud, Full-Stack, or Backend).

---

## 📌 Executive Summary / 2-Line Project Pitch

> **Trackr** is an enterprise-grade job application lifecycle and interview tracking platform built with **React 18**, **TypeScript**, **Node.js/Express**, and **Supabase (PostgreSQL with Row-Level Security)**. Containerized with multi-stage **Docker**, orchestrated via **Docker Compose**, and automated through a **GitHub Actions CI/CD pipeline** publishing to **GitHub Container Registry (GHCR)**.

---

## 💼 Option 1: Tailored for DevOps / Cloud Engineer Roles

### Resume Title & Links
**Trackr — Containerized Cloud Application & CI/CD Pipeline**  
*Technologies: Docker, Docker Compose, GitHub Actions, Nginx, Linux (Alpine), GHCR, Let’s Encrypt, Bash, Supabase*

### ATS-Optimized Bullet Points (Choose 3–5):
* **Architected automated CI/CD pipeline** with **GitHub Actions**, integrating automated TypeScript compilation, multi-tier lint checks, and automated artifact publishing to **GitHub Container Registry (GHCR)** on main branch merges.
* **Designed production multi-stage Docker builds** for frontend (Vite + Nginx) and backend (Node.js/Express), reducing production image sizes by **85%** (down to ~25MB for frontend and ~130MB for backend).
* **Hardened container security** by enforcing unprivileged non-root execution (`USER node`) on Alpine Linux base images and stripping build-time devDependencies via `npm prune --omit=dev`.
* **Configured Nginx Alpine edge proxy** serving static SPA bundles with Gzip compression and client-side route fallback (`try_files`), while reverse-proxying `/api` traffic internally across an isolated Docker bridge network.
* **Implemented zero-downtime healthcheck probes** across services with Docker native healthchecks (`/api/health` and `/healthz`) and container restart policies (`unless-stopped`), ensuring rapid self-healing.
* **Streamlined local and cloud deployment orchestration** via **Docker Compose**, enabling unified one-command provisioning (`docker compose up -d`) across Ubuntu VPS / AWS EC2 environments.

---

## 💼 Option 2: Tailored for Full-Stack Software Engineer Roles

### Resume Title & Links
**Trackr — Full-Stack Job Application Tracker & Analytics Platform**  
*Technologies: React 18, Vite, TypeScript, Express.js, Supabase, PostgreSQL, Tailwind CSS, Recharts, Zod*

### ATS-Optimized Bullet Points (Choose 3–5):
* **Developed full-stack web application** to manage job applications, interview timelines, recruiter contacts, and task checklists, serving interactive dashboards with **React 18**, **TypeScript**, and **Express.js**.
* **Implemented relational data model in Supabase PostgreSQL** leveraging **Row-Level Security (RLS)** to enforce strict multi-tenant data isolation and authorization directly at the database layer.
* **Built responsive dark-mode analytics dashboard** using **Recharts** and **Tailwind CSS**, visualizing application conversion funnels, interview progression velocity, and monthly submission trends.
* **Engineered robust REST API with Express and Zod**, validating 100% of incoming request payloads with strict schema parsing, centralized error handling, and uniform response envelopes.
* **Containerized application stack with Docker & Docker Compose**, pairing Vite static distribution via an Nginx reverse proxy with an unprivileged Express microservice.
* **Integrated Supabase Authentication** with JWT validation and seamless client-side auth state listeners, guarding protected routes and persistent session management.

---

## 💼 Option 3: Tailored for Backend / Platform Engineer Roles

### Resume Title & Links
**Trackr — REST API Service & Database Infrastructure**  
*Technologies: Node.js, Express, TypeScript, PostgreSQL, Supabase, Zod, Helmet, Docker, RESTful APIs*

### ATS-Optimized Bullet Points (Choose 3–5):
* **Constructed modular Express.js REST API in TypeScript**, designing clean layered separation between routing, controllers, business services, and database persistence layers.
* **Secured API endpoints** against common web vulnerabilities utilizing **Helmet** security headers, restrictive CORS policies, and token-based JWT bearer authentication.
* **Implemented end-to-end type safety** by synchronizing database types with **Zod** schema validations, eliminating runtime payload mismatches.
* **Engineered high-performance database schema** in PostgreSQL with foreign key constraints, cascading deletions, composite indexes, and Row-Level Security policies for secure multi-user tenancy.
* **Containerized backend runtime** into a hardened Alpine Linux container with proactive automated health checks and packaged it for continuous delivery via GitHub Actions.

---

## 🛠️ Technical Skills Block for Your Resume

You can paste or blend these skills directly into the **Technical Skills** section of your resume:

```
• Languages: TypeScript, JavaScript (ES6+), SQL, Bash/Shell, HTML5, CSS3
• Frontend: React 18, Vite, Tailwind CSS, Recharts, React Router, Lucide Icons, Axios
• Backend: Node.js, Express.js, RESTful API Design, Zod Validation, Helmet, Morgan
• DevOps & Cloud: Docker, Docker Compose, Multi-Stage Builds, GitHub Actions (CI/CD), 
                  GHCR (GitHub Container Registry), Nginx (Reverse Proxy & Static Hosting), 
                  Linux (Ubuntu/Alpine), Let's Encrypt (SSL/TLS), Supabase Cloud
• Database & Security: PostgreSQL, Row-Level Security (RLS), JWT Authentication, CORS
```

---

## 🎯 Interview Talking Points & System Design Q&A

Use these points during technical interviews to showcase depth of knowledge:

### 1. "Why did you use Docker multi-stage builds?"
> *"Single-stage Docker builds leave behind build toolchains, TypeScript compilers, test packages, and devDependencies, leading to bloated images of 1GB+. By implementing multi-stage builds, stage 1 compiles TypeScript and builds Vite assets, while stage 2 copies only compiled dist/ artifacts and production node_modules into Alpine Linux. This reduced the frontend image to ~25MB and backend to ~130MB, speeding up CI/CD pulls and shrinking the attack surface."*

### 2. "How did you handle networking and CORS between frontend and backend in production?"
> *"Instead of exposing the backend directly to the public internet and dealing with complex cross-origin CORS headers, I leveraged Nginx as a reverse proxy inside the Docker Compose network. Nginx serves the React SPA on port 80/443 and proxies any `/api/*` requests directly to `http://backend:5000` over the internal Docker bridge network. This eliminates browser CORS issues, improves security, and unifies both services behind a single domain."*

### 3. "How did you design the CI/CD pipeline?"
> *"The GitHub Actions workflow has a 3-tier structure: First, a verification job runs `npm ci` with dependency caching and verifies TypeScript compilation across both client and server. Second, Docker Buildx tests image construction with GitHub Actions layer caching. Third, upon merging into `main`, it logs into GitHub Container Registry (GHCR) and pushes immutably tagged images (`:latest` and `:<commit-sha>`) ready for production deployment."*

### 4. "How did you guarantee security for multi-tenant data in PostgreSQL?"
> *"Rather than relying purely on application-level filtering where a missed `WHERE user_id = ...` could leak data, we implemented PostgreSQL Row-Level Security (RLS) in Supabase. Every table has security policies enforcing that rows can only be selected, updated, or deleted if `auth.uid() = user_id`, providing defense-in-depth even if an API route had a vulnerability."*
