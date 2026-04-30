import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Business, MenuItem, Question, Rating } from '@/types';
import type { Metadata } from 'next';
import BusinessProfileClient from './BusinessProfileClient';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data } = await (supabase as any)
    .from('businesses')
    .select('name, description')
    .eq('id', params.id)
    .single();
  if (!data) return { title: 'Business Not Found' };
  return {
    title: data.name,
    description: data.description || `View ${data.name} on Market Assistant`,
  };
}

async function getBusinessData(id: string) {
  const supabase = createServerSupabaseClient();
  const db = supabase as any;

  // Fetch business — use neq(false) so null values (newly created) are included
  const { data: business } = await db
    .from('businesses')
    .select('*, owner:users(id, full_name, email, avatar_url)')
    .eq('id', id)
    .neq('is_active', false)
    .single();

  if (!business) return null;

  // Fetch menu items
  const { data: menuItems } = await db
    .from('menu_items')
    .select('*')
    .eq('business_id', id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  // Fetch latest price report per menu item
  const menuItemIds = (menuItems || []).map((m: MenuItem) => m.id);
  const priceReports: Record<string, any> = {};
  if (menuItemIds.length > 0) {
    const { data: reports } = await db
      .from('price_reports')
      .select('*')
      .in('menu_item_id', menuItemIds)
      .order('created_at', { ascending: false });

    (reports || []).forEach((r: any) => {
      if (!priceReports[r.menu_item_id]) {
        priceReports[r.menu_item_id] = r;
      }
    });
  }

  const enrichedMenuItems: MenuItem[] = (menuItems || []).map((item: MenuItem) => ({
    ...item,
    latest_price_report: priceReports[item.id] || null,
  }));

  // Fetch questions with answers
  const { data: questions } = await db
    .from('questions')
    .select(`
      *,
      asker:users(id, full_name, avatar_url),
      answers(
        *,
        answerer:users(id, full_name, avatar_url),
        recommended_business:businesses(id, name)
      )
    `)
    .eq('business_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch ratings
  const { data: ratings } = await db
    .from('ratings')
    .select('*, rater:users(id, full_name, avatar_url)')
    .eq('business_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // NOTE: currentUser is intentionally NOT fetched here.
  // The server client has persistSession:false so getSession() always returns null.
  // BusinessProfileClient loads the current user from the browser after mount.

  return {
    business: business as Business,
    menuItems: enrichedMenuItems,
    questions: (questions || []) as Question[],
    ratings: (ratings || []) as Rating[],
  };
}

export default async function BusinessProfilePage({ params }: PageProps) {
  const data = await getBusinessData(params.id);
  if (!data) notFound();
  return <BusinessProfileClient {...data} />;
}
