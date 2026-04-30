'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, Question, Rating, Business } from '@/types';
import QuestionCard from '@/components/business/QuestionCard';
import RatingCard from '@/components/business/RatingCard';
import AskQuestionForm from '@/components/forms/AskQuestionForm';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Props { user: User; }

type Tab = 'questions' | 'ratings' | 'ask';

const PAGE_SIZE = 5;

export default function CustomerDashboard({ user }: Props) {
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [qPage, setQPage] = useState(0);
  const [rPage, setRPage] = useState(0);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Support ?tab=ask from FloatingAskButton
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'ask') setActiveTab('ask');
  }, [searchParams]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const db = supabase as any;

    const [questionsRes, ratingsRes, businessesRes] = await Promise.all([
      db
        .from('questions')
        .select(`
          *,
          asker:users(id, full_name, avatar_url),
          business:businesses(id, name),
          answers(*, answerer:users(id, full_name))
        `)
        .eq('asker_id', user.id)
        .order('created_at', { ascending: false }),

      db
        .from('ratings')
        .select('*, rater:users(id, full_name), business:businesses(id, name)')
        .eq('rater_id', user.id)
        .order('created_at', { ascending: false }),

      db
        .from('businesses')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
    ]);

    setMyQuestions((questionsRes.data || []) as Question[]);
    setMyRatings((ratingsRes.data || []) as Rating[]);
    setBusinesses((businessesRes.data || []) as Business[]);
    setLoading(false);
  }

  if (loading) return <PageLoader />;

  const answeredCount = myQuestions.filter((q) => q.answers && q.answers.length > 0).length;

  // Paginated slices
  const qTotal = myQuestions.length;
  const rTotal = myRatings.length;
  const qPages = Math.ceil(qTotal / PAGE_SIZE);
  const rPages = Math.ceil(rTotal / PAGE_SIZE);
  const pagedQuestions = myQuestions.slice(qPage * PAGE_SIZE, (qPage + 1) * PAGE_SIZE);
  const pagedRatings = myRatings.slice(rPage * PAGE_SIZE, (rPage + 1) * PAGE_SIZE);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'questions', label: `💬 My Questions (${qTotal})` },
    { id: 'ratings',   label: `⭐ My Reviews (${rTotal})` },
    { id: 'ask',       label: '➕ Ask a Question' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.full_name || user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Questions Asked', value: qTotal, icon: '💬' },
          { label: 'Answers Received', value: answeredCount, icon: '✅' },
          { label: 'Reviews Written', value: rTotal, icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

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

      {/* ── Questions Tab ── */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Questions I&apos;ve Asked</h2>
            <button onClick={() => setActiveTab('ask')} className="btn-ghost text-sm text-orange-500">
              <FiPlus /> Ask New
            </button>
          </div>
          {qTotal === 0 ? (
            <EmptyState
              icon="💬"
              title="No questions yet"
              description="Ask a question about any business to get community answers."
              actionLabel="Ask a Question"
              onAction={() => setActiveTab('ask')}
            />
          ) : (
            <>
              {pagedQuestions.map((q) => (
                <div key={q.id}>
                  {q.business && (
                    <Link
                      href={`/businesses/${q.business.id}`}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium mb-1 block"
                    >
                      🏪 {q.business.name}
                    </Link>
                  )}
                  <QuestionCard question={q} showAnswerLink />
                </div>
              ))}
              {qPages > 1 && (
                <Pagination page={qPage} total={qPages} onChange={setQPage} />
              )}
            </>
          )}
        </div>
      )}

      {/* ── Ratings Tab ── */}
      {activeTab === 'ratings' && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900">My Reviews</h2>
          {rTotal === 0 ? (
            <EmptyState
              icon="⭐"
              title="No reviews yet"
              description="Rate a business to help the community."
              actionLabel="Browse Businesses"
              actionHref="/businesses"
            />
          ) : (
            <>
              {pagedRatings.map((r) => (
                <div key={r.id}>
                  {r.business && (
                    <Link
                      href={`/businesses/${r.business.id}`}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium mb-1 block"
                    >
                      🏪 {r.business.name}
                    </Link>
                  )}
                  <RatingCard rating={r} />
                </div>
              ))}
              {rPages > 1 && (
                <Pagination page={rPage} total={rPages} onChange={setRPage} />
              )}
            </>
          )}
        </div>
      )}

      {/* ── Ask Tab ── */}
      {activeTab === 'ask' && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Ask a Question</h2>
          <AskQuestionForm
            businesses={businesses}
            userId={user.id}
            onSuccess={() => { fetchData(); setActiveTab('questions'); setQPage(0); }}
          />
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft />
      </button>
      <span className="text-sm text-gray-500">
        Page {page + 1} of {total}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= total - 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
