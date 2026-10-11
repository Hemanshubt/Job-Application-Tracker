import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-job-tracker.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const isLiveSupabase = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('demo-job-tracker') &&
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('demo-anon') &&
  !supabaseAnonKey.includes('your-supabase')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
