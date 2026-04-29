// Middleware helper — just passes requests through
// Full cookie-based session refresh requires @supabase/ssr,
// but for MVP the client-side auth handles sessions fine.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Simply forward the request — client-side Supabase handles auth state
  return NextResponse.next({
    request: { headers: request.headers },
  });
}
