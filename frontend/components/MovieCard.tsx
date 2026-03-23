'use client';

import { Movie } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
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
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <Link href={`/movie/${movie.slug}`}>
      <div className="movie-card cursor-pointer group">
        {/* Poster Image */}
        <div className="poster-wrapper">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={342}
              height={513}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div className="quality-badge">{getQualityBadge()}</div>
        </div>

        {/* Card Meta */}
        <div className="card-meta">
          <div className="post-date">📅 {formattedDate}</div>
          <p className="card-title">{movie.title}</p>
        </div>
      </div>
    </Link>
  );
}
