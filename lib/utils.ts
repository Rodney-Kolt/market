// ============================================================
// Shared utility helpers
// ============================================================

import { type ClassValue, clsx } from 'clsx';

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

/** Format a price number as currency */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/** Format a date string to a readable format */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

/** Format a date string to relative time (e.g. "2 days ago") */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

/** Get initials from a full name */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Compute a simple transparency score (0-100) based on business data */
export function computeTransparencyScore(params: {
  hasDescription: boolean;
  hasContact: boolean;
  hasMenu: boolean;
  answerRate: number;   // 0-1 fraction of questions answered
  priceMatchRate: number; // 0-1 fraction of prices matching reports
}): number {
  let score = 0;
  if (params.hasDescription) score += 15;
  if (params.hasContact)     score += 10;
  if (params.hasMenu)        score += 15;
  score += Math.round(params.answerRate * 40);
  score += Math.round(params.priceMatchRate * 20);
  return Math.min(100, score);
}

/** Map a transparency score to a label */
export function transparencyLabel(score: number): string {
  if (score >= 80) return 'Highly Transparent';
  if (score >= 60) return 'Transparent';
  if (score >= 40) return 'Moderate';
  return 'Low Transparency';
}

/** Map a transparency score to a Tailwind color class */
export function transparencyColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/** Dietary option display labels */
export const DIETARY_OPTIONS = [
  { value: 'vegan',        label: 'Vegan' },
  { value: 'vegetarian',   label: 'Vegetarian' },
  { value: 'halal',        label: 'Halal' },
  { value: 'kosher',       label: 'Kosher' },
  { value: 'gluten-free',  label: 'Gluten-Free' },
  { value: 'dairy-free',   label: 'Dairy-Free' },
  { value: 'nut-free',     label: 'Nut-Free' },
];

export const CUISINE_TYPES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese',
  'Indian', 'Thai', 'Mediterranean', 'French', 'Korean',
  'Vietnamese', 'Greek', 'Middle Eastern', 'African', 'Caribbean',
  'Bakery', 'Cafe', 'Fast Food', 'Food Truck', 'Grocery',
];

export const PRICE_RANGES = [
  { value: '$',    label: '$ – Budget' },
  { value: '$$',   label: '$$ – Moderate' },
  { value: '$$$',  label: '$$$ – Upscale' },
  { value: '$$$$', label: '$$$$ – Fine Dining' },
];
