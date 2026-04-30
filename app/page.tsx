import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Business } from '@/types';
import HomepageClient from './HomepageClient';

async function getTopBusinesses(): Promise<Business[]> {
  const supabase = createServerSupabaseClient();
  // Use neq(false) so businesses with is_active=null (newly created) are included
  const { data } = await (supabase as any)
    .from('businesses')
    .select('*')
    .neq('is_active', false)
    .order('created_at', { ascending: false })
    .limit(6);
  return (data as Business[]) || [];
}

export default async function HomePage() {
  const topBusinesses = await getTopBusinesses();
  return <HomepageClient topBusinesses={topBusinesses} />;
}
