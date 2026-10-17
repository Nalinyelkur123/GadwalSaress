import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Star, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, SellerProfile } from '../../types';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'archived'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Product Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    category_id: '',
    seller_id: '',
    base_price: '',
    original_price: '',
    stock_quantity: 1,
    fabric: 'Pure Mulberry Silk',
    zari_type: 'Tested Zari',
    border_style: 'Kuttu Interlock Border',
    color: 'Maroon',
    care_instructions: 'Dry Clean Only. Wrap in pure muslin cloth.',
    description: '',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'],
    is_featured: false,
    is_bestseller: false,
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes, sellersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories'),
        api.get('/admin/sellers'),
      ]);
      setProducts(prodsRes.data || []);
      setCategories(catsRes.data || []);
      setSellers(sellersRes.data || []);
      if (catsRes.data?.[0]?.id) {
        setFormData(prev => ({ ...prev, category_id: catsRes.data[0].id }));
      }
      if (sellersRes.data?.[0]?.id) {
        setFormData(prev => ({ ...prev, seller_id: sellersRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching admin products data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await api.put(`/admin/products/${id}/moderation`, {
        status,
        admin_rejection_reason: reason,
      });
      showFeedback('success', `Product ${status === 'approved' ? 'Approved' : 'Rejected'} successfully!`);
      setReviewProduct(null);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.error || 'Failed to update product moderation.');
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}/moderation`, {
        status: product.status,
        is_featured: !product.is_featured,
      });
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this product? It will no longer be visible on storefront.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showFeedback('success', 'Product archived.');
      fetchData();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.error || 'Failed to archive product.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}/moderation`, {
          ...formData,
          base_price: parseFloat(formData.base_price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : parseFloat(formData.base_price),
        });
        showFeedback('success', 'Product updated successfully!');
      } else {
        await api.post('/admin/products', formData);
        showFeedback('success', 'Product created and published!');
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.error || 'Failed to save product.');
    }
  };

  const exportCSV = () => {
    const headers = ['ID,SKU,Title,Category,Seller,BasePrice,Stock,Status,Featured'];
    const rows = filteredProducts.map(p => 
      `"${p.id}","${p.sku}","${p.title.replace(/"/g, '""')}","${p.category_name}","${p.seller_name}",${p.base_price},${p.stock_quantity},"${p.status}",${p.is_featured}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gadwal_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.seller_name && p.seller_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSeller = selectedSeller === 'all' || p.seller_id === selectedSeller;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesSeller && matchesStatus;
  });

  const pendingApprovalsCount = products.filter(p => p.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Catalog Moderation & Inventory CRM</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Approve weaver listings, edit handloom specifications, manage inventory, and feature sarees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 rounded text-xs font-semibold shadow-warm-sm transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-warm-sm transition-colors"
          >
            <Plus size={15} /> Add New Saree
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* APPROVAL QUEUE ALERT BANNER */}
      {pendingApprovalsCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock size={20} className="text-amber-700 flex-shrink-0" />
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-900">
                {pendingApprovalsCount} Product{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Admin Approval
              </h4>
              <p className="text-xs text-amber-700">Artisans have submitted new handloom listings for quality and authenticity verification.</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus('pending_approval')}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold transition-colors"
          >
            Review Queue
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-ivory-300 shadow-warm-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search SKU, title, artisan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-ivory-100 border border-ivory-300 rounded text-xs focus:border-brand-700 outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-2 bg-ivory-100 border border-ivory-300 rounded text-xs text-charcoal-700 focus:border-brand-700 outline-none"
        >
          <option value="all">All Statuses ({products.length})</option>
          <option value="pending_approval">Pending Approval ({pendingApprovalsCount})</option>
          <option value="approved">Approved & Live</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-ivory-100 border border-ivory-300 rounded text-xs text-charcoal-700 focus:border-brand-700 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedSeller}
          onChange={(e) => setSelectedSeller(e.target.value)}
          className="px-3 py-2 bg-ivory-100 border border-ivory-300 rounded text-xs text-charcoal-700 focus:border-brand-700 outline-none"
        >
          <option value="all">All Artisans / Sellers</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.business_name}</option>
          ))}
        </select>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Saree & SKU</th>
              <th className="p-4">Artisan Weaver</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-charcoal-500">Loading catalog...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-charcoal-500">No sarees found matching filters.</td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                        alt={p.title}
                        className="w-12 h-14 object-cover object-top rounded border border-ivory-300 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-charcoal-900 hover:text-brand-800 transition-colors cursor-pointer" onClick={() => setPreviewProduct(p)}>
                          {p.title}
                        </h4>
                        <span className="font-mono text-[10px] text-charcoal-500 block">SKU: {p.sku}</span>
                        <span className="text-[10px] text-gold-700 font-semibold">{p.fabric}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-charcoal-900 block">{p.seller_name || 'Artisan Group'}</span>
                    <span className="text-[10px] text-charcoal-400">ID: {p.seller_id}</span>
                  </td>
                  <td className="p-4 text-charcoal-600">{p.category_name || 'Pure Silk'}</td>
                  <td className="p-4">
                    <span className="font-serif font-bold text-brand-900 block">₹{p.base_price.toLocaleString('en-IN')}</span>
                    {p.original_price > p.base_price && (
                      <span className="text-[10px] text-charcoal-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${p.stock_quantity <= 2 ? 'text-red-600' : 'text-charcoal-800'}`}>
                      {p.stock_quantity} in stock
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-ivory-200 text-charcoal-500'
                      }`}
                    >
                      {p.is_featured ? '★ Featured' : '☆ Feature'}
                    </button>
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
                    {p.status === 'pending_approval' ? (
                      <>
                        <button
                          onClick={() => handleModerate(p.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors"
                          title="Approve Listing"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewProduct(p)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition-colors"
                          title="Reject Listing with Feedback"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setPreviewProduct(p)}
                          className="p-1.5 text-charcoal-500 hover:text-brand-800 hover:bg-ivory-200 rounded transition-colors"
                          title="Preview Listing"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormData({
                              title: p.title,
                              slug: p.slug,
                              sku: p.sku,
                              category_id: p.category_id,
                              seller_id: p.seller_id,
                              base_price: p.base_price.toString(),
                              original_price: p.original_price.toString(),
                              stock_quantity: p.stock_quantity,
                              fabric: p.fabric,
                              zari_type: p.zari_type,
                              border_style: p.border_style,
                              color: p.color,
                              care_instructions: p.care_instructions,
                              description: p.description,
                              images: p.images,
                              is_featured: p.is_featured,
                              is_bestseller: p.is_bestseller,
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-charcoal-500 hover:text-brand-800 hover:bg-ivory-200 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Archive Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REJECTION REASON MODAL */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300">
            <h3 className="font-serif font-bold text-lg text-charcoal-900">Reject Handloom Listing</h3>
            <p className="text-xs text-charcoal-600">
              Provide constructive feedback to weaver <b>{reviewProduct.seller_name}</b> explaining why <b>{reviewProduct.title}</b> cannot be approved in its current form.
            </p>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Rejection Reason / Required Changes *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Please provide high-resolution photo of the pallu zari work and confirm pure silk certification."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-ivory-400 rounded text-xs outline-none focus:border-red-600"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewProduct(null)}
                className="px-4 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-600 hover:bg-ivory-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={() => handleModerate(reviewProduct.id, 'rejected', rejectionReason)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingProduct ? 'Edit Saree Listing' : 'Add New Authentic Gadwal Saree'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal-700 mb-1">Saree Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Maroon Gadwal Pure Silk Saree with Temple Border"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, title, slug });
                    }}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Artisan / Weaver *</label>
                  <select
                    value={formData.seller_id}
                    onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>{s.business_name} ({s.location})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="24500"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-semibold text-brand-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Compare-at Price (₹)</label>
                  <input
                    type="number"
                    min={100}
                    placeholder="28000"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none text-charcoal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="GW-PMS-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Fabric Composition *</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Zari Type</label>
                  <input
                    type="text"
                    value={formData.zari_type}
                    onChange={(e) => setFormData({ ...formData, zari_type: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Primary Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Border Style</label>
                  <input
                    type="text"
                    value={formData.border_style}
                    onChange={(e) => setFormData({ ...formData, border_style: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Weaving background, zari motifs, pit loom details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal-700 mb-1">Primary Image URL (Cloudflare R2)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={formData.images[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-ivory-400 text-brand-700 focus:ring-brand-700"
                  />
                  <span className="font-semibold text-charcoal-700">Feature on Homepage</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="rounded border-ivory-400 text-brand-700 focus:ring-brand-700"
                  />
                  <span className="font-semibold text-charcoal-700">Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-ivory-400 rounded text-charcoal-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded font-semibold"
                >
                  {editingProduct ? 'Save Saree Changes' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900">Listing Preview: {previewProduct.title}</h3>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={previewProduct.images[0]}
                alt={previewProduct.title}
                className="w-full sm:w-48 h-64 object-cover object-top rounded border border-ivory-300"
              />
              <div className="space-y-2 text-xs flex-1">
                <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider">
                  {previewProduct.category_name}
                </span>
                <h4 className="font-serif font-bold text-base text-charcoal-900">{previewProduct.title}</h4>
                <p className="font-serif font-bold text-lg text-brand-900">₹{previewProduct.base_price.toLocaleString('en-IN')}</p>
                <p className="text-charcoal-600 leading-relaxed">{previewProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ivory-200">
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">Artisan</span>
                    <span className="font-semibold text-charcoal-800">{previewProduct.seller_name}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">Fabric</span>
                    <span className="font-semibold text-charcoal-800">{previewProduct.fabric}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">Zari</span>
                    <span className="font-semibold text-charcoal-800">{previewProduct.zari_type}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">Stock</span>
                    <span className="font-semibold text-charcoal-800">{previewProduct.stock_quantity} available</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                    GI Certified
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                    Handloom Mark
                  </span>
                </div>
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
