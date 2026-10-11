-- ============================================================================
-- MIGRATION: 20261010000004_secure_resume_storage_policy.sql
-- Secures the 'resumes' storage bucket:
-- Removes broad SELECT policy and restricts file listing to the owner only.
-- Since the bucket is public, direct file URLs (getPublicUrl) still work seamlessly,
-- but clients cannot enumerate/list other users' files.
-- ============================================================================

-- 1. Remove the broad SELECT policy triggering the Supabase security warning
DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;

-- 2. Restrict SELECT/listing so authenticated users can only list their own files
DROP POLICY IF EXISTS "Users can select their own resume" ON storage.objects;
CREATE POLICY "Users can select their own resume"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
