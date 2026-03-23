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
      {links.map((link) => (
        <button
          key={link.quality}
          onClick={() => handleDownload(link)}
          disabled={loading === link.quality}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>⬇</span>
          {loading === link.quality ? 'Downloading...' : `Download ${link.label}`}
        </button>
      ))}
    </div>
  );
}
