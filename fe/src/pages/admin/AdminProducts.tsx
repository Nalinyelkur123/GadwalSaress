import React, { useState, useEffect } from 'react';
import { Check, X, Star, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
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

  const handleModerate = async (id: string, status: 'approved' | 'rejected', is_featured?: boolean) => {
    try {
      await api.put(`/admin/products/${id}/moderation`, {
        status,
        is_featured,
      });
      alert(`Product marked as ${status}!`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to moderate product.');
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}/moderation`, {
        status: product.status,
        is_featured: !product.is_featured,
      });
      fetchProducts();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Catalog Moderation CRM</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Approve or reject handloom listings, verify weave details, and feature sarees on homepage.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Saree & Weaver</th>
              <th className="p-4">Fabric</th>
              <th className="p-4">Price</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-ivory-50">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img src={p.images[0]} alt={p.title} className="w-12 h-14 object-cover object-top rounded border border-ivory-300" />
                    <div>
                      <h4 className="font-serif font-bold text-charcoal-900">{p.title}</h4>
                      <p className="text-[10px] text-gold-600 font-semibold">{p.seller_name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-charcoal-600">{p.fabric}</td>
                <td className="p-4 font-serif font-bold text-brand-900">₹{p.base_price.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      p.is_featured ? 'bg-amber-100 text-amber-800' : 'bg-ivory-200 text-charcoal-500'
                    }`}
                  >
                    {p.is_featured ? '★ Featured' : '☆ Not Featured'}
                  </button>
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
                <td className="p-4 text-right space-x-2">
                  {p.status !== 'approved' && (
                    <button
                      onClick={() => handleModerate(p.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold"
                    >
                      Approve
                    </button>
                  )}
                  {p.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerate(p.id, 'rejected')}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-[11px] font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
