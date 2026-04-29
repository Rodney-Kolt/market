import type { Rating } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { timeAgo, getInitials } from '@/lib/utils';

interface RatingCardProps {
  rating: Rating;
}

export default function RatingCard({ rating }: RatingCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {getInitials(rating.rater?.full_name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {rating.rater?.full_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(rating.created_at)}</span>
          </div>
          <StarRating score={rating.score} size="sm" />
          {rating.comment && (
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{rating.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
