'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Business } from '@/types';
import { FiSend } from 'react-icons/fi';

interface AskQuestionFormProps {
  businesses: Business[];
  preselectedBusinessId?: string;
  userId?: string;
  onSuccess?: () => void;
}

export default function AskQuestionForm({
  businesses,
  preselectedBusinessId,
  userId,
  onSuccess,
}: AskQuestionFormProps) {
  const [businessId, setBusinessId] = useState(preselectedBusinessId || '');
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Redirect to login if not authenticated
    if (!userId) {
      const returnTo = preselectedBusinessId
        ? `/businesses/${preselectedBusinessId}`
        : '/dashboard?tab=ask';
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (!businessId || !questionText.trim()) {
      toast.error('Please select a business and enter your question.');
      return;
    }

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('questions').insert({
      business_id: businessId,
      asker_id: userId,
      question_text: questionText.trim(),
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit question. Please try again.');
      console.error(error);
    } else {
      toast.success('Question submitted!');
      setQuestionText('');
      if (!preselectedBusinessId) setBusinessId('');
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Business selector */}
      {!preselectedBusinessId && (
        <div>
          <label className="label">Select a Business *</label>
          <select
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="input"
            required
          >
            <option value="">Choose a business…</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Question text */}
      <div>
        <label className="label">Your Question *</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="e.g. What are your hours on weekends? Do you offer free consultations?"
          rows={3}
          maxLength={500}
          className="input resize-none"
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{questionText.length}/500</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        <FiSend />
        {loading ? 'Submitting…' : userId ? 'Submit Question' : 'Sign in to Ask'}
      </button>
    </form>
  );
}
