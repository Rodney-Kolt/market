'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { getInitials } from '@/lib/utils';
import { FiSave, FiUser } from 'react-icons/fi';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      supabase.from('users').select('*').eq('id', session.user.id).single().then(({ data }) => {
        if (data) {
          setUser(data as User);
          setFullName(data.full_name || '');
          setRole(data.role as UserRole);
        }
        setLoading(false);
      });
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName.trim() || null, role })
      .eq('id', user.id);

    setSaving(false);
    if (error) toast.error('Failed to update profile.');
    else toast.success('Profile updated!');
  }

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
            {getInitials(user.full_name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.full_name || 'No name set'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="badge badge-orange capitalize mt-1">{user.role.replace('_', ' ')}</span>
          </div>
        </div>

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
            <input type="email" value={user.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="label">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer' as UserRole, label: '🛒 Customer' },
                { value: 'business_owner' as UserRole, label: '🏪 Business Owner' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === opt.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            <FiSave />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
