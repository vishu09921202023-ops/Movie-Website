'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { AnalyticsData } from '@/lib/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await adminAPI.getAnalytics();
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const { stats, dailyViews, topMovies } = data || {};

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              router.push('/admin/login');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Movies" value={stats?.totalMovies || 0} />
          <StatCard label="Total Views" value={stats?.totalViews || 0} />
          <StatCard label="Total Downloads" value={stats?.totalDownloads || 0} />
          <StatCard label="Total Anime" value={stats?.totalAnime || 0} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/admin/movies/new"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold transition"
          >
            + Add New Movie
          </Link>
          <Link
            href="/admin/movies"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold transition"
          >
            Manage Movies
          </Link>
          <Link
            href="/admin/sitelinks"
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded font-bold transition"
          >
            Site Links
          </Link>
          <Link
            href="/admin/analytics"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold transition"
          >
            📊 Click Analytics
          </Link>
        </div>

        {/* Top Movies */}
        {topMovies && topMovies.length > 0 && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Top 10 Most Downloaded</h2>
            <div className="space-y-3">
              {topMovies.slice(0, 10).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                  <span className="text-gray-300">{item.movie?.[0]?.title || 'Unknown'}</span>
                  <span className="text-yellow-400 font-bold">{item.count} downloads</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
