import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🍽️</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Looks like this page went off the menu. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/businesses" className="btn-secondary">Browse Businesses</Link>
        </div>
      </div>
    </div>
  );
}
