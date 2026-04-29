'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  current?: string;
}

export default function SortSelect({ current }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_by', e.target.value);
    router.push(`/businesses?${params.toString()}`);
  }

  return (
    <select
      defaultValue={current || 'rating'}
      onChange={handleChange}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <option value="rating">Top Rated</option>
      <option value="newest">Newest</option>
      <option value="name">A–Z</option>
    </select>
  );
}
