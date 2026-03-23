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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
}
