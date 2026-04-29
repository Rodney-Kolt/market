// Browser-side Supabase client (used in Client Components)
// Uses @supabase/supabase-js directly — works in any environment
import { createClient as _createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton — avoids creating a new client on every component render
let _instance: ReturnType<typeof _createClient> | null = null;

export function createClient() {
  if (!_instance) {
    _instance = _createClient(supabaseUrl, supabaseAnonKey);
  }
  return _instance;
}
