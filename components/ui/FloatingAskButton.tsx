'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiPlus, FiX, FiMessageCircle, FiSearch } from 'react-icons/fi';

export default function FloatingAskButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAskQuestion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login?returnTo=/dashboard');
    } else {
      router.push('/dashboard?tab=ask');
    }
    setOpen(false);
  }

  function handleBrowse() {
    router.push('/businesses');
    setOpen(false);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Action menu */}
        {open && (
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={handleAskQuestion}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-medium text-sm rounded-xl shadow-lg border border-gray-100 hover:bg-orange-50 hover:text-orange-600 transition-colors whitespace-nowrap"
            >
              <FiMessageCircle className="text-orange-500" />
              Ask a Question
            </button>
            <button
              onClick={handleBrowse}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 font-medium text-sm rounded-xl shadow-lg border border-gray-100 hover:bg-orange-50 hover:text-orange-600 transition-colors whitespace-nowrap"
            >
              <FiSearch className="text-orange-500" />
              Browse Businesses
            </button>
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="Quick actions"
        >
          {open ? (
            <FiX className="text-xl" />
          ) : (
            <FiPlus className="text-xl" />
          )}
        </button>
      </div>
    </>
  );
}
