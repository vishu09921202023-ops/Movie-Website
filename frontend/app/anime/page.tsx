'use client';

import { movieAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { MovieResponse } from '@/lib/types';

export default function Anime() {
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await movieAPI.getMovies({ type: 'anime', page, limit: 20 });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch anime:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 animate-fade-in-up">
      <h1 className="text-3xl font-black mb-2">Top <span className="gradient-text">Anime</span></h1>
      {error && !data && (
        <p className="text-red-400 mt-6">Failed to load anime. Please try again later.</p>
      )}
      {loading && !data && (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
      )}
      {data && (
        <>
          <p className="text-gray-400 mb-6">Total: {data.pagination.total} anime series</p>
          <MovieGrid movies={data.movies} isLoading={loading} />
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={setPage}
            baseUrl="/anime"
          />
        </>
      )}
    </div>
  );
}
