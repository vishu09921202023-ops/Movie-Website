'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const QUALITY_COLORS: Record<string, string> = {
  '2160p': '#9333ea',
  '1080p': '#ef4444',
  '720p': '#3b82f6',
  '480p': '#22c55e',
  '60fps': '#f97316',
};

export default function MovieAnalyticsDetail() {
  const params = useParams();
  const movieId = params.movieId as string;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }

    adminAPI.getClicksForMovie(movieId)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [movieId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400 animate-pulse">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">No data found for this content.</p>
          <Link href="/admin/analytics" className="text-blue-400 hover:text-blue-300">← Back to Analytics</Link>
        </div>
      </div>
    );
  }

  const qualityTotal = (data.byQuality || []).reduce((s: number, q: any) => s + q.count, 0);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/analytics" className="text-gray-400 hover:text-white text-sm transition">
            ← Analytics
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {data.movieInfo?.movieTitle || 'Movie'} — Detail
            </h1>
            <p className="text-gray-400 text-sm capitalize">{data.movieInfo?.contentType || 'movie'}</p>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-2">Total Clicks (All Time)</p>
          <p className="text-5xl font-bold text-yellow-400">{(data.totalClicks ?? 0).toLocaleString()}</p>
        </div>

        {/* 7-Day Daily Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="text-white font-bold mb-4">Last 7 Days — Daily Clicks</h2>
          {data.daily?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.daily.map((d: any) => ({ date: d._id, clicks: d.count }))}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              No clicks in the last 7 days
            </div>
          )}
        </div>

        {/* Quality Breakdown */}
        {data.byQuality?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-bold mb-4">Clicks by Quality</h2>
            <div className="space-y-4">
              {data.byQuality.map((q: any, i: number) => {
                const pct = qualityTotal > 0 ? Math.round((q.count / qualityTotal) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium">{q._id || 'Unknown'}</span>
                      <span className="text-white font-medium">
                        {q.count.toLocaleString()} <span className="text-gray-500">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: QUALITY_COLORS[q._id] || '#6b7280' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
