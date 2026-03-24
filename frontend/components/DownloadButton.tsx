'use client';

import { MovieDownloadLink } from '@/lib/types';
import { useState } from 'react';

interface DownloadButtonProps {
  movieId: string;
  links: MovieDownloadLink[];
}

export default function DownloadButton({ movieId, links }: DownloadButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (link: MovieDownloadLink) => {
    try {
      setLoading(link.quality);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/movies/${movieId}/download`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ quality: link.quality }),
        }
      );

      const data = await response.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3 my-8">
      {links.map((link, i) => (
        <button
          key={link.quality}
          onClick={() => handleDownload(link)}
          disabled={loading === link.quality}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 hover:shadow-red-600/30 active:scale-[0.98] animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span className="relative z-10">
            {loading === link.quality ? 'Processing...' : `Download ${link.label}`}
          </span>
        </button>
      ))}
    </div>
  );
}
