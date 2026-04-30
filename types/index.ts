// ============================================================
// Market Assistant – Shared TypeScript Types
// ============================================================

export type UserRole = 'customer' | 'business_owner';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  logo_url: string | null;
  // General category (replaces food-only cuisine_type)
  category: string | null;
  // Keep cuisine_type for backward compat but treat as alias
  cuisine_type: string | null;
  price_range: PriceRange | null;
  dietary_options: string[] | null;
  rating_avg: number;
  rating_count: number;
  transparency_score: number;
  is_active: boolean;
  created_at: string;
  // joined fields
  owner?: User;
}

export interface MenuItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  is_available_today: boolean;
  dietary_tags: string[] | null;
  created_at: string;
  // joined
  latest_price_report?: PriceReport | null;
}

export interface Question {
  id: string;
  business_id: string;
  asker_id: string;
  question_text: string;
  created_at: string;
  // joined
  asker?: User;
  answers?: Answer[];
  answer_count?: number;
  // joined business (for dashboard)
  business?: { id: string; name: string } | null;
}

export interface Answer {
  id: string;
  question_id: string;
  answerer_id: string;
  recommended_business_id: string | null;
  answer_text: string;
  upvotes: number;
  created_at: string;
  // joined
  answerer?: User;
  recommended_business?: Business;
}

export interface Rating {
  id: string;
  business_id: string;
  rater_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  // joined
  rater?: User;
  business?: { id: string; name: string } | null;
}

export interface PriceReport {
  id: string;
  business_id: string;
  menu_item_id: string | null;
  reporter_id: string | null;
  reported_price: number;
  location_verified: boolean;
  service_name: string | null;
  created_at: string;
}

// Badge thresholds
export type BadgeTier = 'bronze' | 'silver' | 'gold' | null;

export function getBadgeTier(ratingCount: number): BadgeTier {
  if (ratingCount >= 100) return 'gold';
  if (ratingCount >= 20)  return 'silver';
  if (ratingCount >= 5)   return 'bronze';
  return null;
}

// Search / filter params
export interface BusinessFilters {
  query?: string;
  category?: string;
  // keep for backward compat
  cuisine_type?: string;
  price_range?: PriceRange;
  dietary_option?: string;
  min_rating?: number;
  sort_by?: 'rating' | 'newest' | 'name';
}

// Search result types for homepage
export interface SearchResult {
  businesses: Business[];
  answers: AnswerSearchResult[];
}

export interface AnswerSearchResult {
  id: string;
  answer_text: string;
  question_text: string;
  business_name: string;
  business_id: string;
  answerer_name: string | null;
  created_at: string;
}
