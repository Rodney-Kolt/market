'use client';

// This MUST be a client component — the server-side Supabase client has
// persistSession:false and no cookie access, so getSession() always returns
// null on the server, causing an infinite redirect loop to /auth/login.
// We read auth state from the browser instead.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import OwnerDashboard from './OwnerDashboard';
import CustomerDashboard from './CustomerDashboard';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      // getUser() hits the Supabase Auth server — more reliable than getSession()
      const { data: { user: authUser }, error } = await supabase.auth.getUser();

      if (error || !authUser) {
        router.replace('/auth/login');
        return;
      }

      // Fetch the profile row from public.users
      const { data: profile, error: profileError } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        // Profile row missing — create it then retry
        await (supabase as any).from('users').upsert({
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: authUser.user_metadata?.role || 'customer',
        });

        // Re-fetch after upsert
        const { data: retryProfile } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (retryProfile) {
          setUser(retryProfile as User);
        } else {
          router.replace('/auth/login');
        }
      } else {
        setUser(profile as User);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) return <PageLoader />;
  if (!user) return null;

  if (user.role === 'business_owner') {
    return <OwnerDashboard user={user} />;
  }

  return <CustomerDashboard user={user} />;
}
