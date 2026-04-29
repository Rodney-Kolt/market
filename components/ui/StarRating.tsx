'use client';

import { FiStar } from 'react-icons/fi';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

interface StarRatingProps {
  score: number;       // 0-5, supports decimals
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showCount?: number;
  interactive?: boolean;
  onRate?: (score: number) => void;
}

export default function StarRating({
  score,
  maxStars = 5,
  size = 'md',
  showScore = false,
  showCount,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  const stars = Array.from({ length: maxStars }, (_, i) => {
    const filled = score >= i + 1;
    const half   = !filled && score >= i + 0.5;
    return { filled, half };
  });

  if (interactive && onRate) {
    return (
      <div className="flex items-center gap-1">
        {stars.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onRate(i + 1)}
            className={`${sizeClass} transition-colors ${
              score >= i + 1 ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
            }`}
          >
            <MdStar />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center ${sizeClass}`}>
        {stars.map((star, i) => (
          <span key={i} className={star.filled || star.half ? 'text-amber-400' : 'text-gray-200'}>
            {star.filled ? <MdStar /> : star.half ? <MdStarHalf /> : <MdStarOutline />}
          </span>
        ))}
      </div>
      {showScore && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {score.toFixed(1)}
        </span>
      )}
      {showCount !== undefined && (
        <span className="text-xs text-gray-400">({showCount})</span>
      )}
    </div>
  );
}
