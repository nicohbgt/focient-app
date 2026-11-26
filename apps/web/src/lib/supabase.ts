import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bpkljbdtxmcgmfovdvia.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_P8-ut9YZbhAimobp6_EDMw_-hx_g7u1';

/**
 * FoCient Supabase Client Instance
 * Configured with PKCE flow and URL session detection for seamless Google OAuth.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
