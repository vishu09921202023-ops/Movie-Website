import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vegamovies - Download Movies 720p, 1080p, 4K',
  description: 'Download Latest Bollywood, Hollywood, Anime, K-Drama Movies in 720p, 1080p, and 4K Quality',
  openGraph: {
    title: 'Vegamovies - Download Movies',
    description: 'Download latest movies in HD quality',
    siteName: 'Vegamovies',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
