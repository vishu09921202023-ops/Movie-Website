'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { movieAPI } from '@/lib/api';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { Movie, MovieResponse } from '@/lib/types';

export default function Browse() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type');
  const genre = searchParams.get('genre');
  const year = searchParams.get('year');
  const quality = searchParams.get('quality');
  const ott = searchParams.get('ott');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params: any = { page, limit: 20 };
        if (type) params.type = type;
        if (genre) params.genre = genre;
        if (year) params.year = year;
        if (quality) params.quality = quality;
        if (ott) params.ott = ott;

        const res = await movieAPI.getMovies(params);
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, type, genre, year, quality, ott]);

  const activeFilters = [
    ...(type ? [{ label: `Type: ${type}`, param: 'type' }] : []),
    ...(genre ? [{ label: `Genre: ${genre}`, param: 'genre' }] : []),
    ...(year ? [{ label: `Year: ${year}`, param: 'year' }] : []),
    ...(quality ? [{ label: `Quality: ${quality}`, param: 'quality' }] : []),
    ...(ott ? [{ label: `Platform: ${ott}`, param: 'ott' }] : []),
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse Movies</h1>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.param}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {filter.label}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete(filter.param);
                  window.location.href = `/browse?${params.toString()}`;
                }}
                className="hover:opacity-70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          <p className="text-gray-400 mb-6">
            Showing {(data.pagination.page - 1) * 20 + 1}-
            {Math.min(data.pagination.page * 20, data.pagination.total)} of {data.pagination.total} results
          </p>

          <MovieGrid movies={data.movies} isLoading={loading} />

          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={() => {}}
            baseUrl="/browse"
          />
        </>
      )}
    </div>
  );
}
