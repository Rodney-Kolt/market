import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@/types';
import OwnerDashboard from './OwnerDashboard';
import CustomerDashboard from './CustomerDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user) redirect('/auth/login');

  const currentUser = user as User;

  if (currentUser.role === 'business_owner') {
    return <OwnerDashboard user={currentUser} />;
  }

  return <CustomerDashboard user={currentUser} />;
}
