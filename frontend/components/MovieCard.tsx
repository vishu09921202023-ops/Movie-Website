'use client';

import { Movie } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const getQualityBadge = () => {
    if (movie.qualities?.includes('2160p')) return '4K';
    if (movie.qualities?.includes('1080p')) return 'FHD';
    if (movie.qualities?.includes('720p')) return 'HD';
    if (movie.source === 'BluRay') return 'BluRay';
    return 'HD';
  };

  const formattedDate = movie.postedAt
    ? new Date(movie.postedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Link href={`/movie/${movie.slug}`}>
      <div
        className="movie-card cursor-pointer group animate-fade-in-up"
        style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      >
        {/* Poster */}
        <div className="poster-wrapper">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={342}
              height={513}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
          )}
          <div className="quality-badge">{getQualityBadge()}</div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-xs font-medium text-red-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              View Details
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="card-meta">
          {formattedDate && <div className="post-date">{formattedDate}</div>}
          <p className="card-title">{movie.title}</p>
        </div>
      </div>
    </Link>
  );
}
