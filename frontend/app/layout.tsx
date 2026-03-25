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
        {/* Movie-themed animated background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Cinema grid pattern */}
          <div className="cinema-grid" />
          {/* Film reel particles */}
          <div className="film-particle film-particle-1" />
          <div className="film-particle film-particle-2" />
          <div className="film-particle film-particle-3" />
          <div className="film-particle film-particle-4" />
          <div className="film-particle film-particle-5" />
          {/* Cinematic light beams */}
          <div className="cinema-beam cinema-beam-1" />
          <div className="cinema-beam cinema-beam-2" />
          {/* Film strip decorations */}
          <div className="film-strip-left" />
          <div className="film-strip-right" />
          {/* Spotlight */}
          <div className="spotlight" />
          {/* Ambient floating orbs */}
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
          {/* Noise texture */}
          <div className="noise-overlay" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
