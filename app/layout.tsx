import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingAskButton from '@/components/ui/FloatingAskButton';

export const metadata: Metadata = {
  title: {
    default: 'Market Assistant – Find Any Business, Ask Anything',
    template: '%s | Market Assistant',
  },
  description:
    'Discover local businesses of all kinds. Get real answers from the community, crowdsourced prices, and honest reviews.',
  keywords: ['business', 'local', 'marketplace', 'reviews', 'community', 'Q&A', 'find business'],
  openGraph: {
    title: 'Market Assistant',
    description: 'Your local business knowledge platform',
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

        {/* Persistent floating ask button */}
        <FloatingAskButton />
      </body>
    </html>
  );
}
