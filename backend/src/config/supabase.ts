import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isLiveSupabase = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseUrl.includes('demo-job-tracker') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('your-supabase')
);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseServiceKey || 'demo-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

console.log(
  `[Supabase Config] Running in ${
    isLiveSupabase ? 'LIVE SUPABASE' : 'DEVELOPMENT DEMO MOCK'
  } mode`
);
