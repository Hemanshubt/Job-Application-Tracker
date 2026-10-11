# Hemanshu Mahajan
**Full Stack & DevOps Engineer**

📍 India • ✉️ [hemanshumahajan55@gmail.com](mailto:hemanshumahajan55@gmail.com) • 🌐 [GitHub: Hemanshubt](https://github.com/Hemanshubt) • 💼 [LinkedIn](https://linkedin.com/in/) • 📁 [Portfolio / Website](https://github.com/Hemanshubt)

---

## 🎯 Professional Summary

Results-driven **Full Stack & DevOps Engineer** experienced in architecting scalable web applications, designing resilient microservices, and automating production CI/CD delivery pipelines. Proven track record in building secure, end-to-end cloud platforms with **React 18, TypeScript, Node.js, PostgreSQL**, and orchestrating multi-stage containerized deployments with **Docker, Nginx, and GitHub Actions**. Passionate about developer tooling, infrastructure-as-code, high-throughput backend services, and clean system architecture.

---

## 🛠️ Technical Skills

* **Languages:** TypeScript, JavaScript (ES6+), Python, SQL, Bash / Shell Scripting, HTML5, CSS3
* **Frontend Development:** React 18, Vite, Tailwind CSS, Responsive Design, State Management (Context API / Redux), Recharts, Lucide Icons
* **Backend & API Design:** Node.js, Express.js, RESTful APIs, Zod Schema Validation, JWT Authentication, Helmet, CORS, Morgan
* **DevOps & Cloud:** Docker, Docker Compose, Docker Buildx, Multi-Stage Builds, GitHub Actions (CI/CD), GitHub Container Registry (GHCR), Nginx (Reverse Proxy & Edge Caching), Linux (Ubuntu/Alpine), Let's Encrypt / Certbot, Environment Parity
* **Databases & Storage:** PostgreSQL 15, Supabase (Row-Level Security / RLS, Triggers, Views), Object Storage Buckets, Connection Pooling
* **Practices & Architecture:** Microservices, SPA Routing, Container Health Probing, Non-Root Linux Security, Agile/Scrum, Git Version Control

---

## 🚀 Featured Projects

### **Trackr — Production Job Application & Career Tracker**
*Full Stack & DevOps Engineer* | [GitHub Repository](https://github.com/Hemanshubt/Job-Application-Tracker) | **React 18, TypeScript, Node.js, Express, PostgreSQL, Supabase, Docker, Nginx, GitHub Actions**
* Designed and deployed a full-stack SaaS platform to track multi-stage job pipelines, recruiter interactions, upcoming interviews, and conversion analytics.
* **DevOps & Containerization:** Engineered multi-stage Docker builds cutting production frontend container size to **< 28MB** (Alpine Nginx) and backend runtime to **~180MB** with unprivileged non-root user execution (`USER node`) for vulnerability reduction.
* **Automated CI/CD Pipeline:** Built an automated 3-stage GitHub Actions pipeline (`verify-and-build`, `docker-verify`, `publish-containers`) with layer caching (`type=gha`), auto-publishing immutable containers tagged with Git SHAs to **GitHub Container Registry (GHCR)**.
* **Edge Proxy & Performance:** Configured an Nginx reverse proxy managing API routing (`/api`), SPA fallback, Gzip compression for payloads >1KB, long-term asset caching (`Cache-Control: immutable`), and edge security headers.
* **Backend & Security:** Built a modular Express.js REST API enforced with **Zod** schema validations, Supabase JWT bearer authentication, and PostgreSQL **Row-Level Security (RLS)** policies preventing unauthorized cross-tenant data access.
* **High Availability & Health Checks:** Implemented automated container health check probes (`/api/health` and `/healthz`) in Docker Compose to ensure zero-downtime restarts and failover readiness.

---

### **CloudScale — Containerized Microservices & API Gateway**
*DevOps & Backend Engineer* | **Node.js, Docker, Redis, Nginx, PostgreSQL, GitHub Actions**
* Architected a distributed microservices ecosystem utilizing an Nginx API Gateway with rate limiting, load balancing, and centralized SSL termination.
* Implemented Redis caching layers reducing database query latency by **45%** on read-heavy API endpoints.
* Built automated GitHub Actions CI/CD workflows executing unit/integration test suites, container vulnerability scans (Trivy), and automated staging deployments.
* Enforced environment configuration management via encrypted secrets and twelve-factor app principles.

---

### **SecureVault — Cloud Document Storage with Role-Based Access**
*Full Stack Engineer* | **React, TypeScript, Express, PostgreSQL, Supabase Storage, Docker**
* Built an authenticated document management platform with cryptographic file hashing, presigned URL access, and instant PDF/resume previewing.
* Enforced granular database row-level security policies (RLS) guaranteeing strict tenant isolation for enterprise users.
* Integrated responsive dashboard UI with dark/light theming, drag-and-drop file uploads, and real-time upload progress indicators.

---

## 💼 Experience

### **Full Stack & DevOps Engineer (Independent / Project Engineering)** | *2023 – Present*
* **Architected Full-Lifecycle Web Applications:** Delivered full-stack production software using TypeScript, React, and Node.js, emphasizing test-driven development, modular architecture, and documentation.
* **Infrastructure & CI/CD Automation:** Standardized Dockerized development and production environments across repositories, eliminating "works on my machine" bottlenecks and speeding up deployment cycles by **70%**.
* **Database Optimization:** Structured normalized relational schemas in PostgreSQL, implemented database migrations, custom indexes, and RLS security policies.
* **API Security & Resiliency:** Integrated rate limiting, CORS safeguards, parameterized query sanitation, and structured error-handling middleware across RESTful microservices.

---

## 🎓 Education

### **Bachelor of Engineering / Technology in Computer Science & Engineering**
*Relevant Coursework:* Data Structures & Algorithms, Database Management Systems, Cloud Computing, Operating Systems, Computer Networks, Software Engineering

---

## 📜 Certifications & Achievements

* **Docker & Containerization Fundamentals** — Practical proficiency in Dockerfile optimization, multi-stage builds, and Compose orchestration.
* **CI/CD with GitHub Actions** — Automated linting, test suites, multi-platform Docker builds, and GHCR registry management.
* **Modern Full-Stack Development with TypeScript & React** — Advanced patterns in state management, typed APIs, and component lifecycle architecture.

---

## 🌟 Key Highlights & Strengths

* **End-to-End Ownership:** Ability to take an idea from system design and API architecture to containerized production deployment.
* **DevOps Mindset:** Automated testing, containerization, least-privilege security, and reproducible infrastructure are first-class citizens in every project.
* **Clean Code & Typings:** Strict TypeScript usage across frontend and backend for maintainable, bug-resistant codebases.
