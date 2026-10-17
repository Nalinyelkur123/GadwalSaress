import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import { SellerProfile } from '../../types';

export const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sellers');
      setSellers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateKyc = async (id: string, kyc_status: 'approved' | 'rejected', commission_rate?: number) => {
    try {
      await api.put(`/admin/sellers/${id}/kyc`, {
        kyc_status,
        status: kyc_status === 'approved' ? 'active' : 'pending',
        is_verified: kyc_status === 'approved',
        commission_rate,
      });
      alert(`Seller status updated to: ${kyc_status}`);
      fetchSellers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update seller.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Seller & Weaver CRM</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Verify artisan documents, manage commission structures, and review onboarding.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Business / Artisan</th>
              <th className="p-4">Location</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Commission</th>
              <th className="p-4">KYC Status</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {sellers.map((s) => (
              <tr key={s.id} className="hover:bg-ivory-50">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img src={s.logo_url || s.cover_url} alt={s.business_name} className="w-10 h-10 object-cover rounded-full border border-ivory-300" />
                    <div>
                      <h4 className="font-serif font-bold text-charcoal-900">{s.business_name}</h4>
                      <p className="text-[10px] text-charcoal-500">GSTIN: {s.gstin || 'Handloom Exempt'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-charcoal-600">{s.location}</td>
                <td className="p-4 text-charcoal-600">{s.experience_years} years</td>
                <td className="p-4 font-bold text-brand-900">{s.commission_rate}%</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    s.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    s.kyc_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {s.kyc_status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {s.kyc_status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateKyc(s.id, 'approved', 10.0)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold"
                    >
                      Approve KYC
                    </button>
                  )}
                  {s.kyc_status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateKyc(s.id, 'rejected')}
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
