import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'VN Movies HD - Download Movies 720p, 1080p, 4K',
  description: 'Download Latest Bollywood, Hollywood, Anime, K-Drama Movies in 720p, 1080p, and 4K Quality',
  openGraph: {
    title: 'VN Movies HD - Download Movies',
    description: 'Download latest movies in HD quality',
    siteName: 'VN Movies HD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#030712] text-white antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
