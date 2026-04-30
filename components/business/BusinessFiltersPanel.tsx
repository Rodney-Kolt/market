'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { BusinessFilters } from '@/types';
import { BUSINESS_CATEGORIES, PRICE_RANGES, DIETARY_OPTIONS } from '@/lib/utils';
import { FiFilter, FiX } from 'react-icons/fi';

interface BusinessFiltersPanelProps {
  currentFilters: BusinessFilters;
}

export default function BusinessFiltersPanel({ currentFilters }: BusinessFiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/businesses?${params.toString()}`);
  }

  function clearAll() {
    router.push('/businesses');
  }

  const hasActiveFilters = !!(
    currentFilters.category ||
    currentFilters.cuisine_type ||
    currentFilters.price_range ||
    currentFilters.dietary_option ||
    currentFilters.min_rating
  );

  const activeCategory = currentFilters.category || currentFilters.cuisine_type;

  return (
    <div className="card p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FiFilter /> Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
            <FiX /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          value={activeCategory || ''}
          onChange={(e) => updateFilter('category', e.target.value || undefined)}
          className="input text-sm"
        >
          <option value="">All categories</option>
          {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price Range</label>
        <div className="grid grid-cols-4 gap-1">
          {PRICE_RANGES.map((p) => (
            <button
              key={p.value}
              onClick={() => updateFilter('price_range', currentFilters.price_range === p.value ? undefined : p.value)}
              className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                currentFilters.price_range === p.value
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              {p.value}
            </button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label className="label">Minimum Rating</label>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('min_rating', currentFilters.min_rating === r ? undefined : r.toString())}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                currentFilters.min_rating === r
                  ? 'bg-orange-50 border-orange-400 text-orange-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200'
              }`}
            >
              {'⭐'.repeat(r)} {r}+ stars
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div>
        <label className="label">Dietary Options</label>
        <div className="flex flex-col gap-1.5">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('dietary_option', currentFilters.dietary_option === opt.value ? undefined : opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                currentFilters.dietary_option === opt.value
                  ? 'bg-green-50 border-green-400 text-green-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
