import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Handles the OAuth callback redirect from Supabase (Google, email magic link, etc.)
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Determine the base URL: prefer NEXT_PUBLIC_APP_URL, fall back to request origin
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${requestUrl.protocol}//${requestUrl.host}`;

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile row exists in public.users
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('users').upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          role: data.user.user_metadata?.role || 'customer',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    }
  }

  // Always redirect to dashboard (or the `next` param if provided)
  return NextResponse.redirect(`${appUrl}${next}`);
}
