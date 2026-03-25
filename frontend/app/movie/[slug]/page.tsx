'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
  const viewTracked = useRef(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getBySlug(slug);
        const movieData = res.data;
        setMovie(movieData);
        // Only record view once per page mount
        if (!viewTracked.current) {
          viewTracked.current = true;
          movieAPI.recordView(movieData._id).catch(() => {});
        }

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading movie...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500 text-lg font-medium">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Backdrop Banner */}
      {movie.backdropUrl && (
        <div className="relative w-full h-56 md:h-72 lg:h-96 rounded-2xl overflow-hidden mb-8">
          <Image src={movie.backdropUrl} alt={movie.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-[#030712]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-6 rounded-full bg-red-500" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-[0.15em]">Now Available</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-white drop-shadow-2xl leading-tight max-w-3xl">
              {movie.title}
            </h1>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 min-w-0 space-y-6">

          {!movie.backdropUrl && (
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{movie.title}</h1>
          )}

          {/* Quality / Language Badges */}
          <div className="flex flex-wrap gap-2">
            {movie.qualities?.map((q) => (
              <span key={q} className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-lg" style={{ backgroundColor: QUALITY_COLORS[q] || '#6b7280', boxShadow: `0 4px 15px ${(QUALITY_COLORS[q] || '#6b7280')}40` }}>
                {q}
              </span>
            ))}
            {movie.source && (
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-600/30">{movie.source}</span>
            )}
            {movie.audioLanguages?.map((lang) => (
              <span key={lang} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30">{lang}</span>
            ))}
            {movie.ottPlatform && movie.ottPlatform !== 'other' && (
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg capitalize shadow-lg shadow-red-600/30">{movie.ottPlatform}</span>
            )}
            {movie.type && movie.type !== 'movie' && (
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-yellow-600 rounded-lg capitalize shadow-lg shadow-yellow-600/30">{movie.type}</span>
            )}
          </div>

          {/* Info Card */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Movie Name', value: movie.cleanTitle },
                movie.imdbRating && { label: 'IMDb Rating', value: `⭐ ${movie.imdbRating}/10`, className: 'text-yellow-400 font-bold' },
                movie.releaseYear && { label: 'Release Year', value: movie.releaseYear },
                movie.audioLanguages?.length && { label: 'Language', value: movie.audioLanguages.join(' | ') },
                movie.qualities?.length && { label: 'Quality', value: movie.qualities.join(' | ') },
                movie.duration && { label: 'Duration', value: movie.duration },
                movie.source && { label: 'Source', value: movie.source },
                movie.ottPlatform && { label: 'Platform', value: movie.ottPlatform },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex gap-2">
                  <span className="text-gray-500 min-w-28 shrink-0">{item.label}:</span>
                  <span className={item.className || 'text-white'}>{item.value}</span>
                </div>
              ))}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-2 sm:col-span-2">
                  <span className="text-gray-500 min-w-28 shrink-0">Genre:</span>
                  <span className="text-white">{movie.genres.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {movie.description && (
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm-2-2V5h2v4h-2zM5 5v4h2V5H5zm-2 8v-2h2v2H3zm2 2v-2H3v2h2z" clipRule="evenodd" /></svg>
                Story / Plot
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{movie.description}</p>
            </div>
          )}

          {/* Screenshots - Smart Layout */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Screenshots
              </h2>
              {(() => {
                const shots = movie.screenshots.filter(Boolean); // Filter out empty/null
                const count = shots.length;
                const ScreenshotImage = ({ src, idx, className = '', fallbackSrc }: { src: string; idx: number; className?: string; fallbackSrc?: string }) => {
                  const [imgSrc, setImgSrc] = useState(src);
                  return (
                    <div key={idx} className={`relative rounded-xl overflow-hidden aspect-video bg-gray-900 group ${className}`}>
                      <img 
                        src={imgSrc} 
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => {
                          if (fallbackSrc && imgSrc !== fallbackSrc) {
                            setImgSrc(fallbackSrc);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  );
                };

                // 1 screenshot: full width
                if (count === 1) {
                  return <ScreenshotImage src={shots[0]} fallbackSrc={movie.posterUrl} idx={0} />;
                }
                // 2 screenshots: stacked vertically
                if (count === 2) {
                  return (
                    <div className="space-y-3">
                      {shots.map((src, i) => <ScreenshotImage key={i} src={src} fallbackSrc={movie.posterUrl} idx={i} />)}
                    </div>
                  );
                }
                // 3 screenshots: stacked vertically
                if (count === 3) {
                  return (
                    <div className="space-y-3">
                      {shots.map((src, i) => <ScreenshotImage key={i} src={src} fallbackSrc={movie.posterUrl} idx={i} />)}
                    </div>
                  );
                }
                // 4 screenshots: 2x2 collage
                if (count === 4) {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {shots.map((src, i) => <ScreenshotImage key={i} src={src} fallbackSrc={movie.posterUrl} idx={i} />)}
                    </div>
                  );
                }
                // 5+ screenshots: first 4 in collage, rest full width
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {shots.slice(0, 4).map((src, i) => <ScreenshotImage key={i} src={src} fallbackSrc={movie.posterUrl} idx={i} />)}
                    </div>
                    {shots.slice(4).map((src, i) => <ScreenshotImage key={i + 4} src={src} fallbackSrc={movie.posterUrl} idx={i + 4} />)}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Download Links */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Links
              </h2>
              <div className="space-y-3">
                {movie.downloadLinks.map((link, i) => (
                  <div key={i} className="relative overflow-hidden bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/5 rounded-xl p-4 animate-fade-in-up hover:border-emerald-500/20 transition-all duration-300 group/dl" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 to-emerald-600/0 group-hover/dl:from-emerald-600/[0.03] group-hover/dl:to-transparent transition-all duration-500" />
                    <p className="text-gray-300 text-sm mb-3 font-medium relative z-10">
                      <span className="text-yellow-400 font-bold">{link.label || link.quality}</span>
                    </p>
                    <button
                      onClick={() => handleDownload(link)}
                      disabled={downloading === link.quality}
                      className="relative overflow-hidden group/btn bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-emerald-900/30 active:scale-[0.98] hover:shadow-emerald-600/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      {downloading === link.quality ? (
                        <span className="animate-pulse relative z-10">Processing...</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          <span className="relative z-10">Download Now</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {movie.tags && movie.tags.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm mr-2">Tags:</span>
              {movie.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="inline-block bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg mr-2 mb-2 transition-all duration-200">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Telegram CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/20 p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,211,238,0.1),_transparent_60%)]" />
            <div className="relative">
              <h3 className="text-white font-bold text-base">Join our Telegram Channel</h3>
              <p className="text-cyan-300/70 text-sm">Get instant updates on latest releases</p>
            </div>
            <a
              href={movie.telegramUrl || 'https://t.me/vegamovies'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-cyan-900/30 active:scale-95"
            >
              Join Now
            </a>
          </div>

          {/* Related Movies */}
          {related.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Related Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {related.map((m) => (
                  <Link key={m._id} href={`/movie/${m.slug}`} className="group">
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[2/3]">
                      {m.posterUrl ? (
                        <Image src={m.posterUrl} alt={m.cleanTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Image</div>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2 group-hover:text-white transition-colors">{m.cleanTitle}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="lg:w-72 flex-shrink-0 space-y-6">
          {/* Poster */}
          {movie.posterUrl && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-b from-red-600/20 via-transparent to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-2xl overflow-hidden aspect-[2/3] shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
              </div>
            </div>
          )}

          {/* Recent Movies */}
          {recentMovies.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 p-4">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Recent Movies</h3>
              <div className="space-y-3">
                {recentMovies.map((m) => (
                  <Link key={m._id} href={`/movie/${m.slug}`} className="flex gap-3 group hover:bg-white/5 rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <div className="relative w-12 h-[4.5rem] flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
                      {m.posterUrl ? (
                        <Image src={m.posterUrl} alt={m.cleanTitle} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800" />
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-gray-400 text-xs font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug">
                        {m.title}
                      </p>
                      {m.releaseYear && (
                        <span className="text-gray-600 text-xs mt-0.5">{m.releaseYear}</span>
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
