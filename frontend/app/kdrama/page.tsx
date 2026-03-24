'use client';

import { movieAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { Movie, MovieResponse } from '@/lib/types';

export default function KDrama() {
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getMovies({ type: 'kdrama', page, limit: 20 });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch K-Drama:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 animate-fade-in-up">
      <h1 className="text-3xl font-black mb-2"><span className="gradient-text">K-Drama</span> Collection</h1>
      {data && (
        <>
          <p className="text-gray-400 mb-6">Total: {data.pagination.total} K-Drama series</p>
          <MovieGrid movies={data.movies} isLoading={loading} />
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={setPage}
            baseUrl="/kdrama"
          />
        </>
      )}
    </div>
  );
}
