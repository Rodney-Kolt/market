// Server-side Supabase client (used in Server Components / Route Handlers)
// Uses @supabase/supabase-js directly — no SSR package needed
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creates a fresh client per request (no cookie-based auth for server components in this setup)
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Disable auto-refresh and session persistence on the server
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
