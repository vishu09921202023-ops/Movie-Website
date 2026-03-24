'use client';

import { movieAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { MovieResponse } from '@/lib/types';

export default function Trending() {
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getTrending({ page, limit: 20 });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 animate-fade-in-up">
      <h1 className="text-3xl font-black mb-2">Trending <span className="gradient-text">Now</span></h1>
      {data && (
        <>
          <p className="text-gray-400 mb-6">Total: {data.pagination.total} trending movies</p>
          <MovieGrid movies={data.movies} isLoading={loading} />
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={setPage}
            baseUrl="/trending"
          />
        </>
      )}
    </div>
  );
}
