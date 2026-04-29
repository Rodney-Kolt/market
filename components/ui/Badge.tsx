import { getBadgeTier, type BadgeTier } from '@/types';
import { MdEmojiEvents } from 'react-icons/md';

interface ReputationBadgeProps {
  ratingCount: number;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG: Record<NonNullable<BadgeTier>, { label: string; color: string; bg: string }> = {
  bronze: { label: 'Bronze',  color: 'text-amber-700',  bg: 'bg-amber-100' },
  silver: { label: 'Silver',  color: 'text-gray-600',   bg: 'bg-gray-100'  },
  gold:   { label: 'Gold',    color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

export function ReputationBadge({ ratingCount, size = 'md' }: ReputationBadgeProps) {
  const tier = getBadgeTier(ratingCount);
  if (!tier) return null;

  const config = BADGE_CONFIG[tier];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${config.color} ${config.bg}`}>
      <MdEmojiEvents className={size === 'sm' ? 'text-sm' : 'text-base'} />
      {config.label}
    </span>
  );
}

interface TransparencyBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export function TransparencyBadge({ score, size = 'md' }: TransparencyBadgeProps) {
  const color =
    score >= 80 ? 'text-green-700 bg-green-100' :
    score >= 60 ? 'text-amber-700 bg-amber-100' :
    score >= 40 ? 'text-orange-700 bg-orange-100' :
                  'text-red-700 bg-red-100';

  const label =
    score >= 80 ? 'Highly Transparent' :
    score >= 60 ? 'Transparent' :
    score >= 40 ? 'Moderate' : 'Low';

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${color}`}>
      🔍 {label} ({score})
    </span>
  );
}

interface AvailableTodayBadgeProps {
  size?: 'sm' | 'md';
}

export function AvailableTodayBadge({ size = 'sm' }: AvailableTodayBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} text-green-700 bg-green-100`}>
      ✅ Available Today
    </span>
  );
}
