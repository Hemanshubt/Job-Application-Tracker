# Trackr — Supabase Database Architecture & Migrations

This document details the database architecture, schema migrations, and CLI commands for the **Trackr (Job Application Tracker)** Supabase backend.

---

## 📌 Project Overview & Configuration

- **Supabase Project Reference:** `<YOUR_PROJECT_REF>`
- **Dashboard URL:** `https://supabase.com/dashboard/project/<YOUR_PROJECT_REF>`
- **API URL:** `https://<YOUR_PROJECT_REF>.supabase.co`
- **Migrations Path:** [`supabase/migrations/`](./migrations)
- **Seed Script:** [`supabase/seed.sql`](./seed.sql)

---

## 📜 Applied Migrations Log

Both migrations have been applied to the remote Supabase database:

| Version | Migration File | Description | Status |
|---|---|---|---|
| `20261010` | [`20261010_001_initial_schema.sql`](./migrations/20261010_001_initial_schema.sql) | Base schema: 7 tables, RLS policies, indexes, auto-update & auth triggers | **Applied** ✅ |
| `20261010000002` | [`20261010000002_seed_sample_data.sql`](./migrations/20261010000002_seed_sample_data.sql) | Sample seed data: Stripe, Linear, Vercel, Figma, Datadog, Airbnb + tasks/notes | **Applied** ✅ |
| `20261010000003` | [`20261010000003_resume_storage.sql`](./migrations/20261010000003_resume_storage.sql) | Resume storage bucket (`resumes`), storage RLS policies, `resume_url` columns | **Applied** ✅ |
| `20261010000004` | [`20261010000004_secure_resume_storage_policy.sql`](./migrations/20261010000004_secure_resume_storage_policy.sql) | Security fix: Restrict SELECT to file owners only, resolving public listing advisory | **Applied** ✅ |
| `20261010000005` | [`20261010000005_security_hardening.sql`](./migrations/20261010000005_security_hardening.sql) | Security fix: Pin explicit search_path on triggers to prevent privilege escalation | **Ready to Push** 🚀 |

---

## 🏗️ Database Tables & Schema

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 auth.users (Supabase)                           │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ 1:1
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 public.profiles                                 │
│  id (UUID PK) • email • full_name • avatar_url • target_role • preferences      │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ 1:N
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               public.applications                               │
│  id (UUID PK) • company • job_title • status • salary_min/max • applied_date    │
└────────┬─────────────────────────────┬────────────────────────────┬─────────────┘
         │ 1:N                         │ 1:N                        │ 1:N
         ▼                             ▼                            ▼
┌──────────────────┐          ┌──────────────────┐         ┌──────────────────────┐
│public.interviews │          │ public.tasks     │         │public.recruiters     │
│round_name • date │          │title • priority  │         │name • company • email│
└──────────────────┘          └──────────────────┘         └──────────────────────┘
```

### Table Summary:
1. **`public.profiles`**: Extends `auth.users` with display name, headline, avatar, and UI preferences (JSONB).
2. **`public.applications`**: Main job application entities (stages: `Applied`, `Screening`, `Interview`, `Offer`, `Accepted`, `Rejected`, `Withdrawn`).
3. **`public.interviews`**: Scheduled interview rounds with duration, meeting link, prep notes, and outcome.
4. **`public.recruiters`**: Contacts & talent partners with follow-up tracking dates.
5. **`public.tasks`**: Action items and reminders categorized by priority (`Urgent`, `High`, `Medium`, `Low`).
6. **`public.application_notes`**: Private notes per application.
7. **`public.activity_logs`**: Chronological event logs for timeline tracking.

---

## 🔒 Row-Level Security (RLS)

All tables enforce PostgreSQL **Row-Level Security (RLS)**:
- Users can **only read, insert, update, and delete** their own records (`auth.uid() = user_id`).
- Foreign keys cascade on delete (`ON DELETE CASCADE`) to prevent orphaned records.

---

## 💻 CLI Commands & Workflow

### 1. Authenticate & Link
```bash
# Login to Supabase CLI
npx supabase login

# Link repository to remote Supabase project
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

### 2. Push Pending Migrations
```bash
npx supabase db push
```
*(Or run `npm run db:push` from project root)*

### 3. Check Migration Status
```bash
npx supabase migration list
```
*(Or run `npm run db:status`)*

### 4. Create a New Migration
```bash
npx supabase migration new <migration_name>
```

---

## 🛠️ NPM Script Shortcuts

Configured in the root [`package.json`](../package.json):

```bash
npm run db:push    # Push all migrations to remote database
npm run db:status  # Check migration status between local & remote
npm run db:link    # Re-link project to remote Supabase reference
```
