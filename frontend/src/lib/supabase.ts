import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-job-tracker.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const isLiveSupabase = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('demo-job-tracker') &&
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseAnonKey &&
  !/^(demo|your-|placeholder)/i.test(supabaseAnonKey)
);

// Production frontend must never silently render the local demo account.
if (import.meta.env.PROD && !isLiveSupabase) {
  throw new Error('CloudShip production requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});
