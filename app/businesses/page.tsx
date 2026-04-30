import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Business, BusinessFilters } from '@/types';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessFiltersPanel from '@/components/business/BusinessFiltersPanel';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/ui/SearchBar';
import SortSelect from '@/components/ui/SortSelect';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Browse Businesses' };

interface PageProps {
  searchParams: {
    query?: string;
    category?: string;
    cuisine_type?: string;
    price_range?: string;
    dietary_option?: string;
    min_rating?: string;
    sort_by?: string;
    view?: string;
  };
}

async function getBusinesses(filters: BusinessFilters): Promise<Business[]> {
  const supabase = createServerSupabaseClient();
  const db = supabase as any;

  // Use neq(false) instead of eq(true) so businesses with is_active=null are included.
  // New businesses created without explicitly setting is_active default to null in some
  // Supabase setups, causing eq(true) to silently exclude them.
  let query = db
    .from('businesses')
    .select('*')
    .neq('is_active', false);

  if (filters.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,category.ilike.%${filters.query}%,cuisine_type.ilike.%${filters.query}%`
    );
  }

  if (filters.category) {
    query = query.or(
      `category.ilike.%${filters.category}%,cuisine_type.ilike.%${filters.category}%`
    );
  } else if (filters.cuisine_type) {
    query = query.or(
      `category.ilike.%${filters.cuisine_type}%,cuisine_type.ilike.%${filters.cuisine_type}%`
    );
  }

  if (filters.price_range)    query = query.eq('price_range', filters.price_range);
  if (filters.dietary_option) query = query.contains('dietary_options', [filters.dietary_option]);
  if (filters.min_rating)     query = query.gte('rating_avg', filters.min_rating);

  // Default sort: newest first so new businesses are visible immediately.
  // Users can switch to "Top Rated" or "A–Z" via the sort control.
  switch (filters.sort_by) {
    case 'rating':
      query = query.order('rating_avg', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('getBusinesses error:', error);
    return [];
  }

  return (data as Business[]) || [];
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const filters: BusinessFilters = {
    query:          searchParams.query,
    category:       searchParams.category,
    cuisine_type:   searchParams.cuisine_type,
    price_range:    searchParams.price_range as BusinessFilters['price_range'],
    dietary_option: searchParams.dietary_option,
    min_rating:     searchParams.min_rating ? parseFloat(searchParams.min_rating) : undefined,
    sort_by:        searchParams.sort_by as BusinessFilters['sort_by'],
  };

  const businesses = await getBusinesses(filters);
  const view = (searchParams.view as 'grid' | 'list') || 'grid';
  const hasFilters = !!(
    filters.query || filters.category || filters.cuisine_type ||
    filters.price_range || filters.dietary_option || filters.min_rating
  );
  const activeQuery = filters.query || filters.category || filters.cuisine_type;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Businesses</h1>
        <p className="text-gray-500">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
          {activeQuery && (
            <span> for &ldquo;<strong>{activeQuery}</strong>&rdquo;</span>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar defaultValue={filters.query} className="max-w-2xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <BusinessFiltersPanel currentFilters={filters} />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <ViewToggle view={view} searchParams={searchParams} />
            <SortSelect current={filters.sort_by} />
          </div>

          {businesses.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No businesses found"
              description={
                hasFilters
                  ? 'Try adjusting your filters or search term.'
                  : 'Be the first to list a business!'
              }
              actionLabel={hasFilters ? 'Clear Filters' : 'List Your Business'}
              actionHref={hasFilters ? '/businesses' : '/auth/register'}
            />
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-3'
              }
            >
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ViewToggleProps {
  view: string;
  searchParams: Record<string, string | undefined>;
}

function ViewToggle({ view, searchParams }: ViewToggleProps) {
  function buildUrl(newView: string) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'view') params.set(k, v);
    });
    params.set('view', newView);
    return `/businesses?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {(['grid', 'list'] as const).map((v) => (
        <a
          key={v}
          href={buildUrl(v)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === v
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {v === 'grid' ? '⊞' : '☰'}
        </a>
      ))}
    </div>
  );
}
