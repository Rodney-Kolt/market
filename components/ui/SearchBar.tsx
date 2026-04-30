'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = '',
  className = '',
  placeholder = 'Search businesses, services, categories…',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('query', query.trim());
    router.push(`/businesses?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
}
