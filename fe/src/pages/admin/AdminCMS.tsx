import React, { useState, useEffect } from 'react';
import { Plus, Tag, Image, Check } from 'lucide-react';
import { api } from '../../services/api';
import { CMSBanner, Coupon } from '../../types';

export const AdminCMS: React.FC = () => {
  const [banners, setBanners] = useState<CMSBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState('10');
  const [minOrder, setMinOrder] = useState('10000');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        api.get('/admin/cms/banners'),
        api.get('/admin/cms/coupons')
      ]);
      setBanners(bRes.data || []);
      setCoupons(cRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCreatingCoupon(true);
    try {
      await api.post('/admin/cms/coupons', {
        code: couponCode,
        description: couponDesc,
        discount_type: couponType,
        discount_value: couponValue,
        min_order_value: minOrder,
      });
      alert(`Coupon ${couponCode.toUpperCase()} created and active!`);
      setCouponCode('');
      setCouponDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setCreatingCoupon(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">CMS & Promotions Engine</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Manage promotional discount coupons, hero banners, and dynamic announcements.
        </p>
      </div>

      {/* ACTIVE COUPONS SECTION */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
          <h2 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
            <Tag size={18} className="text-brand-700" />
            <span>Marketplace Discount Coupons ({coupons.length})</span>
          </h2>
        </div>

        {/* CREATE COUPON FORM */}
        <form onSubmit={handleCreateCoupon} className="p-4 bg-ivory-100 rounded-lg space-y-3">
          <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider">Create New Coupon</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="WEAVE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 font-mono uppercase bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Discount Type</label>
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={couponValue}
                onChange={(e) => setCouponValue(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-ivory-400 bg-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingCoupon}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm"
              >
                {creatingCoupon ? 'Adding...' : 'Add Coupon'}
              </button>
            </div>
          </div>
        </form>

        {/* COUPONS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-50 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Min Order</th>
                <th className="p-3">Usage Count</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-3 font-mono font-bold text-brand-900">{c.code}</td>
                  <td className="p-3 font-semibold">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td className="p-3">₹{c.min_order_value.toLocaleString('en-IN')}</td>
                  <td className="p-3">{c.used_count || 0} times</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
