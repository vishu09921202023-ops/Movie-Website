'use client';

import { Movie } from '@/lib/types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
}

export default function MovieGrid({ movies, isLoading }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="skeleton rounded-xl h-80" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
        </div>
        <p className="text-gray-400 text-lg font-medium">No movies found</p>
        <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
      {movies.map((movie, index) => (
        <MovieCard key={movie._id} movie={movie} index={index} />
      ))}
    </div>
  );
}
