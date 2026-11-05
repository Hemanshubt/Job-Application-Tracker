# CloudShip Phases 1–3

## Scope
- Secure backend production startup. Missing or placeholder Supabase credentials fail startup.
- Reject missing and demo tokens in production.
- Require frontend Supabase configuration for Vite production builds.
- Build a non-root, multi-stage backend container.
- Compile both apps, run backend auth regression tests, then scan the container in GitHub Actions.

## Local development
```bash
npm run install:all
npm run dev
```

## Verification
```bash
npm ci --prefix backend
npm run build --prefix backend
npm test --prefix backend
npm ci --prefix frontend
VITE_SUPABASE_URL=https://ci-example.supabase.co VITE_SUPABASE_ANON_KEY=ci-public-placeholder-not-a-real-key VITE_API_URL=/api npm run build --prefix frontend
docker build -f docker/backend.Dockerfile -t cloudship-backend:local .
```

## Required production variables
- NODE_ENV=production
- SUPABASE_URL (real HTTPS project URL)
- SUPABASE_ANON_KEY (real publishable/anon key)
- SUPABASE_SERVICE_ROLE_KEY (backend only; do not expose to browser)
- CLIENT_URL (deployed frontend origin)
- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY when building frontend
- VITE_API_URL=/api for CloudFront routing

## Deployment
No AWS resources are created in phases 1–3. CI runs on GitHub and does not have AWS access.

## Follow-up
Enforce branch protection, pin third-party Actions to reviewed SHA versions, add endpoint integration tests against real test Supabase, and implement infrastructure in Phase 4.
