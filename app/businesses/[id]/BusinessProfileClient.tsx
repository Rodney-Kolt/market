'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Business, MenuItem, Question, Rating, User } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { ReputationBadge, TransparencyBadge } from '@/components/ui/Badge';
import MenuItemCard from '@/components/business/MenuItemCard';
import QuestionCard from '@/components/business/QuestionCard';
import RatingCard from '@/components/business/RatingCard';
import AskQuestionForm from '@/components/forms/AskQuestionForm';
import RateBusinessForm from '@/components/forms/RateBusinessForm';
import ReportPriceForm from '@/components/forms/ReportPriceForm';
import { FiMapPin, FiPhone, FiMail, FiMessageCircle, FiStar, FiPlus } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

// currentUser and userRating are no longer passed from the server —
// the server client can't read cookies so session is always null there.
// We load them client-side after mount instead.
interface Props {
  business: Business;
  menuItems: MenuItem[];
  questions: Question[];
  ratings: Rating[];
}

type ActiveModal = 'ask' | 'rate' | 'report_price' | null;

export default function BusinessProfileClient({
  business,
  menuItems,
  questions,
  ratings,
}: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'qa' | 'reviews'>('menu');
  const supabase = createClient();

  // Load current user from browser session after mount
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setAuthLoading(false);
        return;
      }

      const db = supabase as any;

      // Fetch profile
      const { data: profile } = await db
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) setCurrentUser(profile as User);

      // Check if user already rated this business
      const { data: existingRating } = await db
        .from('ratings')
        .select('*')
        .eq('business_id', business.id)
        .eq('rater_id', authUser.id)
        .maybeSingle();

      if (existingRating) setUserRating(existingRating as Rating);

      setAuthLoading(false);
    }

    loadUser();

    // Also listen for auth state changes (e.g. sign-in in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null);
        setUserRating(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [business.id]);

  // Group menu items by category
  const menuByCategory = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const availableToday = menuItems.filter((m) => m.is_available_today);

  const topQuestions = [...questions]
    .sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0))
    .slice(0, 3);

  async function handleToggleAvailability(itemId: string, current: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('menu_items')
      .update({ is_available_today: !current })
      .eq('id', itemId);
    if (error) toast.error('Failed to update availability.');
    else toast.success('Availability updated!');
  }

  function handleReportPrice(item: MenuItem) {
    if (!currentUser) {
      toast.error('Please sign in to report a price.');
      return;
    }
    setSelectedMenuItem(item);
    setActiveModal('report_price');
  }

  const isOwner = currentUser?.id === business.owner_id;

  const tabs = [
    { id: 'menu' as const, label: `📋 Items (${menuItems.length})` },
    { id: 'qa' as const, label: `💬 Q&A (${questions.length})` },
    { id: 'reviews' as const, label: `⭐ Reviews (${ratings.length})` },
  ];

  // While we're checking auth, show a neutral action area (no flash of "Sign in")
  const actionButtons = authLoading ? (
    <div className="h-10 w-48 bg-gray-100 rounded-xl animate-pulse" />
  ) : currentUser && !isOwner ? (
    <>
      <button onClick={() => setActiveModal('ask')} className="btn-primary">
        <FiMessageCircle /> Ask a Question
      </button>
      <button onClick={() => setActiveModal('rate')} className="btn-secondary">
        <FiStar /> {userRating ? 'Update Rating' : 'Rate Business'}
      </button>
    </>
  ) : isOwner ? (
    <Link href="/dashboard" className="btn-secondary">
      Manage Business
    </Link>
  ) : (
    <Link href={`/auth/login?returnTo=/businesses/${business.id}`} className="btn-primary">
      Sign in to interact
    </Link>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Business Header ── */}
      <div className="card overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 relative flex items-center justify-center">
          {business.logo_url ? (
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
          ) : (
            <MdStorefront className="text-8xl text-orange-200" />
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                <ReputationBadge ratingCount={business.rating_count} />
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {(business.category || business.cuisine_type) && (
                  <span className="text-sm text-gray-500">{business.category || business.cuisine_type}</span>
                )}
                {business.price_range && (
                  <span className="text-sm font-semibold text-green-600">{business.price_range}</span>
                )}
                <StarRating score={business.rating_avg} size="sm" showScore showCount={business.rating_count} />
              </div>

              {business.description && (
                <p className="text-gray-600 mt-3 leading-relaxed">{business.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {business.address && (
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-orange-400" /> {business.address}
                  </span>
                )}
                {business.contact_phone && (
                  <a href={`tel:${business.contact_phone}`} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <FiPhone className="text-orange-400" /> {business.contact_phone}
                  </a>
                )}
                {business.contact_email && (
                  <a href={`mailto:${business.contact_email}`} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                    <FiMail className="text-orange-400" /> {business.contact_email}
                  </a>
                )}
              </div>

              {business.dietary_options && business.dietary_options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {business.dietary_options.map((opt) => (
                    <span key={opt} className="badge badge-green capitalize">{opt}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-4 min-w-[120px]">
              <div className="text-3xl font-extrabold text-gray-900">{business.transparency_score}</div>
              <div className="text-xs text-gray-500 mt-0.5 text-center">Transparency Score</div>
              <TransparencyBadge score={business.transparency_score} size="sm" />
            </div>
          </div>

          {/* Action buttons — rendered after auth check to avoid flash */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100">
            {actionButtons}
          </div>
        </div>
      </div>

      {/* ── Available Today ── */}
      {availableToday.length > 0 && (
        <div className="card p-5 mb-6 border-l-4 border-green-400">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            📅 Available Today
            <span className="badge badge-green">{availableToday.length} items</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableToday.map((item) => (
              <span key={item.id} className="bg-green-50 text-green-800 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200">
                {item.name}
                {item.price && <span className="ml-1 text-green-600">${item.price}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── What Regulars Ask ── */}
      {topQuestions.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            💬 What Regulars Ask
          </h2>
          <div className="space-y-3">
            {topQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-orange-400 text-lg mt-0.5">Q</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{q.question_text}</p>
                  {q.answers && q.answers.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'} · {q.answers[0].answer_text.slice(0, 80)}…
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
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

      {/* ── Items Tab ── */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {Object.keys(menuByCategory).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MdStorefront className="text-5xl mx-auto mb-3 text-gray-200" />
              <p>No items or services listed yet.</p>
            </div>
          ) : (
            Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-orange-300 rounded" />
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isOwner={isOwner}
                      onToggleAvailability={isOwner ? handleToggleAvailability : undefined}
                      onReportPrice={!isOwner ? handleReportPrice : undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Q&A Tab ── */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          {!isOwner && (
            <button
              onClick={() => setActiveModal('ask')}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-orange-200 rounded-2xl text-orange-500 hover:bg-orange-50 transition-colors font-medium"
            >
              <FiPlus /> Ask a Question
            </button>
          )}
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiMessageCircle className="text-5xl mx-auto mb-3 text-gray-200" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            questions.map((q) => (
              <QuestionCard key={q.id} question={q} showAnswerLink={!!currentUser} businessId={business.id} />
            ))
          )}
        </div>
      )}

      {/* ── Reviews Tab ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {!authLoading && currentUser && !isOwner && (
            <button
              onClick={() => setActiveModal('rate')}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-amber-200 rounded-2xl text-amber-600 hover:bg-amber-50 transition-colors font-medium"
            >
              <FiStar /> {userRating ? 'Update Your Rating' : 'Write a Review'}
            </button>
          )}
          {ratings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiStar className="text-5xl mx-auto mb-3 text-gray-200" />
              <p>No reviews yet.</p>
            </div>
          ) : (
            ratings.map((r) => <RatingCard key={r.id} rating={r} />)
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {activeModal === 'ask' && 'Ask a Question'}
                {activeModal === 'rate' && (userRating ? 'Update Rating' : 'Rate Business')}
                {activeModal === 'report_price' && 'Report a Price'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5">
              {activeModal === 'ask' && (
                <AskQuestionForm
                  businesses={[business]}
                  preselectedBusinessId={business.id}
                  userId={currentUser?.id}
                  onSuccess={() => { setActiveModal(null); window.location.reload(); }}
                />
              )}
              {activeModal === 'rate' && currentUser && (
                <RateBusinessForm
                  business={business}
                  userId={currentUser.id}
                  existingRating={userRating ? { score: userRating.score, comment: userRating.comment } : undefined}
                  onSuccess={() => { setActiveModal(null); window.location.reload(); }}
                />
              )}
              {activeModal === 'report_price' && currentUser && selectedMenuItem && (
                <ReportPriceForm
                  menuItem={selectedMenuItem}
                  businessId={business.id}
                  userId={currentUser.id}
                  onSuccess={() => { setActiveModal(null); window.location.reload(); }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
