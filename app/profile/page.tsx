'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { getInitials } from '@/lib/utils';
import { FiSave, FiUser, FiRefreshCw } from 'react-icons/fi';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    db.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) { router.push('/auth/login'); return; }
      db.from('users').select('*').eq('id', session.user.id).single().then(({ data }: any) => {
        if (data) {
          setUser(data as User);
          setFullName(data.full_name || '');
        }
        setLoading(false);
      });
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update({ full_name: fullName.trim() || null })
      .eq('id', user.id);

    setSaving(false);
    if (error) toast.error('Failed to update profile.');
    else {
      toast.success('Profile updated!');
      setUser((prev) => prev ? { ...prev, full_name: fullName.trim() || null } : prev);
    }
  }

  async function handleSwitchRole() {
    if (!user) return;
    const newRole: UserRole = user.role === 'customer' ? 'business_owner' : 'customer';
    setSwitching(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id);

    setSwitching(false);
    if (error) {
      toast.error('Failed to switch role.');
    } else {
      setUser((prev) => prev ? { ...prev, role: newRole } : prev);
      toast.success(
        newRole === 'business_owner'
          ? 'Switched to Business Owner — you can now create a business listing.'
          : 'Switched to Customer mode.'
      );
      router.refresh();
    }
  }

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.full_name || 'No name set'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="badge badge-orange capitalize mt-1">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Edit name */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            <FiSave />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Switch Role */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">Account Type</h3>
          <p className="text-sm text-gray-500 mb-4">
            {user.role === 'customer'
              ? 'You are currently a Customer. Switch to Business Owner to list and manage a business.'
              : 'You are currently a Business Owner. Switching to Customer hides your owner dashboard but keeps your business listing active.'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {([
              { value: 'customer' as UserRole, label: '🛒 Customer', desc: 'Discover & review' },
              { value: 'business_owner' as UserRole, label: '🏪 Business Owner', desc: 'List & manage' },
            ] as const).map((opt) => (
              <div
                key={opt.value}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  user.role === opt.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white opacity-60'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSwitchRole}
            disabled={switching}
            className="btn-secondary w-full"
          >
            <FiRefreshCw className={switching ? 'animate-spin' : ''} />
            {switching
              ? 'Switching…'
              : `Switch to ${user.role === 'customer' ? 'Business Owner' : 'Customer'}`}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Your existing activity (questions, ratings, businesses) is always preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
