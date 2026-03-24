'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const TYPES = ['movie', 'series', 'anime', 'kdrama', 'documentary', 'wwe'];
const SOURCES = ['WEB-DL', 'BluRay', 'WEBRip', 'HDCAM', 'DVDRIP', 'HDTV'];
const OTT_PLATFORMS = ['netflix', 'amazon', 'apple', 'hotstar', 'disney', 'minitv', 'turkish', 'chinese', 'discovery', 'wwe', 'other'];
const QUALITIES = ['480p', '720p', '1080p', '2160p', '60fps'];

export default function NewMovie() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    cleanTitle: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    releaseDate: '',
    releaseYear: new Date().getFullYear(),
    source: 'WEB-DL',
    audioLanguages: [] as string[],
    type: 'movie',
    ottPlatform: 'other',
    genres: [] as string[],
    qualities: [] as string[],
    downloadLinks: [] as any[],
    imdbRating: 7.5,
    duration: '',
    isTrending: false,
    isFeatured: false,
    isAdult: false,
    tags: [] as string[],
    screenshots: [] as string[],
    telegramUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioInput, setAudioInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddLink = () => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: [...prev.downloadLinks, { quality: '720p', size: '', url: '', label: '' }],
    }));
  };

  const handleUpdateLink = (idx: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: prev.downloadLinks.map((link, i) =>
        i === idx ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleRemoveLink = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: prev.downloadLinks.filter((_, i) => i !== idx),
    }));
  };

  const handleAddAudio = () => {
    if (audioInput.trim()) {
      setFormData(prev => ({
        ...prev,
        audioLanguages: [...prev.audioLanguages, audioInput],
      }));
      setAudioInput('');
    }
  };

  const handleRemoveAudio = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      audioLanguages: prev.audioLanguages.filter((_, i) => i !== idx),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== idx),
    }));
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleAddScreenshot = () => {
    if (screenshotInput.trim()) {
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, screenshotInput.trim()] }));
      setScreenshotInput('');
    }
  };

  const handleRemoveScreenshot = (idx: number) => {
    setFormData(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== idx) }));
  };

  const toggleQuality = (quality: string) => {
    setFormData(prev => ({
      ...prev,
      qualities: prev.qualities.includes(quality)
        ? prev.qualities.filter(q => q !== quality)
        : [...prev.qualities, quality],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clean and coerce data before sending
      const payload: any = {
        ...formData,
        // Ensure numbers are actual numbers, not strings
        releaseYear: formData.releaseYear ? Number(formData.releaseYear) : undefined,
        imdbRating: formData.imdbRating ? Number(formData.imdbRating) : undefined,
        // Convert empty strings to undefined so optional validators pass
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : undefined,
        posterUrl: formData.posterUrl || undefined,
        backdropUrl: formData.backdropUrl || undefined,
        duration: formData.duration || undefined,
        description: formData.description || undefined,
        telegramUrl: formData.telegramUrl || undefined,
        screenshots: formData.screenshots.filter(s => s.trim()),
        // Filter out incomplete download links (missing url)
        downloadLinks: formData.downloadLinks.filter(l => l.url && l.url.trim()),
      };

      await adminAPI.createMovie(payload);
      router.push('/admin/movies');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to create movie';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Add New Movie</h1>

        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Clean Title (Movie Name)</label>
                <input
                  type="text"
                  name="cleanTitle"
                  value={formData.cleanTitle}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Full Title (with year, source, sizes)</label>
                <textarea
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Poster URL</label>
                  <input
                    type="url"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Backdrop URL</label>
                  <input
                    type="url"
                    name="backdropUrl"
                    value={formData.backdropUrl}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Release Date</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Release Year</label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Classification</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">OTT Platform</label>
                  <select
                    name="ottPlatform"
                    value={formData.ottPlatform}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  >
                    {OTT_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Genres</label>
                <div className="grid grid-cols-3 gap-2">
                  {GENRES.map(genre => (
                    <label key={genre} className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.genres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                        className="mr-2"
                      />
                      {genre}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Audio Languages</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={audioInput}
                    onChange={(e) => setAudioInput(e.target.value)}
                    placeholder="e.g., Hindi"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddAudio}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.audioLanguages.map((lang, idx) => (
                    <div key={idx} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {lang}
                      <button type="button" onClick={() => handleRemoveAudio(idx)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">IMDB Rating</label>
                  <input
                    type="number"
                    name="imdbRating"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.imdbRating}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Duration (e.g., 2h 15m)</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Qualities</label>
                <div className="flex flex-wrap gap-2">
                  {QUALITIES.map(quality => (
                    <label key={quality} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.qualities.includes(quality)}
                        onChange={() => toggleQuality(quality)}
                        className="mr-2"
                      />
                      <span className="text-gray-300">{quality}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., Action"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <div key={idx} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Is Trending?
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Is Featured?
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name="isAdult"
                    checked={formData.isAdult}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Is Adult Content?
                </label>
              </div>
            </div>
          </div>

          {/* Download Links */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Download Links</h2>
            <div className="space-y-4">
              {formData.downloadLinks.map((link, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded flex gap-2">
                  <select
                    value={link.quality}
                    onChange={(e) => handleUpdateLink(idx, 'quality', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
                  >
                    {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <input
                    type="text"
                    value={link.size}
                    onChange={(e) => handleUpdateLink(idx, 'size', e.target.value)}
                    placeholder="e.g., 1.8GB"
                    className="flex-1 bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                    placeholder="Download URL"
                    className="flex-1 bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                    placeholder="e.g., 1080p [1.8GB]"
                    className="flex-1 bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                + Add Download Link
              </button>
            </div>
          </div>

          {/* Screenshots */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Screenshots</h2>
            <p className="text-gray-400 text-sm mb-3">Add URL links to movie screenshots/stills that will appear on the movie page.</p>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={screenshotInput}
                onChange={(e) => setScreenshotInput(e.target.value)}
                placeholder="https://... screenshot image URL"
                className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddScreenshot())}
              />
              <button type="button" onClick={handleAddScreenshot} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Add
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {formData.screenshots.map((url, idx) => (
                <div key={idx} className="relative bg-gray-800 rounded p-2 flex items-center gap-2">
                  <span className="text-gray-400 text-xs flex-1 truncate">{url}</span>
                  <button type="button" onClick={() => handleRemoveScreenshot(idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Telegram URL */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Telegram Channel</h2>
            <input
              type="url"
              name="telegramUrl"
              value={formData.telegramUrl}
              onChange={handleInputChange}
              placeholder="https://t.me/yourchannel"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Movie'}
            </button>
            <Link
              href="/admin/movies"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
