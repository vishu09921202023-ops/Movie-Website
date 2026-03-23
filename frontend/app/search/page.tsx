'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { movieAPI } from '@/lib/api';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { Movie, MovieResponse } from '@/lib/types';

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getMovies({ search: query, page, limit: 20 });
        setData(res.data);
      } catch (error) {
        console.error('Failed to search:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMovies, 300);
    return () => clearTimeout(timer);
  }, [query, page]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{data?.pagination.total || 0} results for "{query}"</h1>
      <p className="text-gray-400 mb-6">
        Showing {(data?.pagination.page || 1 - 1) * 20 + 1}-
        {Math.min((data?.pagination.page || 1) * 20, data?.pagination.total || 0)} results
      </p>

      {data && (
        <>
          <MovieGrid movies={data.movies} isLoading={loading} />

          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={() => {}}
            baseUrl={`/search?q=${encodeURIComponent(query)}`}
          />
        </>
      )}
    </div>
  );
}
