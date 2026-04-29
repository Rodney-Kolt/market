'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Business, MenuItem, Question } from '@/types';
import BusinessForm from '@/components/forms/BusinessForm';
import MenuItemForm from '@/components/forms/MenuItemForm';
import MenuItemCard from '@/components/business/MenuItemCard';
import QuestionCard from '@/components/business/QuestionCard';
import StarRating from '@/components/ui/StarRating';
import { ReputationBadge, TransparencyBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import Link from 'next/link';

interface Props { user: User; }

type Tab = 'overview' | 'menu' | 'questions' | 'analytics';

export default function OwnerDashboard({ user }: Props) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Fetch owner's business
    const { data: biz } = await db
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (biz) {
      setBusiness(biz as Business);

      // Fetch menu items
      const { data: items } = await db
        .from('menu_items')
        .select('*')
        .eq('business_id', biz.id)
        .order('category')
        .order('name');
      setMenuItems((items || []) as MenuItem[]);

      // Fetch questions with answers
      const { data: qs } = await db
        .from('questions')
        .select(`
          *,
          asker:users(id, full_name, avatar_url),
          answers(*, answerer:users(id, full_name))
        `)
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });
      setQuestions((qs || []) as Question[]);
    }

    setLoading(false);
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('Delete this menu item?')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('menu_items').delete().eq('id', id);
    if (error) toast.error('Failed to delete item.');
    else { toast.success('Item deleted.'); fetchData(); }
  }

  async function handleToggleAvailability(itemId: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('menu_items')
      .update({ is_available_today: !current })
      .eq('id', itemId);
    if (error) toast.error('Failed to update.');
    else fetchData();
  }

  if (loading) return <PageLoader />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'menu', label: `🍽️ Menu (${menuItems.length})` },
    { id: 'questions', label: `💬 Q&A (${questions.length})` },
    { id: 'analytics', label: '📈 Analytics' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.full_name || user.email}</p>
        </div>
        {business && (
          <Link href={`/businesses/${business.id}`} className="btn-secondary text-sm">
            View Public Profile
          </Link>
        )}
      </div>

      {/* No business yet */}
      {!business && !showBusinessForm && (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">List Your Business</h2>
          <p className="text-gray-500 mb-6">Create your business profile to start receiving reviews and questions.</p>
          <button onClick={() => setShowBusinessForm(true)} className="btn-primary">
            <FiPlus /> Create Business Profile
          </button>
        </div>
      )}

      {/* Business creation form */}
      {showBusinessForm && !business && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Create Your Business</h2>
          <BusinessForm
            userId={user.id}
            onSuccess={(biz) => { setBusiness(biz); setShowBusinessForm(false); fetchData(); }}
          />
        </div>
      )}

      {/* Dashboard with business */}
      {business && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Rating', value: business.rating_avg.toFixed(1), sub: `${business.rating_count} reviews`, icon: '⭐' },
                  { label: 'Menu Items', value: menuItems.length, sub: `${menuItems.filter(m => m.is_available_today).length} available today`, icon: '🍽️' },
                  { label: 'Questions', value: questions.length, sub: `${questions.filter(q => q.answers && q.answers.length > 0).length} answered`, icon: '💬' },
                  { label: 'Transparency', value: business.transparency_score, sub: 'out of 100', icon: '🔍' },
                ].map((stat) => (
                  <div key={stat.label} className="card p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Business info card */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Business Profile</h2>
                  <button
                    onClick={() => setShowBusinessForm(!showBusinessForm)}
                    className="btn-ghost text-sm"
                  >
                    <FiEdit2 /> Edit
                  </button>
                </div>

                {showBusinessForm ? (
                  <BusinessForm
                    userId={user.id}
                    existing={business}
                    onSuccess={(biz) => { setBusiness(biz); setShowBusinessForm(false); }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{business.name}</span></div>
                    <div><span className="text-gray-500">Cuisine:</span> <span className="font-medium">{business.cuisine_type || '—'}</span></div>
                    <div><span className="text-gray-500">Price Range:</span> <span className="font-medium">{business.price_range || '—'}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{business.contact_phone || '—'}</span></div>
                    <div className="sm:col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{business.address || '—'}</span></div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <ReputationBadge ratingCount={business.rating_count} />
                      <TransparencyBadge score={business.transparency_score} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Menu Tab ── */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Menu Items</h2>
                <button onClick={() => { setEditingItem(null); setShowMenuForm(true); }} className="btn-primary text-sm">
                  <FiPlus /> Add Item
                </button>
              </div>

              {/* Add/Edit form */}
              {showMenuForm && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">{editingItem ? 'Edit Item' : 'Add Menu Item'}</h3>
                  <MenuItemForm
                    businessId={business.id}
                    existing={editingItem || undefined}
                    onSuccess={() => { setShowMenuForm(false); setEditingItem(null); fetchData(); }}
                    onCancel={() => { setShowMenuForm(false); setEditingItem(null); }}
                  />
                </div>
              )}

              {menuItems.length === 0 ? (
                <EmptyState
                  icon="🍽️"
                  title="No menu items yet"
                  description="Add your first menu item to let customers know what you offer."
                  actionLabel="Add First Item"
                  onAction={() => setShowMenuForm(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="relative">
                      <MenuItemCard
                        item={item}
                        isOwner
                        onToggleAvailability={handleToggleAvailability}
                      />
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          onClick={() => { setEditingItem(item); setShowMenuForm(true); }}
                          className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Q&A Tab ── */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900">Customer Questions</h2>
              {questions.length === 0 ? (
                <EmptyState icon="💬" title="No questions yet" description="Questions from customers will appear here." />
              ) : (
                questions.map((q) => (
                  <QuestionCard key={q.id} question={q} showAnswerLink businessId={business.id} />
                ))
              )}
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="font-bold text-gray-900">Rating Analytics</h2>

              {/* Rating distribution */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Rating Overview</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900">{business.rating_avg.toFixed(1)}</div>
                    <StarRating score={business.rating_avg} size="md" />
                    <p className="text-sm text-gray-500 mt-1">{business.rating_count} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      // We'd need actual data for this — using placeholder
                      const pct = star === Math.round(business.rating_avg) ? 60 : Math.max(5, (star / 5) * 30);
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-gray-500 w-4">{star}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-amber-400 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Transparency breakdown */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Transparency Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Profile completeness', score: business.description && business.address && business.contact_phone ? 100 : 50, max: 25 },
                    { label: 'Question response rate', score: questions.length > 0 ? Math.round((questions.filter(q => q.answers && q.answers.length > 0).length / questions.length) * 100) : 0, max: 40 },
                    { label: 'Menu items listed', score: menuItems.length > 0 ? 100 : 0, max: 15 },
                    { label: 'Price accuracy', score: 70, max: 20 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.score}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full transition-all"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <TransparencyBadge score={business.transparency_score} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
