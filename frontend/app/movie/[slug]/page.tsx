'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { movieAPI, adminAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/types';

const QUALITY_COLORS: Record<string, string> = {
  '2160p': '#9333ea',
  '1080p': '#ef4444',
  '720p': '#3b82f6',
  '480p': '#22c55e',
  '60fps': '#f97316',
};

export default function MovieDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getBySlug(slug);
        const movieData = res.data;
        setMovie(movieData);
        await movieAPI.recordView(movieData._id);

        const [relatedRes, recentRes] = await Promise.all([
          movieData.genres?.length
            ? movieAPI.getMovies({ genre: movieData.genres[0], limit: 6 })
            : Promise.resolve({ data: { movies: [] } }),
          movieAPI.getMovies({ sort: 'latest', limit: 8 }),
        ]);
        setRelated(relatedRes.data.movies.filter((m: Movie) => m._id !== movieData._id));
        setRecentMovies(recentRes.data.movies.filter((m: Movie) => m._id !== movieData._id).slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  const handleDownload = async (link: any) => {
    try {
      setDownloading(link.quality);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${apiUrl}/movies/${movie!._id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quality: link.quality }),
      });
      const data = await res.json();
      if (data.redirectUrl) window.open(data.redirectUrl, '_blank');
      else if (link.url) window.open(link.url, '_blank');
    } catch {
      if (link.url) window.open(link.url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return <div className="text-center py-12 text-gray-400">Movie not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Backdrop Banner */}
      {movie.backdropUrl && (
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
          <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 min-w-0">

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            {movie.title}
          </h1>

          {/* Quality / Language Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.qualities?.map((q) => (
              <span key={q} className="px-3 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: QUALITY_COLORS[q] || '#6b7280' }}>
                {q}
              </span>
            ))}
            {movie.source && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded-full">{movie.source}</span>
            )}
            {movie.audioLanguages?.map((lang) => (
              <span key={lang} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-full">{lang}</span>
            ))}
            {movie.ottPlatform && movie.ottPlatform !== 'other' && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-full capitalize">{movie.ottPlatform}</span>
            )}
            {movie.type && movie.type !== 'movie' && (
              <span className="px-3 py-1 text-xs font-bold text-white bg-yellow-600 rounded-full capitalize">{movie.type}</span>
            )}
          </div>

          {/* Movie Info Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-28">Movie Name:</span>
                <span className="text-white font-semibold">{movie.cleanTitle}</span>
              </div>
              {movie.imdbRating && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">IMDb Rating:</span>
                  <span className="text-yellow-400 font-bold">⭐ {movie.imdbRating}/10</span>
                </div>
              )}
              {movie.releaseYear && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">Release Year:</span>
                  <span className="text-white">{movie.releaseYear}</span>
                </div>
              )}
              {movie.audioLanguages && movie.audioLanguages.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">Language:</span>
                  <span className="text-white">{movie.audioLanguages.join(' | ')}</span>
                </div>
              )}
              {movie.qualities && movie.qualities.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">Quality:</span>
                  <span className="text-white">{movie.qualities.join(' | ')}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">Duration:</span>
                  <span className="text-white">{movie.duration}</span>
                </div>
              )}
              {movie.source && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">Source:</span>
                  <span className="text-white">{movie.source}</span>
                </div>
              )}
              {movie.ottPlatform && (
                <div className="flex gap-2">
                  <span className="text-gray-400 min-w-28">OTT Platform:</span>
                  <span className="text-white capitalize">{movie.ottPlatform}</span>
                </div>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-2 sm:col-span-2">
                  <span className="text-gray-400 min-w-28">Genre:</span>
                  <span className="text-white">{movie.genres.join(', ')}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-28">Format:</span>
                <span className="text-white">MKV / MP4</span>
              </div>
            </div>
          </div>

          {/* Description / Story */}
          {movie.description && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                🎬 Movie Story / Plot
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{movie.description}</p>
            </div>
          )}

          {/* Screenshots */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📸 Screenshots (Preview Before Downloading)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {movie.screenshots.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-gray-800">
                    <Image src={src} alt={`Screenshot ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Links */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                ⬇️ Download Links
              </h2>
              <div className="space-y-4">
                {movie.downloadLinks.map((link, i) => (
                  <div key={i} className="border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-3 font-medium">
                      {movie.cleanTitle} ({movie.releaseYear}) [{movie.audioLanguages?.join('-') || 'Multi Audio'}]:{' '}
                      <span className="text-yellow-400 font-bold">{link.quality}</span>
                      {link.size ? ` — ${movie.source || 'WEB-DL'}, [${link.size}]` : ''}
                      {link.label ? ` — ${link.label}` : ''}
                    </p>
                    <button
                      onClick={() => handleDownload(link)}
                      disabled={downloading === link.quality}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {downloading === link.quality ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <>⬇️ Download Now</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {movie.tags && movie.tags.length > 0 && (
            <div className="mb-6">
              <span className="text-gray-400 text-sm mr-2">Tags:</span>
              {movie.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full mr-2 mb-2 transition">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Telegram CTA */}
          <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-700 rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">📢 Join our Telegram Channel</h3>
              <p className="text-cyan-300 text-sm">Get instant updates on latest movie releases</p>
            </div>
            <a
              href={movie.telegramUrl || 'https://t.me/'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg transition"
            >
              Join Now
            </a>
          </div>

          {/* Related Movies */}
          {related.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">🎥 Related Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {related.map((m) => (
                  <Link key={m._id} href={`/movie/${m.slug}`} className="group">
                    <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-[2/3]">
                      {m.posterUrl ? (
                        <Image src={m.posterUrl} alt={m.cleanTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                      )}
                    </div>
                    <p className="text-gray-300 text-xs mt-2 line-clamp-2 group-hover:text-white transition">{m.cleanTitle}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="lg:w-72 flex-shrink-0">
          {/* Poster */}
          {movie.posterUrl && (
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-6">
              <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
            </div>
          )}

          {/* Recent Movies */}
          {recentMovies.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-bold mb-4 text-base">🕐 Recent Movies</h3>
              <div className="space-y-3">
                {recentMovies.map((m) => (
                  <Link key={m._id} href={`/movie/${m.slug}`} className="flex gap-3 group hover:bg-gray-800 rounded-lg p-1 transition">
                    <div className="relative w-14 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                      {m.posterUrl ? (
                        <Image src={m.posterUrl} alt={m.cleanTitle} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-300 text-xs font-medium line-clamp-3 group-hover:text-white transition leading-snug">
                        {m.title}
                      </p>
                      {m.releaseYear && (
                        <span className="text-gray-500 text-xs mt-1 block">{m.releaseYear}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
