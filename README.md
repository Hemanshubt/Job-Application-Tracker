# Trackr — Production Job Application Tracker

A high-performance, dark-dashboard **Job Application Tracker** engineered for modern job seekers. Track pipeline stages, schedule interview rounds, manage recruiter contacts, maintain timestamped activity logs, and analyze application-to-offer conversion rates with real database metrics.

Inspired by **Linear**, **Vercel**, and modern SaaS engineering standards.

---

## 1. Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 18 + VITE FRONTEND                 │
│  Tailwind CSS • shadcn/ui Design Tokens • Lucide • Recharts │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JWT Auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS + TYPESCRIPT BACKEND              │
│   Zod Validation • CORS • Helmet • Morgan • Supabase Auth   │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Driver / RLS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE POSTGRESQL DATABASE                │
│  Profiles • Applications • Interviews • Recruiters • Tasks  │
│  Notes • Activity Logs • Row Level Security (RLS) Triggers  │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Axios, date-fns
- **Backend:** Node.js, Express, TypeScript, Zod, Helmet, Morgan, CORS, `@supabase/supabase-js`
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) and Supabase Auth
- **Design System:** Charcoal/deep navy dark mode, subtle borders, soft glows, keyboard shortcuts, skeleton loaders, and accessible dialogs

---

## 2. Directory Structure

```
Job_Tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts           # Supabase client & live detection
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT bearer token & dev fallback
│   │   │   ├── errorHandler.ts       # Centralized error handler
│   │   │   └── validate.ts           # Zod schema request validation
│   │   ├── routes/
│   │   │   ├── activityRoutes.ts     # /api/activity
│   │   │   ├── analyticsRoutes.ts    # /api/analytics
│   │   │   ├── applicationRoutes.ts  # /api/applications
│   │   │   ├── interviewRoutes.ts    # /api/interviews
│   │   │   ├── noteRoutes.ts         # /api/notes
│   │   │   ├── profileRoutes.ts      # /api/profile
│   │   │   ├── recruiterRoutes.ts    # /api/recruiters
│   │   │   └── taskRoutes.ts         # /api/tasks
│   │   ├── schemas/
│   │   │   └── validation.ts         # Zod schemas for all entities
│   │   ├── services/
│   │   │   ├── activityService.ts
│   │   │   ├── analyticsService.ts   # Conversion rates & distributions
│   │   │   ├── applicationService.ts # CRUD, search, filter, sort
│   │   │   ├── interviewService.ts   # Scheduling & countdowns
│   │   │   ├── noteService.ts
│   │   │   ├── profileService.ts
│   │   │   ├── recruiterService.ts
│   │   │   ├── store.ts              # In-memory realistic seed store
│   │   │   └── taskService.ts
│   │   ├── types/
│   │   │   └── index.ts              # Strict TypeScript models
│   │   └── server.ts                 # Express entrypoint (Port 5000)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── applications/
│   │   │   │   └── ApplicationModal.tsx  # Add / Edit application modal
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx    # Auth route guard
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx         # Responsive dashboard shell
│   │   │   │   ├── Navbar.tsx            # In-app reminders bell & quick add
│   │   │   │   └── Sidebar.tsx           # Collapsible SaaS navigation
│   │   │   └── ui/
│   │   │       ├── Badge.tsx             # Status, priority & outcome badges
│   │   │       ├── Button.tsx            # Styled buttons with loading state
│   │   │       ├── Card.tsx              # Modern dashboard cards
│   │   │       ├── ConfirmDialog.tsx     # Accessible delete confirmation
│   │   │       ├── EmptyState.tsx        # Contextual empty state displays
│   │   │       ├── Input.tsx             # Validated input fields
│   │   │       ├── Modal.tsx             # Accessible dialogs
│   │   │       ├── Select.tsx
│   │   │       ├── Skeleton.tsx          # Shimmer loaders
│   │   │       └── Textarea.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx           # Supabase Auth + local session
│   │   │   └── ToastContext.tsx          # Toast notifications system
│   │   ├── lib/
│   │   │   ├── api.ts                    # Typed Axios client & interceptor
│   │   │   ├── supabase.ts               # Browser Supabase client
│   │   │   └── utils.ts                  # cn, currency & date formatters
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── AnalyticsPage.tsx         # Conversion funnel & charts
│   │   │   ├── ApplicationDetailsPage.tsx # 6-tab application hub
│   │   │   ├── ApplicationsPage.tsx      # Table and Grid view with filters
│   │   │   ├── ContactsPage.tsx          # Recruiter directory
│   │   │   ├── DashboardPage.tsx         # Personalized overview & KPIs
│   │   │   ├── InterviewsPage.tsx        # Scheduled & past rounds
│   │   │   ├── KanbanPage.tsx            # Drag-and-drop pipeline board
│   │   │   ├── NotFoundPage.tsx          # 404 page
│   │   │   ├── SettingsPage.tsx          # Preferences & notification setup
│   │   │   └── TasksPage.tsx             # Action items & reminders
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                       # Main router
│   │   ├── index.css                     # Tailwind tokens & dark theme
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 20261010_001_initial_schema.sql  # Full DDL, RLS, Indexes, Triggers
│   └── seed.sql                             # Comprehensive seed data
├── .gitignore
├── package.json                             # Monorepo runner scripts
└── README.md
```

