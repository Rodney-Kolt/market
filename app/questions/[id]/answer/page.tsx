import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Question, Business, User } from '@/types';
import AnswerForm from '@/components/forms/AnswerForm';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Answer a Question' };

interface PageProps {
  params: { id: string };
}

export default async function AnswerQuestionPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient();

  // Auth check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // Fetch question with business info
  const { data: question } = await supabase
    .from('questions')
    .select('*, asker:users(id, full_name), business:businesses(id, name)')
    .eq('id', params.id)
    .single();

  if (!question) notFound();

  // Fetch all businesses for recommendation dropdown
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  // Fetch current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href={`/businesses/${(question as any).business?.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors"
      >
        <FiArrowLeft /> Back to {(question as any).business?.name}
      </Link>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Answer a Question</h1>
        <AnswerForm
          question={question as Question}
          businesses={(businesses || []) as Business[]}
          userId={session.user.id}
          onSuccess={() => {}}
        />
      </div>
    </div>
  );
}
