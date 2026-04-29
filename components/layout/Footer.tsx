import Link from 'next/link';
import { MdRestaurant } from 'react-icons/md';
import { FiGithub, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500 mb-3">
              <MdRestaurant className="text-2xl" />
              <span>Market<span className="text-gray-900">Assistant</span></span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Your food marketplace knowledge platform. Discover restaurants, cafes, food trucks, and more with real community insights.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2">
              {[
                { href: '/businesses', label: 'Browse Businesses' },
                { href: '/businesses?sort_by=rating', label: 'Top Rated' },
                { href: '/auth/register', label: 'Join as Owner' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2">
              {[
                { href: '/auth/login', label: 'Sign In' },
                { href: '/auth/register', label: 'Create Account' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Market Assistant. Built with Next.js & Supabase.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiGithub className="text-lg" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiTwitter className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
