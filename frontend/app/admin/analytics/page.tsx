'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const TYPE_COLORS: Record<string, string> = {
  movie: '#3b82f6',
  series: '#10b981',
  anime: '#f59e0b',
  kdrama: '#a855f7',
  documentary: '#6b7280',
  wwe: '#ef4444',
};

const RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'Series', value: 'series' },
  { label: 'Anime', value: 'anime' },
  { label: 'K-Drama', value: 'kdrama' },
];

const SORT_OPTIONS: [string, string][] = [
  ['clicks', 'Most Clicked'],
  ['recent', 'Recently Clicked'],
  ['alpha', 'Alphabetical'],
];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(null);
  const [byType, setByType] = useState<any[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('clicks');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, byTypeRes, topRes] = await Promise.all([
        adminAPI.getClicksOverview(),
        adminAPI.getClicksByType(range),
        adminAPI.getTopClicks({ limit: 10, type: typeFilter, range }),
      ]);
      setOverview(overviewRes.data);
      setByType(byTypeRes.data);
      setTopContent(topRes.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [range, typeFilter]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin/login'); return; }
    fetchData();
  }, [fetchData, router]);

  const sorted = [...topContent].sort((a, b) => {
    if (sortBy === 'clicks') return b.totalClicks - a.totalClicks;
    if (sortBy === 'recent') return new Date(b.lastClicked).getTime() - new Date(a.lastClicked).getTime();
    return (a.title || '').localeCompare(b.title || '');
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(
        `${apiUrl}/admin/clicks/export?range=${range}&type=${typeFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'click-analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const chartData = byType.map(d => ({ name: d._id || 'unknown', clicks: d.count }));
  const typeTotal = byType.reduce((s, d) => s + d.count, 0);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">📊 Click Analytics</h1>
            <p className="text-gray-400 mt-1 text-sm">Download click tracking across all content</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium text-sm transition"
            >
              {exporting ? 'Exporting...' : '⬇ Download CSV'}
            </button>
            <Link href="/admin/dashboard" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm font-medium">Date Range:</span>
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${range === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm font-medium">Type:</span>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${typeFilter === opt.value ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">Loading analytics data...</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <OverviewCard label="Today's Clicks" value={overview?.today ?? 0} color="blue" />
              <OverviewCard label="This Week" value={overview?.week ?? 0} color="green" />
              <OverviewCard label="This Month" value={overview?.month ?? 0} color="purple" />
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm mb-2">🏆 Top Content</p>
                <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                  {overview?.topContent?.title || 'N/A'}
                </p>
                {overview?.topContent && (
                  <p className="text-yellow-400 text-xs mt-1">{overview.topContent.count?.toLocaleString()} total clicks</p>
                )}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-bold mb-4">Clicks by Content Type</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                        labelStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={TYPE_COLORS[d.name] || '#6b7280'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No click data yet</div>
                )}
              </div>

              {/* Progress Bars Breakdown */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-bold mb-4">Type Breakdown</h2>
                {byType.length > 0 ? (
                  <div className="space-y-4">
                    {byType.map((d, i) => {
                      const pct = typeTotal > 0 ? Math.round((d.count / typeTotal) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 capitalize">{d._id || 'Unknown'}</span>
                            <span className="text-white font-medium">
                              {d.count.toLocaleString()} <span className="text-gray-500">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[d._id] || '#6b7280' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No data for this filter</p>
                )}
              </div>
            </div>

            {/* Top 10 Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-white font-bold text-lg">🔥 Top Most Clicked Content</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-sm">Sort:</span>
                  {SORT_OPTIONS.map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setSortBy(val)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${sortBy === val ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {sorted.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700 text-left">
                        <th className="py-2 px-3 w-10">#</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Total Clicks</th>
                        <th className="py-2 px-3 text-right">Last Clicked</th>
                        <th className="py-2 px-3 text-right">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((item, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/60 transition">
                          <td className="py-3 px-3 text-gray-500 font-bold">{i + 1}</td>
                          <td className="py-3 px-3 text-white font-medium max-w-xs truncate">{item.title || 'Unknown'}</td>
                          <td className="py-3 px-3">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium capitalize text-white"
                              style={{ backgroundColor: TYPE_COLORS[item.contentType] || '#6b7280' }}
                            >
                              {item.contentType || 'movie'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-yellow-400 font-bold">{item.totalClicks.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-gray-400 text-xs">
                            {item.lastClicked ? new Date(item.lastClicked).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/analytics/${item._id}`}
                              className="text-blue-400 hover:text-blue-300 text-xs underline"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-base">No click data yet.</p>
                  <p className="text-sm mt-1">Clicks will appear here after users start downloading.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color] || 'text-white'}`}>{value.toLocaleString()}</p>
    </div>
  );
}
