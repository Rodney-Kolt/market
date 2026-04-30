'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Business, AnswerSearchResult } from '@/types';
import BusinessCard from '@/components/business/BusinessCard';
import { EXAMPLE_PROMPTS, HOME_CATEGORIES } from '@/lib/utils';
import { FiSearch, FiArrowRight, FiMessageCircle, FiLoader } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

interface Props {
  topBusinesses: Business[];
}

interface SearchResults {
  businesses: Business[];
  answers: AnswerSearchResult[];
  query: string;
}

export default function HomepageClient({ topBusinesses }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSearch(searchQuery: string) {
    const q = searchQuery.trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);

    const db = supabase as any;

    // Search businesses by name, description, category, cuisine_type
    const { data: bizData } = await db
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .or(
        `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,cuisine_type.ilike.%${q}%`
      )
      .order('rating_avg', { ascending: false })
      .limit(12);

    // Search answers that match the query
    const { data: answerData } = await db
      .from('answers')
      .select(`
        id,
        answer_text,
        created_at,
        answerer:users(full_name),
        question:questions(
          question_text,
          business:businesses(id, name)
        )
      `)
      .ilike('answer_text', `%${q}%`)
      .order('upvotes', { ascending: false })
      .limit(6);

    // Also search questions text
    const { data: questionData } = await db
      .from('questions')
      .select(`
        id,
        question_text,
        created_at,
        business:businesses(id, name),
        answers(
          id,
          answer_text,
          answerer:users(full_name)
        )
      `)
      .ilike('question_text', `%${q}%`)
      .limit(6);

    // Merge and deduplicate answers
    const answerResults: AnswerSearchResult[] = [];
    const seenIds = new Set<string>();

    // From direct answer search
    (answerData || []).forEach((a: any) => {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        answerResults.push({
          id: a.id,
          answer_text: a.answer_text,
          question_text: a.question?.question_text || '',
          business_name: a.question?.business?.name || '',
          business_id: a.question?.business?.id || '',
          answerer_name: a.answerer?.full_name || null,
          created_at: a.created_at,
        });
      }
    });

    // From question search — include first answer if exists
    (questionData || []).forEach((q: any) => {
      if (q.answers && q.answers.length > 0) {
        const firstAnswer = q.answers[0];
        if (!seenIds.has(firstAnswer.id)) {
          seenIds.add(firstAnswer.id);
          answerResults.push({
            id: firstAnswer.id,
            answer_text: firstAnswer.answer_text,
            question_text: q.question_text,
            business_name: q.business?.name || '',
            business_id: q.business?.id || '',
            answerer_name: firstAnswer.answerer?.full_name || null,
            created_at: firstAnswer.created_at,
          });
        }
      }
    });

    setResults({
      businesses: (bizData || []) as Business[],
      answers: answerResults.slice(0, 8),
      query: q,
    });
    setLoading(false);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  function handlePromptClick(prompt: string) {
    setQuery(prompt);
    handleSearch(prompt);
  }

  function handleAskCommunity() {
    router.push(`/businesses?query=${encodeURIComponent(query)}`);
  }

  const hasResults = results && (results.businesses.length > 0 || results.answers.length > 0);
  const noResults = results && !hasResults;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero / Search Interface ── */}
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="w-full max-w-2xl">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <MdStorefront className="text-base" />
              Your local business knowledge platform
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Find any business,<br />
              <span className="text-orange-500">ask anything.</span>
            </h1>
            <p className="mt-3 text-gray-500 text-lg">
              Real answers from the community — not just listings.
            </p>
          </div>

          {/* Search box */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(query);
                  }
                }}
                placeholder="Ask anything – what's on your mind today?"
                rows={2}
                className="w-full px-5 pt-4 pb-12 text-gray-900 placeholder-gray-400 bg-transparent resize-none focus:outline-none text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:block">Enter to search</span>
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiSearch />
                  )}
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          {!results && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3.5 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 rounded-full text-sm text-gray-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Search Results ── */}
      {(results || loading) && (
        <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <FiLoader className="text-3xl animate-spin text-orange-400" />
                <p className="text-sm">Searching businesses and community answers…</p>
              </div>
            </div>
          )}

          {noResults && !loading && (
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
              <p className="text-gray-500 mb-6">
                No businesses or community answers matched &ldquo;<strong>{results.query}</strong>&rdquo;.
                Be the first to ask the community!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAskCommunity}
                  className="btn-primary"
                >
                  <FiMessageCircle /> Browse All Businesses
                </button>
                <Link href="/businesses" className="btn-secondary">
                  View All Businesses
                </Link>
              </div>
            </div>
          )}

          {hasResults && !loading && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                  Results for <strong className="text-gray-900">&ldquo;{results.query}&rdquo;</strong>
                </p>
                <button
                  onClick={() => setResults(null)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Matching Businesses */}
                <div>
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdStorefront className="text-orange-500" />
                    Businesses
                    <span className="text-sm font-normal text-gray-400">({results.businesses.length})</span>
                  </h2>
                  {results.businesses.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm">
                      No matching businesses found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.businesses.slice(0, 6).map((biz) => (
                        <BusinessCard key={biz.id} business={biz} view="list" />
                      ))}
                      {results.businesses.length > 6 && (
                        <Link
                          href={`/businesses?query=${encodeURIComponent(results.query)}`}
                          className="flex items-center justify-center gap-2 py-3 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        >
                          View all {results.businesses.length} businesses <FiArrowRight />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Community Answers */}
                <div>
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMessageCircle className="text-orange-500" />
                    Community Answers
                    <span className="text-sm font-normal text-gray-400">({results.answers.length})</span>
                  </h2>
                  {results.answers.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-6 text-center">
                      <p className="text-gray-400 text-sm mb-3">No community answers yet for this topic.</p>
                      <button
                        onClick={handleAskCommunity}
                        className="btn-primary text-sm"
                      >
                        <FiMessageCircle /> Ask the Community
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.answers.map((answer) => (
                        <div key={answer.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                            <span className="text-orange-400 font-bold">Q</span>
                            {answer.question_text}
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                            {answer.answer_text}
                          </p>
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-xs text-gray-400">
                              {answer.answerer_name || 'Community member'}
                            </span>
                            {answer.business_id && (
                              <Link
                                href={`/businesses/${answer.business_id}`}
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                              >
                                🏪 {answer.business_name}
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleAskCommunity}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-orange-500 hover:text-orange-600 font-medium border border-dashed border-orange-200 rounded-2xl hover:bg-orange-50 transition-colors"
                      >
                        <FiMessageCircle /> Ask a follow-up question
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Category Quick Links (shown when no search) ── */}
      {!results && !loading && (
        <>
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Browse by Category</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {HOME_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handlePromptClick(cat.query)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all text-center group"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Top Rated */}
          {topBusinesses.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Top Rated Businesses</h2>
                <Link href="/businesses?sort_by=rating" className="btn-ghost text-orange-500 text-sm">
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

          {/* Features */}
          <section className="bg-gray-900 text-white py-14">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2">Why Market Assistant?</h2>
                <p className="text-gray-400 text-sm">Community-powered insights for every type of business.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: '💬', title: 'Community Q&A', desc: 'Ask questions, get real answers from locals and business owners.' },
                  { icon: '⭐', title: 'Honest Reviews', desc: 'Verified ratings from real customers — no fake reviews.' },
                  { icon: '💰', title: 'Price Transparency', desc: 'Crowdsourced prices so you always know what to expect.' },
                  { icon: '🔍', title: 'Transparency Score', desc: 'Know how open and responsive each business is.' },
                ].map((feat) => (
                  <div key={feat.title} className="bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                    <div className="text-2xl mb-2">{feat.icon}</div>
                    <h3 className="font-bold mb-1.5">{feat.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-2xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Own a business?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              List your business for free, manage your profile, respond to customers, and build your reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register" className="btn-primary px-8 py-3">
                List Your Business Free
              </Link>
              <Link href="/businesses" className="btn-secondary px-8 py-3">
                Browse All Businesses
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
