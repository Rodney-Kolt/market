'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types';
import { getInitials } from '@/lib/utils';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiGrid, FiRefreshCw } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setUser(data as User);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  }

  async function handleSwitchRole() {
    if (!user) return;
    setSwitching(true);
    const newRole: UserRole = user.role === 'customer' ? 'business_owner' : 'customer';

    const { error } = await (supabase as any)
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to switch role.');
    } else {
      setUser({ ...user, role: newRole });
      toast.success(`Switched to ${newRole === 'business_owner' ? 'Business Owner' : 'Customer'} mode`);
      setProfileOpen(false);
      router.refresh();
    }
    setSwitching(false);
  }

  const navLinks = [
    { href: '/businesses', label: 'Browse' },
    { href: '/businesses?sort_by=rating', label: 'Top Rated' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500 hover:text-orange-600 transition-colors">
            <MdStorefront className="text-2xl" />
            <span>Market<span className="text-gray-900">Assistant</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/businesses" className="md:hidden p-2 text-gray-500 hover:text-orange-500 transition-colors">
              <FiSearch className="text-xl" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user.full_name)
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.full_name || user.email}
                  </span>
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                      <span className="badge badge-orange mt-1 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <FiGrid /> Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <FiUser /> Profile
                    </Link>

                    {/* Switch Role */}
                    <button
                      onClick={handleSwitchRole}
                      disabled={switching}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                      <FiRefreshCw className={switching ? 'animate-spin' : ''} />
                      Switch to {user.role === 'customer' ? 'Business Owner' : 'Customer'}
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost hidden sm:flex">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
}
