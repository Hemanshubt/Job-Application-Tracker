# Supabase Database Migration & Data Seeding Guide

This guide covers all commands and workflows for managing migrations, applying schema changes, and pushing seed data to your remote **Supabase** database.

---

## 📋 Project Configuration

- **Project Reference ID:** `<YOUR_PROJECT_REF>`
- **Supabase URL:** `https://<YOUR_PROJECT_REF>.supabase.co`
- **Migration Directory:** `supabase/migrations/`
- **Seed File:** `supabase/seed.sql`

---

## 🚀 1. Supabase CLI Setup & Authentication

### Step 1: Login to Supabase CLI
Authenticate your local terminal with your Supabase account:
```bash
npx supabase login
```
*Follow the browser prompt or enter your personal access token.*

### Step 2: Link Repository to Remote Supabase Project
Link your local workspace to your Supabase project:
```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
```
*(If prompted, enter your database password).*

---

## 🔄 2. Database Migration Commands

### Push Migrations to Remote Database
Applies all pending migration files in `supabase/migrations/` to the remote Supabase database:
```bash
npx supabase db push
```

### Check Migration Status
List all migrations and see which ones are applied locally and remotely:
```bash
npx supabase migration list
```

### Create a New Migration File
Generate a new timestamped migration file in `supabase/migrations/`:
```bash
npx supabase migration new <migration_name>
```
*Example:*
```bash
npx supabase migration new add_salary_negotiation_field
```

### Generate Migration from Schema Diff
If you made changes directly via Supabase Dashboard or Studio and want to generate a migration diff:
```bash
npx supabase db diff -f <migration_name>
```

---

## 📦 3. Pushing Seed / Test Data

### Important Note Before Seeding
In [supabase/seed.sql](file:///d:/Course/Project/Job_Tracker/supabase/seed.sql), replace the placeholder `demo_user_id` with your actual user UUID from **Supabase Auth -> Users**:
```sql
demo_user_id UUID := 'YOUR-ACTUAL-AUTH-USER-UUID';
```

---

### Option A: Push via Supabase CLI (Easiest)
We've prepared `supabase/migrations/20261010000002_seed_sample_data.sql` with safe auto-detection of your user. You can push it directly from your terminal:
```bash
npx supabase db push
```
*(Or run `npm run db:push`)*

---

### Option B: Using Supabase Dashboard SQL Editor
1. Open your project's **SQL Editor**:
   👉 `https://supabase.com/dashboard/project/<YOUR_PROJECT_REF>/sql/new`
2. Open and copy the contents of [`supabase/seed.sql`](supabase/seed.sql).
3. Click **Run**. (It automatically links data to your existing auth user, or generates a test user).

---

### Option B: Using psql Direct Connection String
If you have `psql` installed, connect directly using your project connection string from Supabase settings:
```bash
psql "postgresql://postgres.[PROJECT-REF]:[DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" -f supabase/seed.sql
```

---

## 🛠️ 4. Quick Command Cheat Sheet

| Task | Command |
|---|---|
| **CLI Login** | `npx supabase login` |
| **Link Project** | `npx supabase link --project-ref <YOUR_PROJECT_REF>` |
| **Push Migrations to Remote** | `npx supabase db push` |
| **Check Migration Status** | `npx supabase migration list` |
| **Create New Migration** | `npx supabase migration new <name>` |
| **Pull Schema Diff** | `npx supabase db diff -f <name>` |
| **Repair / Skip Migration Version** | `npx supabase migration repair --status applied <version>` |

---

## 💻 5. Local Development (Optional with Docker)

If you have Docker Desktop installed and want to run a completely local Supabase instance:

```bash
# Start local Supabase services
npx supabase start

# View local studio
# http://localhost:54323

# Reset local database (re-runs all migrations and seed.sql)
npx supabase db reset

# Stop local services
npx supabase stop
```
