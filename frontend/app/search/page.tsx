'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { movieAPI } from '@/lib/api';
import MovieGrid from '@/components/MovieGrid';
import Pagination from '@/components/Pagination';
import { Movie, MovieResponse } from '@/lib/types';

export default function Search() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(query);
  const [data, setData] = useState<MovieResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Live search as user types
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchInput.trim()) { setData(null); setLoading(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        // Update URL without full navigation
        if (searchInput !== query) {
          router.replace(`/search?q=${encodeURIComponent(searchInput)}`, { scroll: false });
        }
        const res = await movieAPI.getMovies({ search: searchInput.trim(), page, limit: 20 });
        setData(res.data);
      } catch (error) {
        console.error('Failed to search:', error);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput, page]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 animate-fade-in-up">
      {/* Live Search Input */}
      <div className="relative mb-8">
        <div className="relative group">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search movies, series, anime, K-drama..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-12 py-4 rounded-2xl text-lg focus:outline-none focus:border-red-500/50 focus:bg-white/10 placeholder-gray-500 transition-all duration-300"
            autoFocus
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setData(null); }} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && data.movies.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black">
              <span className="text-gray-400">{data.pagination.total}</span> results for &ldquo;<span className="gradient-text">{searchInput}</span>&rdquo;
            </h1>
          </div>
          <MovieGrid movies={data.movies} isLoading={false} />
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.pages}
            onPageChange={() => {}}
            baseUrl={`/search?q=${encodeURIComponent(searchInput)}`}
          />
        </>
      )}

      {!loading && searchInput.trim() && data && data.movies.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      )}

      {!loading && !searchInput.trim() && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">Search for movies & shows</h2>
          <p className="text-gray-500">Type to search across all movies, series, anime & K-drama</p>
        </div>
      )}
    </div>
  );
}
