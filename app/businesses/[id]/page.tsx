import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Business, MenuItem, Question, Rating, User } from '@/types';
import type { Metadata } from 'next';
import BusinessProfileClient from './BusinessProfileClient';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('businesses').select('name, description').eq('id', params.id).single();
  if (!data) return { title: 'Business Not Found' };
  return {
    title: data.name,
    description: data.description || `View ${data.name} on Market Assistant`,
  };
}

async function getBusinessData(id: string) {
  const supabase = createServerSupabaseClient();

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('*, owner:users(id, full_name, email, avatar_url)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!business) return null;

  // Fetch menu items with latest price report
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('business_id', id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  // Fetch latest price report per menu item
  const menuItemIds = (menuItems || []).map((m: MenuItem) => m.id);
  let priceReports: Record<string, any> = {};
  if (menuItemIds.length > 0) {
    const { data: reports } = await supabase
      .from('price_reports')
      .select('*')
      .in('menu_item_id', menuItemIds)
      .order('created_at', { ascending: false });

    // Keep only the latest report per item
    (reports || []).forEach((r: any) => {
      if (!priceReports[r.menu_item_id]) {
        priceReports[r.menu_item_id] = r;
      }
    });
  }

  // Attach price reports to menu items
  const enrichedMenuItems: MenuItem[] = (menuItems || []).map((item: MenuItem) => ({
    ...item,
    latest_price_report: priceReports[item.id] || null,
  }));

  // Fetch questions with answers and asker info
  const { data: questions } = await supabase
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

  // Fetch ratings with rater info
  const { data: ratings } = await supabase
    .from('ratings')
    .select('*, rater:users(id, full_name, avatar_url)')
    .eq('business_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();
  let currentUser: User | null = null;
  let userRating: Rating | null = null;

  if (session?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    currentUser = userData as User;

    // Check if user already rated this business
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('*')
      .eq('business_id', id)
      .eq('rater_id', session.user.id)
      .single();
    userRating = existingRating as Rating;
  }

  return {
    business: business as Business,
    menuItems: enrichedMenuItems,
    questions: (questions || []) as Question[],
    ratings: (ratings || []) as Rating[],
    currentUser,
    userRating,
  };
}

export default async function BusinessProfilePage({ params }: PageProps) {
  const data = await getBusinessData(params.id);
  if (!data) notFound();

  return <BusinessProfileClient {...data} />;
}
