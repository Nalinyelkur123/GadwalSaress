import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Layers, Image as ImageIcon, ArrowUpDown, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Category, Collection } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'collections'>('categories');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, colRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/storefront/collections'),
      ]);
      setCategories(catsRes.data || []);
      setCollections(colRes.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      display_order: categories.length + 1,
      is_active: true,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order || 1,
      is_active: cat.is_active ?? true,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
        setSuccessMsg(`Category "${formData.name}" updated successfully!`);
      } else {
        await api.post('/admin/categories', formData);
        setSuccessMsg(`Category "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      setSuccessMsg(`Category "${cat.name}" deleted.`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  const toggleCategoryActive = async (cat: Category) => {
    try {
      await api.put(`/admin/categories/${cat.id}`, { is_active: !cat.is_active });
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Category & Collection Management</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage handloom saree classifications, display orders, banners, and homepage navigation.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-warm-sm transition-colors"
        >
          <Plus size={15} /> Add New Category
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-ivory-300">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-brand-700 text-brand-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'collections'
              ? 'border-brand-700 text-brand-900'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* CATEGORIES TABLE */}
      {activeTab === 'categories' ? (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Category</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-charcoal-500">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-charcoal-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-charcoal-500">#{cat.display_order}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cat.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120'}
                          alt={cat.name}
                          className="w-10 h-10 object-cover rounded border border-ivory-300 flex-shrink-0"
                        />
                        <div>
                          <span className="font-serif font-bold text-charcoal-900 block">{cat.name}</span>
                          <span className="text-[10px] text-charcoal-400">ID: {cat.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-charcoal-600 text-[11px]">{cat.slug}</td>
                    <td className="p-4 text-charcoal-600 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleCategoryActive(cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          cat.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-charcoal-100 text-charcoal-500'
                        }`}
                      >
                        {cat.is_active !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-charcoal-600 hover:text-brand-800 hover:bg-ivory-200 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* COLLECTIONS TABLE */
        <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Collection Title</th>
                <th className="p-4">Tag</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-ivory-50">
                  <td className="p-4 font-mono font-bold text-charcoal-500">#{col.display_order}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {col.banner_url && (
                        <img
                          src={col.banner_url}
                          alt={col.title}
                          className="w-12 h-8 object-cover rounded border border-ivory-300"
                        />
                      )}
                      <div>
                        <span className="font-serif font-bold text-charcoal-900 block">{col.title}</span>
                        <span className="text-[10px] text-charcoal-500">{col.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gold-700">{col.tag || 'Special'}</td>
                  <td className="p-4 font-mono text-charcoal-600 text-[11px]">{col.slug}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Silk Sarees"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, name, slug });
                  }}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Artisanal description of this saree category"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Category Image / Banner URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded border border-ivory-300"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-ivory-400 text-brand-700 focus:ring-brand-700"
                    />
                    <span className="font-semibold text-charcoal-700">Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-ivory-400 rounded text-charcoal-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded font-semibold"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
