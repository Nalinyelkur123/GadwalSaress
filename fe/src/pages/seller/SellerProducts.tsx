import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Eye, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';

export const SellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Product Form State
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formFabric, setFormFabric] = useState('Pure Mulberry Silk (Silk Mark Certified)');
  const [formZari, setFormZari] = useState('Pure Silver Zari Gold Plated');
  const [formBorder, setFormBorder] = useState('Traditional Kuttu Interlocked Temple Border');
  const [formColor, setFormColor] = useState('Maroon');
  const [formStock, setFormStock] = useState('2');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice) return;
    setSubmitting(true);
    try {
      await api.post('/seller/products', {
        title: formTitle,
        base_price: formPrice,
        original_price: Math.round(parseFloat(formPrice) * 1.15),
        fabric: formFabric,
        zari_type: formZari,
        border_style: formBorder,
        color: formColor,
        stock_quantity: formStock,
        description: formDescription,
        images: [formImageUrl],
      });
      setModalOpen(false);
      resetForm();
      fetchProducts();
      alert('Product created and submitted for admin review!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormPrice('');
    setFormDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Manage Saree Listings</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">Create, edit, and track pit loom handloom inventory.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Saree Details</th>
              <th className="p-4">Fabric & Zari</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-ivory-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img src={p.images[0]} alt={p.title} className="w-12 h-14 object-cover object-top rounded border border-ivory-300" />
                    <div>
                      <h4 className="font-serif font-bold text-charcoal-900">{p.title}</h4>
                      <span className="font-mono text-[10px] text-charcoal-500">{p.sku}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-charcoal-600">
                  <p className="font-medium">{p.fabric}</p>
                  <p className="text-[10px] text-charcoal-500">{p.border_style}</p>
                </td>
                <td className="p-4 font-serif font-bold text-brand-900">
                  ₹{p.base_price.toLocaleString('en-IN')}
                </td>
                <td className="p-4 font-semibold text-charcoal-800">
                  {p.stock_quantity} units
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-lg w-full p-6 border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-300 pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">List New Gadwal Saree</h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Saree Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon Gadwal Pure Silk Saree"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="24500"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Primary Color</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400 bg-white"
                  >
                    <option value="Maroon">Maroon</option>
                    <option value="Blue">Blue</option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="White">White / Cream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Zari Type</label>
                  <input
                    type="text"
                    value={formZari}
                    onChange={(e) => setFormZari(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Fabric & Weave</label>
                <input
                  type="text"
                  value={formFabric}
                  onChange={(e) => setFormFabric(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Border Technique</label>
                <input
                  type="text"
                  value={formBorder}
                  onChange={(e) => setFormBorder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the motifs, pallu detailing, and drape..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Image URL (Cloudflare R2)</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>All listings undergo administrative quality check before appearing in public searches.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded shadow-sm"
              >
                {submitting ? 'Submitting to Marketplace...' : 'Submit Saree for Approval'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
