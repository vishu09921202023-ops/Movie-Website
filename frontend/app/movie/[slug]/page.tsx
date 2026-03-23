'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { movieAPI } from '@/lib/api';
import DownloadButton from '@/components/DownloadButton';
import MovieGrid from '@/components/MovieGrid';
import Image from 'next/image';
import { Movie } from '@/lib/types';

export default function MovieDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieAPI.getBySlug(slug);
        const movieData = res.data;
        setMovie(movieData);

        await movieAPI.recordView(movieData._id);

        if (movieData.genres && movieData.genres.length > 0) {
          const relatedRes = await movieAPI.getMovies({
            genre: movieData.genres[0],
            limit: 6,
          });
          setRelated(relatedRes.data.movies.filter((m: Movie) => m._id !== movieData._id));
        }
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!movie) {
    return <div className="text-center py-12 text-gray-400">Movie not found</div>;
  }

  return (
    <div>
      {/* Backdrop with Gradient */}
      <div className="relative -mx-4 -mt-8 mb-8 h-96">
        {movie.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            className="w-full h-full object-cover"
            priority
          />
        )}
        <div className="gradient-overlay" />
      </div>

      {/* Movie Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 -mt-32 relative z-10 mb-8">
        {/* Poster */}
        <div className="md:col-span-1">
          {movie.posterUrl && (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded-lg w-full"
            />
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-3">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.releaseYear && (
              <span className="bg-gray-700 px-3 py-1 rounded text-sm">{movie.releaseYear}</span>
            )}
            {movie.source && (
              <span className="bg-gray-700 px-3 py-1 rounded text-sm">{movie.source}</span>
            )}
            {movie.audioLanguages && movie.audioLanguages.length > 0 && (
              <span className="bg-gray-700 px-3 py-1 rounded text-sm">
                {movie.audioLanguages.join(', ')}
              </span>
            )}
            {movie.imdbRating && (
              <span className="bg-yellow-600 px-3 py-1 rounded text-sm font-bold">
                ⭐ {movie.imdbRating}/10
              </span>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Genres:</p>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* OTT Platform */}
          {movie.ottPlatform && (
            <div className="mb-6">
              <p className="text-gray-400">
                Platform: <span className="text-green-400 font-semibold">{movie.ottPlatform}</span>
              </p>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <p className="text-gray-300 mb-6 leading-relaxed">{movie.description}</p>
          )}

          {/* Download Buttons */}
          {movie.downloadLinks && movie.downloadLinks.length > 0 && (
            <DownloadButton movieId={movie._id} links={movie.downloadLinks} />
          )}
        </div>
      </div>

      {/* Related Movies */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Movies</h2>
          <MovieGrid movies={related} />
        </div>
      )}
    </div>
  );
}
