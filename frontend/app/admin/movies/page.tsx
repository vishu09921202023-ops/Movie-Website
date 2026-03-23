'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';
import { Movie } from '@/lib/types';

export default function AdminMovies() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchMovies();
  }, [page, router]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMovies({ page, limit: 20 });
      setMovies(res.data.movies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      await adminAPI.deleteMovie(id);
      fetchMovies();
    } catch (error) {
      console.error('Failed to delete movie:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Manage Movies</h1>
          <Link
            href="/admin/movies/new"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold"
          >
            + Add New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">Title</th>
                  <th className="px-6 py-3 text-left text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-gray-300">Views</th>
                  <th className="px-6 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie._id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-3">
                      <p className="text-white font-semibold">{movie.cleanTitle}</p>
                      <p className="text-gray-400 text-sm">Short: {movie.title.substring(0, 50)}...</p>
                    </td>
                    <td className="px-6 py-3 text-gray-300">{movie.type}</td>
                    <td className="px-6 py-3 text-gray-300">{movie.views}</td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/movies/${movie._id}/edit`}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
