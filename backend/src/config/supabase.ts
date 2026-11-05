import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

const validUrl = (() => {
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' && !url.hostname.includes('demo') &&
      !url.hostname.includes('your-supabase-project');
  } catch {
    return false;
  }
})();

const validAnonKey = Boolean(supabaseAnonKey &&
  !/^(demo|your-|placeholder)/i.test(supabaseAnonKey));
const validServiceKey = Boolean(supabaseServiceKey &&
  !/^(demo|your-|placeholder)/i.test(supabaseServiceKey));

export const isLiveSupabase = validUrl && validAnonKey;

if (isProduction && (!isLiveSupabase || !validServiceKey)) {
  throw new Error(
    'Production requires a valid HTTPS SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

// Mock credentials are permitted only outside production.
export const supabase: SupabaseClient = createClient(
  isLiveSupabase ? supabaseUrl : 'https://demo.supabase.co',
  isProduction ? supabaseServiceKey : (supabaseServiceKey || supabaseAnonKey || 'demo-key'),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

console.log(`[Supabase Config] ${isLiveSupabase ? 'LIVE' : 'LOCAL DEMO'} mode`);
