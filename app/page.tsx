import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Business } from '@/types';
import HomepageClient from './HomepageClient';

async function getTopBusinesses(): Promise<Business[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await (supabase as any)
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('rating_avg', { ascending: false })
    .limit(6);
  return (data as Business[]) || [];
}

export default async function HomePage() {
  const topBusinesses = await getTopBusinesses();
  return <HomepageClient topBusinesses={topBusinesses} />;
}