---

## 3. Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Install all dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate into `backend` and `frontend` individually and run `npm install`).*

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both folders:

**`backend/.env`:**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`:**
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000/api
```

> **Zero-Config Local Dev Mode:** If you do not have Supabase credentials yet, leave the default placeholder values. The app automatically enters **Development Demo Mode** with rich sample data (Stripe, Linear, Vercel, Figma) and full interactive functionality!

### 3. Run Locally
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1 - Backend API (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend Dashboard (http://localhost:5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 4. Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/migrations/20261010_001_initial_schema.sql`](supabase/migrations/20261010_001_initial_schema.sql).
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate sample test data.
5. In **Project Settings → API**, copy your **Project URL** and **anon public key** into your `.env` files.

### Database Tables & Security
- **`profiles`:** User settings, preferred currency, target roles, bio.
- **`applications`:** Company, job title, salary range, location mode, pipeline status, dates, fit rating.
- **`interviews`:** Round names, interview types, scheduled timestamps, video links, prep notes, outcomes.
- **`recruiters`:** Contact names, emails, phone numbers, LinkedIn URLs, follow-up dates.
- **`tasks`:** Action items, priority levels (`Low`, `Medium`, `High`, `Urgent`), reminders, completion status.
- **`application_notes`:** Timestamped private notes per opportunity.
- **`activity_logs`:** Audit trail for status changes, scheduled rounds, and milestones.

All tables have **Row Level Security (RLS)** enabled ensuring users can only read and modify their own records.

---

## 5. Backend REST API Endpoints

All protected endpoints require an `Authorization: Bearer <token>` header:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & uptime |
| `GET` | `/api/applications` | List applications with search, multi-filter, pagination, sort |
| `GET` | `/api/applications/:id` | Full application detail with joined interviews, tasks, notes |
| `POST` | `/api/applications` | Create new job application |
| `PUT` | `/api/applications/:id` | Update existing application |
| `PATCH`| `/api/applications/:id/status` | Advance/move application stage |
| `DELETE`| `/api/applications/:id` | Delete application and cascade associations |
| `GET` | `/api/interviews` | List interview rounds (filter by `application_id`) |
| `GET` | `/api/interviews/upcoming` | Retrieve nearest scheduled interviews |
| `POST` | `/api/interviews` | Schedule an interview round |
| `PUT` | `/api/interviews/:id` | Update interview details or outcome |
| `DELETE`| `/api/interviews/:id` | Delete interview |
| `GET` | `/api/recruiters` | List recruiter contacts |
| `POST` | `/api/recruiters` | Save new recruiter |
| `PUT` | `/api/recruiters/:id` | Update recruiter contact |
| `DELETE`| `/api/recruiters/:id` | Delete recruiter |
| `GET` | `/api/tasks` | List tasks (filter by `is_completed`, `application_id`) |
| `POST` | `/api/tasks` | Create task / reminder |
| `PATCH`| `/api/tasks/:id/toggle` | Toggle completion status |
| `PUT` | `/api/tasks/:id` | Update task details |
| `DELETE`| `/api/tasks/:id` | Delete task |
| `GET` | `/api/notes?application_id=:id` | List timestamped notes |
| `POST` | `/api/notes` | Add note |
| `DELETE`| `/api/notes/:id` | Delete note |
| `GET` | `/api/activity` | Retrieve recent activity audit trail |
| `GET` | `/api/analytics` | Compute pipeline metrics, conversion rates, and chart data |
| `GET` | `/api/profile` | Get candidate profile |
| `PUT` | `/api/profile` | Update candidate profile & preferences |

---

## 6. Verification & Feature Checklist

- [x] **Authentication:** Email & Password sign-up, sign-in, password reset, demo login shortcut, session persistence.
- [x] **Dashboard:** Real database metrics, Recharts monthly bar chart & status donut chart, interview rate, upcoming interviews, active tasks, activity logs.
- [x] **Job Application Management:** Multi-filter (Status, Workplace, Job Type), search, sort, Table View & Card View toggle, add/edit modal, delete confirmation.
- [x] **Pipeline Workflow:** `Applied` → `Screening` → `Interview` → `Offer` → `Accepted` + `Rejected` / `Withdrawn`.
- [x] **Kanban Board:** Drag-and-drop between columns, quick advance buttons, stage counts.
- [x] **Interview Management:** Round scheduling, countdown badges, meeting video URLs, panel contacts, prep notes, outcome tracking (`Scheduled`, `Completed`, `Passed`, `Failed`, `Cancelled`).
- [x] **Recruiter Directory:** Contact information, LinkedIn URLs, last contact date, next follow-up dates, notes.
- [x] **Tasks & Reminders:** Priorities (`Low`, `Medium`, `High`, `Urgent`), overdue alerts, checkbox toggle, header notification center with active reminders.
- [x] **Application Details Page:** 6 dedicated tabs: Overview, Interviews, Tasks, Recruiters, Notes, Activity History.
- [x] **Analytics Hub:** Conversion funnel (App-to-Interview %, Interview-to-Offer %), status breakdown, monthly trends, workplace mode and employment type percentages.
- [x] **Settings & Preferences:** Candidate headline, target roles, currency selection, default view, external notifications documentation.
- [x] **UI/UX Aesthetics:** Dark dashboard inspired by Linear/Vercel, subtle borders, soft shadows, custom scrollbars, keyboard navigation shortcuts, toast notifications.

---

## 7. Production Deployment & DevOps Architecture

> 📖 **Comprehensive Guides:**
> - For full DevOps pipelines, multi-stage Docker builds, Nginx reverse proxy, and GitHub Actions CI/CD, refer to [**`DEVOPS.md`**](DEVOPS.md).
> - For step-by-step VPS, EC2, and Docker Compose deployment instructions, refer to [**`DEPLOYMENT.md`**](DEPLOYMENT.md).


### Frontend (Vercel)
1. Push repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set Root Directory to `frontend`.
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (points to your deployed backend API)
5. Deploy.

### Backend (Render / Railway / Fly.io)
1. Set Root Directory to `backend`.
2. Build command: `npm run build`
3. Start command: `npm start`
4. Add environment variables:
   - `PORT=5000`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_URL` (points to your Vercel frontend domain)
