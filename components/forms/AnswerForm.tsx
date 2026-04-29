'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Business, Question } from '@/types';
import { FiSend } from 'react-icons/fi';

interface AnswerFormProps {
  question: Question;
  businesses: Business[];
  userId: string;
  onSuccess?: () => void;
}

export default function AnswerForm({ question, businesses, userId, onSuccess }: AnswerFormProps) {
  const [answerText, setAnswerText] = useState('');
  const [recommendedBusinessId, setRecommendedBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText.trim()) {
      toast.error('Please enter your answer.');
      return;
    }

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('answers').insert({
      question_id: question.id,
      answerer_id: userId,
      answer_text: answerText.trim(),
      recommended_business_id: recommendedBusinessId || null,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit answer.');
      console.error(error);
    } else {
      toast.success('Answer submitted!');
      setAnswerText('');
      setRecommendedBusinessId('');
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Question context */}
      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-xs text-orange-600 font-semibold mb-1">Answering:</p>
        <p className="text-sm text-gray-800 font-medium">{question.question_text}</p>
      </div>

      {/* Answer text */}
      <div>
        <label className="label">Your Answer *</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Share what you know…"
          rows={4}
          maxLength={1000}
          className="input resize-none"
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{answerText.length}/1000</p>
      </div>

      {/* Optional business recommendation */}
      <div>
        <label className="label">Recommend a Business (optional)</label>
        <select
          value={recommendedBusinessId}
          onChange={(e) => setRecommendedBusinessId(e.target.value)}
          className="input"
        >
          <option value="">No recommendation</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">Link to a business if it's relevant to your answer.</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        <FiSend />
        {loading ? 'Submitting…' : 'Submit Answer'}
      </button>
    </form>
  );
}
