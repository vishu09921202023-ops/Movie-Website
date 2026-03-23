'use client';

import { useEffect, useState, useRouter } from 'react';
import { adminAPI } from '@/lib/api';
import { SiteLink } from '@/lib/types';
import Link from 'next/link';

export default function AdminSiteLinks() {
  const router = useRouter();
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    color: '#3b82f6',
    icon: '',
    row: 1,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSiteLinks();
      setLinks(res.data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateSiteLink(editingId, formData);
      } else {
        await adminAPI.createSiteLink(formData);
      }
      fetchLinks();
      resetForm();
    } catch (error) {
      console.error('Failed to save link:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    try {
      await adminAPI.deleteSiteLink(id);
      fetchLinks();
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      url: '',
      color: '#3b82f6',
      icon: '',
      row: 1,
      order: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (link: SiteLink) => {
    setFormData({
      label: link.label,
      url: link.url,
      color: link.color,
      icon: link.icon || '',
      row: link.row,
      order: link.order,
      isActive: link.isActive,
    });
    setEditingId(link._id);
    setShowForm(true);
  };

  const row1Links = links.filter(l => l.row === 1);
  const row2Links = links.filter(l => l.row === 2);

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Manage Site Links</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold"
          >
            + Add Link
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 p-6 rounded-lg mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  required
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded text-sm"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                />
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Row</label>
                  <select
                    value={formData.row}
                    onChange={(e) => setFormData({ ...formData, row: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                  >
                    <option value={1}>Row 1</option>
                    <option value={2}>Row 2</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Order"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-24 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded"
                />
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {/* Row 1 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Filter Row 1</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {row1Links.length === 0 ? (
                  <p className="text-gray-400">No links in Row 1</p>
                ) : (
                  row1Links.map((link) => (
                    <div key={link._id} className="bg-gray-900 p-4 rounded border border-gray-800">
                      <div
                        className="px-4 py-2 rounded-full text-white font-bold mb-3 text-center"
                        style={{ backgroundColor: link.color }}
                      >
                        {link.label}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 truncate">{link.url}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Quick Filter Row 2</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {row2Links.length === 0 ? (
                  <p className="text-gray-400">No links in Row 2</p>
                ) : (
                  row2Links.map((link) => (
                    <div key={link._id} className="bg-gray-900 p-4 rounded border border-gray-800">
                      <div
                        className="px-4 py-2 rounded-full text-white font-bold mb-3 text-center"
                        style={{ backgroundColor: link.color }}
                      >
                        {link.label}
                      </div>
                      <p className="text-gray-400 text-sm mb-3 truncate">{link.url}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
