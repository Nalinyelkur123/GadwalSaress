import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Upload, 
  Eye, 
  Check, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';

export const SellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    base_price: '',
    original_price: '',
    stock_quantity: 1,
    fabric: 'Pure Mulberry Silk (Silk Mark Certified)',
    zari_type: 'Tested Zari',
    border_style: 'Traditional Kuttu Interlocked Border',
    color: 'Maroon',
    primary_color: 'Maroon',
    saree_length_meters: 6.3,
    blouse_included: true,
    care_instructions: 'Dry Clean Only. Wrap in pure muslin cloth.',
    description: '',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
  });

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        api.get('/seller/products'),
        api.get('/storefront/categories'),
      ]);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
      if (catsRes.data?.[0]?.id) {
        setForm(prev => ({ ...prev, category_id: catsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      title: '',
      category_id: categories[0]?.id || '',
      base_price: '',
      original_price: '',
      stock_quantity: 1,
      fabric: 'Pure Mulberry Silk (Silk Mark Certified)',
      zari_type: 'Tested Zari',
      border_style: 'Traditional Kuttu Interlocked Border',
      color: 'Maroon',
      primary_color: 'Maroon',
      saree_length_meters: 6.3,
      blouse_included: true,
      care_instructions: 'Dry Clean Only. Wrap in pure muslin cloth.',
      description: '',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      title: p.title,
      category_id: p.category_id,
      base_price: p.base_price.toString(),
      original_price: p.original_price?.toString() || '',
      stock_quantity: p.stock_quantity,
      fabric: p.fabric,
      zari_type: p.zari_type,
      border_style: p.border_style,
      color: p.color,
      primary_color: p.primary_color || p.color,
      saree_length_meters: p.saree_length_meters || 6.3,
      blouse_included: p.blouse_included !== false,
      care_instructions: p.care_instructions || 'Dry clean only.',
      description: p.description,
      images: p.images || ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      if (editingProduct) {
        await api.put(`/seller/products/${editingProduct.id}`, {
          ...form,
          base_price: parseFloat(form.base_price),
          original_price: form.original_price ? parseFloat(form.original_price) : parseFloat(form.base_price),
          status: 'pending_approval', // Re-submitting triggers fresh admin review
        });
        setFeedback({ type: 'success', message: 'Saree updated and re-submitted for admin review!' });
      } else {
        await api.post('/seller/products', {
          ...form,
          base_price: parseFloat(form.base_price),
          original_price: form.original_price ? parseFloat(form.original_price) : parseFloat(form.base_price),
        });
        setFeedback({ type: 'success', message: 'Saree created and submitted for admin review!' });
      }
      setModalOpen(false);
      fetchProductsAndCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save product.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this saree listing?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      setFeedback({ type: 'success', message: 'Listing archived.' });
      fetchProductsAndCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to archive.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Manage Saree Listings</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Create, edit, and track pit-loom handloom inventory awaiting approval or active on the storefront.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span>Add New Saree</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Total Listings</span>
          <p className="font-serif text-2xl font-bold text-charcoal-900 mt-1">{products.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Live in Store</span>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">
            {products.filter(p => p.status === 'approved').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-amber-700">Under Review</span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">
            {products.filter(p => p.status === 'pending_approval').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-red-700">Needs Changes</span>
          <p className="font-serif text-2xl font-bold text-red-600 mt-1">
            {products.filter(p => p.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Saree & SKU</th>
              <th className="p-4">Fabric & Zari</th>
              <th className="p-4">Price</th>
              <th className="p-4">Inventory</th>
              <th className="p-4">Approval Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500">Loading your listings...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500">
                  You haven't listed any sarees yet. Click "Add New Saree" to begin.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                        alt={p.title}
                        className="w-12 h-14 object-cover object-top rounded border border-ivory-300 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-charcoal-900">{p.title}</h4>
                        <span className="font-mono text-[10px] text-charcoal-500 block">SKU: {p.sku}</span>
                        {p.status === 'rejected' && p.admin_rejection_reason && (
                          <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-700 max-w-sm">
                            <b>Admin Feedback:</b> {p.admin_rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-charcoal-600">
                    <p className="font-medium text-charcoal-800">{p.fabric}</p>
                    <p className="text-[10px] text-charcoal-500">{p.zari_type}</p>
                    <p className="text-[10px] text-gold-700">{p.border_style}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-serif font-bold text-brand-900 block">₹{p.base_price.toLocaleString('en-IN')}</span>
                    {p.original_price > p.base_price && (
                      <span className="text-[10px] text-charcoal-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-charcoal-800">
                    {p.stock_quantity} in stock
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setPreviewProduct(p)}
                      className="p-1.5 text-charcoal-500 hover:text-brand-800 hover:bg-ivory-200 rounded transition-colors"
                      title="Preview Saree"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-charcoal-500 hover:text-brand-800 hover:bg-ivory-200 rounded transition-colors"
                      title="Edit Saree"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Archive Listing"
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

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-xl max-w-xl w-full p-6 border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingProduct ? 'Edit Saree Listing' : 'List Authentic Gadwal Saree'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Saree Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon Gadwal Pure Silk Saree with Temple Border"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Stock Available *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Selling Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="24500"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-bold text-brand-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Compare-at Price (₹)</label>
                  <input
                    type="number"
                    min={100}
                    placeholder="28000"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none text-charcoal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Primary Color</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value, primary_color: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none bg-white"
                  >
                    <option value="Maroon">Maroon</option>
                    <option value="Royal Blue">Royal Blue</option>
                    <option value="Mustard Yellow">Mustard Yellow</option>
                    <option value="Emerald Green">Emerald Green</option>
                    <option value="Wine Red">Wine Red</option>
                    <option value="Cream / Off-White">Cream / Off-White</option>
                    <option value="Teal">Teal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Zari Type</label>
                  <input
                    type="text"
                    value={form.zari_type}
                    onChange={(e) => setForm({ ...form, zari_type: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Fabric & Weave</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Border Technique</label>
                  <input
                    type="text"
                    value={form.border_style}
                    onChange={(e) => setForm({ ...form, border_style: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Artisan Saree Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail the pit-loom interlocking, border zari motif, and drape..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">High-Resolution Image URL (R2)</label>
                <input
                  type="url"
                  required
                  value={form.images[0] || ''}
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>All listings undergo admin quality checks to preserve authentic GI certification.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-ivory-400 text-charcoal-700 rounded font-semibold text-xs hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded font-semibold text-xs transition-colors"
                >
                  {submitting ? 'Submitting...' : (editingProduct ? 'Update & Re-Submit' : 'Submit Saree for Approval')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900">{previewProduct.title}</h3>
              <button onClick={() => setPreviewProduct(null)} className="text-charcoal-400 hover:text-charcoal-700 font-bold">✕</button>
            </div>
            <img
              src={previewProduct.images[0]}
              alt={previewProduct.title}
              className="w-full h-56 object-cover object-top rounded border border-ivory-300"
            />
            <div className="space-y-1 text-xs">
              <p className="font-serif font-bold text-base text-brand-900">₹{previewProduct.base_price.toLocaleString('en-IN')}</p>
              <p className="text-charcoal-600 leading-relaxed">{previewProduct.description}</p>
              <div className="pt-2 text-charcoal-700 space-y-1">
                <p><b>Fabric:</b> {previewProduct.fabric}</p>
                <p><b>Zari:</b> {previewProduct.zari_type}</p>
                <p><b>Stock:</b> {previewProduct.stock_quantity} available</p>
              </div>
            </div>
            <div className="pt-3 border-t border-ivory-200 flex justify-end">
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-brand-700 text-white rounded text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
