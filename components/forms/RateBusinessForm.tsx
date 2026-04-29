'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Business } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { FiSend } from 'react-icons/fi';

interface RateBusinessFormProps {
  business: Business;
  userId: string;
  existingRating?: { score: number; comment: string | null };
  onSuccess?: () => void;
}

export default function RateBusinessForm({
  business,
  userId,
  existingRating,
  onSuccess,
}: RateBusinessFormProps) {
  const [score, setScore] = useState(existingRating?.score || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    setLoading(true);

    // Upsert (insert or update) the rating
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('ratings').upsert(
      {
        business_id: business.id,
        rater_id: userId,
        score,
        comment: comment.trim() || null,
      },
      { onConflict: 'business_id,rater_id' }
    );

    setLoading(false);

    if (error) {
      toast.error('Failed to submit rating.');
      console.error(error);
    } else {
      toast.success(existingRating ? 'Rating updated!' : 'Rating submitted!');
      onSuccess?.();
    }
  }

  const scoreLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          How would you rate <strong>{business.name}</strong>?
        </p>
        <div className="flex justify-center mb-1">
          <StarRating
            score={score}
            size="lg"
            interactive
            onRate={setScore}
          />
        </div>
        {score > 0 && (
          <p className="text-sm font-semibold text-orange-600">{scoreLabels[score]}</p>
        )}
      </div>

      <div>
        <label className="label">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
          rows={3}
          maxLength={500}
          className="input resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
      </div>

      <button type="submit" disabled={loading || score === 0} className="btn-primary w-full">
        <FiSend />
        {loading ? 'Submitting…' : existingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  );
}
