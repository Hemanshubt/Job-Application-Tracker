-- ============================================================================
-- MIGRATION: 20261010000002_seed_sample_data.sql
-- Seed realistic test data (Stripe, Linear, Vercel, Figma, Datadog, Airbnb)
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID;
    existing_count INT;
    app_stripe_id UUID := gen_random_uuid();
    app_linear_id UUID := gen_random_uuid();
    app_vercel_id UUID := gen_random_uuid();
    app_figma_id UUID := gen_random_uuid();
    app_datadog_id UUID := gen_random_uuid();
    app_airbnb_id UUID := gen_random_uuid();
BEGIN
    -- 1. Automatically link to first registered user, or create demo auth user
    SELECT id INTO demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

    IF demo_user_id IS NULL THEN
        demo_user_id := '00000000-0000-0000-0000-000000000001';
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            demo_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'demo@trackr.dev',
            '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRyp.QbzmpKsHQnp1rfypE5gHhM7G', -- bcrypt hash of 'Password123!'
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Demo User"}'::jsonb,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, full_name, avatar_url, target_role, location)
    VALUES (
        demo_user_id,
        'demo@trackr.dev',
        'Demo User',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        'Senior Full Stack Engineer',
        'San Francisco, CA'
    )
    ON CONFLICT (id) DO UPDATE
    SET target_role = COALESCE(public.profiles.target_role, EXCLUDED.target_role);

    -- Avoid duplicate inserts if user already has seeded applications
    SELECT COUNT(*) INTO existing_count FROM public.applications WHERE user_id = demo_user_id;
    IF existing_count > 0 THEN
        RAISE NOTICE 'Applications already exist for user %, skipping seed.', demo_user_id;
        RETURN;
    END IF;

    -- 2. Applications
    INSERT INTO public.applications (id, user_id, company, job_title, location, location_type, job_type, salary_min, salary_max, salary_currency, job_url, status, applied_date, deadline, description, notes, rating)
    VALUES
    (
        app_stripe_id, demo_user_id, 'Stripe', 'Senior Full Stack Engineer', 'San Francisco, CA', 'Hybrid', 'Full-time', 185000, 220000, 'USD',
        'https://stripe.com/jobs/senior-full-stack', 'Interview', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days',
        'Working on core checkout flows and developer experience APIs.', 'Spoke with hiring manager, round 2 technical scheduled.', 5
    ),
    (
        app_linear_id, demo_user_id, 'Linear', 'Frontend Engineer (Design Systems)', 'Remote', 'Remote', 'Full-time', 170000, 205000, 'USD',
        'https://linear.app/careers/frontend', 'Offer', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE + INTERVAL '5 days',
        'Crafting ultra-fast, keyboard-driven UI components in React and TypeScript.', 'Received written offer! Reviewing compensation package.', 5
    ),
    (
        app_vercel_id, demo_user_id, 'Vercel', 'Staff Solutions Architect', 'New York, NY', 'Hybrid', 'Full-time', 200000, 240000, 'USD',
        'https://vercel.com/careers', 'Screening', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '15 days',
        'Empowering enterprise customers to build modern Next.js micro-frontends.', 'Recruiter screen went great, waiting for tech screen calendar link.', 4
    ),
    (
        app_figma_id, demo_user_id, 'Figma', 'Product Engineer', 'San Francisco, CA', 'On-site', 'Full-time', 175000, 215000, 'USD',
        'https://figma.com/careers', 'Applied', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '20 days',
        'Building collaborative canvas tools and plugin extensibility platform.', 'Applied through referral by Alex.', 4
    ),
    (
        app_datadog_id, demo_user_id, 'Datadog', 'Backend Systems Engineer', 'Boston, MA', 'Hybrid', 'Full-time', 160000, 195000, 'USD',
        'https://datadoghq.com/careers', 'Rejected', CURRENT_DATE - INTERVAL '30 days', NULL,
        'High-throughput distributed telemetry processing pipelines.', 'Role closed due to internal hire restructuring.', 3
    ),
    (
        app_airbnb_id, demo_user_id, 'Airbnb', 'Senior Software Engineer, Core Services', 'Remote', 'Remote', 'Full-time', 190000, 230000, 'USD',
        'https://airbnb.com/careers', 'Accepted', CURRENT_DATE - INTERVAL '45 days', NULL,
        'Distributed systems and host monetization platforms.', 'Accepted early offer last cycle.', 5
    );

    -- 3. Interviews
    INSERT INTO public.interviews (application_id, user_id, round_name, interview_type, scheduled_at, duration_minutes, interviewer_names, interviewer_emails, meeting_url, prep_notes, outcome)
    VALUES
    (
        app_stripe_id, demo_user_id, 'System Design & Distributed Data', 'System Design', NOW() + INTERVAL '2 days' + INTERVAL '3 hours', 60,
        'Marcus Vance (Principal Architect)', 'marcus@stripe.com', 'https://meet.google.com/xyz-stripe-interview',
        'Focus on idempotent payments, database sharding, and reconciliation workers.', 'Scheduled'
    ),
    (
        app_stripe_id, demo_user_id, 'Technical Coding Round', 'Technical', NOW() - INTERVAL '5 days', 60,
        'Elena Rostova (Staff SWE)', 'elena@stripe.com', 'https://zoom.us/j/123456789',
        'Live coding on stateful concurrency and caching.', 'Passed'
    ),
    (
        app_linear_id, demo_user_id, 'Founder & Culture Chat', 'Final Round', NOW() - INTERVAL '4 days', 45,
        'Karri Saarinen & Tuomas Artman', 'team@linear.app', 'https://meet.google.com/lin-chat',
        'Product philosophy, speed obsession, craft and minimalism.', 'Passed'
    );

    -- 4. Recruiters
    INSERT INTO public.recruiters (user_id, application_id, name, company, title, email, phone, linkedin_url, last_contact_date, next_followup_date, notes)
    VALUES
    (
        demo_user_id, app_stripe_id, 'Sarah Jenkins', 'Stripe', 'Senior Technical Recruiter', 'sjenkins@stripe.com', '+1 (415) 890-1234',
        'https://linkedin.com/in/sarahjenkins-recruiter', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days',
        'Super responsive on Slack and email. Prefers scheduling via Calendly.'
    ),
    (
        demo_user_id, app_linear_id, 'David Chen', 'Linear', 'Head of Talent', 'david@linear.app', '+1 (650) 456-7890',
        'https://linkedin.com/in/davidchentalent', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days',
        'Sent offer letter details, awaiting my decision by Friday.'
    ),
    (
        demo_user_id, app_vercel_id, 'Jessica Alba', 'Vercel', 'Lead Talent Partner', 'jalba@vercel.com', '+1 (917) 333-8899',
        'https://linkedin.com/in/jessica-talent-lead', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '2 days',
        'Discussed expectations and remote stipend benefit structure.'
    );

    -- 5. Tasks
    INSERT INTO public.tasks (user_id, application_id, title, description, task_type, priority, due_date, is_completed, reminder_at)
    VALUES
    (
        demo_user_id, app_stripe_id, 'Prepare distributed transactions study notes', 'Review Two-Phase Commit, Saga pattern, and Outbox Pattern for Stripe interview',
        'Interview Prep', 'Urgent', NOW() + INTERVAL '1 day', false, NOW() + INTERVAL '18 hours'
    ),
    (
        demo_user_id, app_linear_id, 'Review equity and health insurance benefits', 'Compare 401k match and stock options with market standards before signing',
        'Offer Review', 'High', NOW() + INTERVAL '3 days', false, NOW() + INTERVAL '2 days'
    ),
    (
        demo_user_id, app_vercel_id, 'Send thank you note to Jessica', 'Send concise follow-up email confirming availability for technical panel next week',
        'Follow-up', 'Medium', NOW() + INTERVAL '12 hours', false, NOW() + INTERVAL '6 hours'
    ),
    (
        demo_user_id, app_stripe_id, 'Completed DSA brush up on LeetCode Graphs', 'Finished topological sort and Dijkstra problems',
        'Interview Prep', 'Medium', NOW() - INTERVAL '6 days', true, NULL
    );

    -- 6. Application Notes
    INSERT INTO public.application_notes (application_id, user_id, content)
    VALUES
    (
        app_stripe_id, demo_user_id, 'Hiring manager emphasized high ownership and strong taste in API design (REST + idempotency tokens).'
    ),
    (
        app_linear_id, demo_user_id, 'Base: $185k + $40k equity/yr. Unlimited PTO. $3k home office budget provided.'
    );

    -- 7. Activity Logs
    INSERT INTO public.activity_logs (user_id, application_id, action_type, title, description, metadata)
    VALUES
    (
        demo_user_id, app_linear_id, 'STATUS_CHANGE', 'Status changed to Offer', 'Linear moved application to Offer stage', '{"old_status": "Interview", "new_status": "Offer"}'::jsonb
    ),
    (
        demo_user_id, app_stripe_id, 'INTERVIEW_SCHEDULED', 'Scheduled System Design Interview', 'Round 2 scheduled with Marcus Vance for upcoming Thursday', '{"round": "System Design"}'::jsonb
    ),
    (
        demo_user_id, app_vercel_id, 'APPLICATION_CREATED', 'Applied to Vercel', 'Submitted application for Staff Solutions Architect', '{}'::jsonb
    );

END $$;
