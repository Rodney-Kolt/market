import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Business } from '@/types';
import BusinessCard from '@/components/business/BusinessCard';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { MdRestaurant, MdLocalCafe, MdDirectionsBike, MdStorefront } from 'react-icons/md';
import SearchBar from '@/components/ui/SearchBar';

async function getTopBusinesses(): Promise<Business[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('rating_avg', { ascending: false })
    .limit(6);
  return (data as Business[]) || [];
}

export default async function HomePage() {
  const topBusinesses = await getTopBusinesses();

  const categories = [
    { icon: <MdRestaurant className="text-3xl" />, label: 'Restaurants', query: 'restaurant', color: 'bg-orange-100 text-orange-600' },
    { icon: <MdLocalCafe className="text-3xl" />, label: 'Cafes', query: 'cafe', color: 'bg-amber-100 text-amber-600' },
    { icon: <MdDirectionsBike className="text-3xl" />, label: 'Food Trucks', query: 'food truck', color: 'bg-red-100 text-red-600' },
    { icon: <MdStorefront className="text-3xl" />, label: 'Grocery', query: 'grocery', color: 'bg-green-100 text-green-600' },
  ];

  const stats = [
    { value: '500+', label: 'Food Businesses' },
    { value: '10K+', label: 'Community Reviews' },
    { value: '50K+', label: 'Menu Items Tracked' },
    { value: '99%', label: 'Price Accuracy' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              🍽️ Your food marketplace knowledge platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance mb-6">
              Discover the best food businesses near you
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Real menus, crowdsourced prices, community Q&amp;A, and honest reviews — all in one place.
            </p>

            {/* Search bar */}
            <SearchBar className="max-w-xl" />

            <div className="flex flex-wrap gap-3 mt-6 text-sm">
              {['Pizza', 'Vegan', 'Halal', 'Breakfast', 'Coffee'].map((tag) => (
                <Link
                  key={tag}
                  href={`/businesses?query=${tag}`}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-1.5 font-medium transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-orange-500">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="section-title mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/businesses?query=${encodeURIComponent(cat.query)}`}
              className="card-hover p-6 flex flex-col items-center gap-3 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="font-semibold text-gray-800">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Top Rated ── */}
      {topBusinesses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Top Rated Businesses</h2>
            <Link href="/businesses?sort_by=rating" className="btn-ghost text-orange-500">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} view="grid" />
            ))}
          </div>
        </section>
      )}

      {/* ── MVP Features highlight ── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Market Assistant?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">We go beyond basic listings to give you real, community-powered insights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📅', title: "Today's Menu", desc: "See what's actually available right now, not just the full menu." },
              { icon: '💬', title: 'Community Q&A', desc: 'Ask questions, get answers from regulars and business owners.' },
              { icon: '💰', title: 'Price Snapshot', desc: 'Crowdsourced prices so you always know what to expect.' },
              { icon: '🔍', title: 'Transparency Score', desc: 'Know how open and responsive each business is before you visit.' },
            ].map((feat) => (
              <div key={feat.title} className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Own a food business?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          List your business for free, manage your menu, respond to customers, and build your reputation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-3">
            List Your Business Free
          </Link>
          <Link href="/businesses" className="btn-secondary text-base px-8 py-3">
            Browse Businesses
          </Link>
        </div>
      </section>
    </div>
  );
}
