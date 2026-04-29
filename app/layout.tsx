import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Market Assistant – Your Food Marketplace Guide',
    template: '%s | Market Assistant',
  },
  description:
    'Discover restaurants, cafes, food trucks, and more. Get real-time menus, crowdsourced prices, and community Q&A for food businesses near you.',
  keywords: ['food', 'restaurant', 'marketplace', 'menu', 'reviews', 'food truck', 'cafe'],
  openGraph: {
    title: 'Market Assistant',
    description: 'Your food marketplace knowledge platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />

        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
