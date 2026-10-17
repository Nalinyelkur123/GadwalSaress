import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Edit2, 
  Search, 
  Eye, 
  Building, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Percent,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { SellerProfile } from '../../types';

export const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState('all');

  // Modal
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [customCommission, setCustomCommission] = useState('10.0');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleUpdateKyc = async (
    id: string,
    kyc_status: 'approved' | 'rejected' | 'additional_info_required',
    status?: 'active' | 'suspended' | 'pending',
    commission_rate?: number
  ) => {
    try {
      await api.put(`/admin/sellers/${id}/kyc`, {
        kyc_status,
        status: status || (kyc_status === 'approved' ? 'active' : 'pending'),
        is_verified: kyc_status === 'approved',
        commission_rate: commission_rate !== undefined ? commission_rate : undefined,
      });
      showFeedback('success', `Seller KYC status updated to ${kyc_status.toUpperCase()}!`);
      setSelectedSeller(null);
      fetchSellers();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.error || 'Failed to update seller.');
    }
  };

  const handleToggleSuspend = async (seller: SellerProfile) => {
    const newStatus = seller.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'reactivate'} ${seller.business_name}?`)) return;

    try {
      await api.put(`/admin/sellers/${seller.id}/kyc`, {
        status: newStatus,
        kyc_status: seller.kyc_status,
      });
      showFeedback('success', `Seller marked as ${newStatus}.`);
      fetchSellers();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.error || 'Failed to update status.');
    }
  };

  const filteredSellers = sellers.filter((s) => {
    const matchesSearch =
      s.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.gstin && s.gstin.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesKyc = kycFilter === 'all' || s.kyc_status === kycFilter;
    return matchesSearch && matchesKyc;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Seller & Artisan Weavers CRM</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Verify pit-loom weaver credentials, enforce KYC validation, and configure marketplace commissions.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Total Sellers</span>
          <p className="font-serif text-2xl font-bold text-charcoal-900 mt-1">{sellers.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Verified & Active</span>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">
            {sellers.filter(s => s.status === 'active' && s.is_verified).length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-amber-700">KYC Pending Review</span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">
            {sellers.filter(s => s.kyc_status === 'pending').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Avg Commission</span>
          <p className="font-serif text-2xl font-bold text-brand-900 mt-1">10.0%</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search business name, location, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-ivory-400 rounded text-xs focus:border-brand-700 outline-none"
          />
        </div>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-ivory-400 rounded text-xs text-charcoal-700 focus:border-brand-700 outline-none"
        >
          <option value="all">All KYC Statuses ({sellers.length})</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved & Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Artisan Weaver & Store</th>
              <th className="p-4">Origin / Location</th>
              <th className="p-4">Weaving Experience</th>
              <th className="p-4">Commission</th>
              <th className="p-4">KYC Status</th>
              <th className="p-4">Store Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-500">Loading sellers...</td>
              </tr>
            ) : filteredSellers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-500">No sellers found.</td>
              </tr>
            ) : (
              filteredSellers.map((s) => (
                <tr key={s.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={s.logo_url || s.cover_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                        alt={s.business_name}
                        className="w-10 h-10 object-cover rounded-full border border-ivory-300 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-charcoal-900">{s.business_name}</h4>
                        <span className="text-[10px] text-charcoal-500 block">GSTIN: {s.gstin || 'Handloom Exemption'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-charcoal-700 font-medium">{s.location}</td>
                  <td className="p-4 text-charcoal-600">{s.experience_years} years heritage</td>
                  <td className="p-4 font-bold text-brand-900">{s.commission_rate}%</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      s.kyc_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {s.kyc_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSeller(s);
                        setCustomCommission(s.commission_rate.toString());
                      }}
                      className="px-2.5 py-1 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded font-semibold text-[11px] transition-colors"
                    >
                      Audit KYC
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(s)}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
                        s.status === 'active'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {s.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SELLER AUDIT & KYC MODAL */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900">{selectedSeller.business_name}</h3>
                <p className="text-xs text-charcoal-500">Artisan KYC Audit & Commission Structure</p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-charcoal-400 hover:text-charcoal-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* STORY & HERITAGE */}
              <div className="p-3 bg-ivory-100 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold-700">Artisan Background</span>
                <p className="text-charcoal-700 leading-relaxed">{selectedSeller.story || selectedSeller.description}</p>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-ivory-300 rounded space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-500">Legal Identifiers</span>
                  <p className="text-charcoal-800"><b>GSTIN:</b> {selectedSeller.gstin || 'Exempt Handloom Artisan'}</p>
                  <p className="text-charcoal-800"><b>PAN:</b> {selectedSeller.pan || 'Provided in KYC'}</p>
                  <p className="text-charcoal-800"><b>Experience:</b> {selectedSeller.experience_years} years</p>
                </div>

                <div className="p-3 bg-white border border-ivory-300 rounded space-y-1">
                  <span className="text-[10px] uppercase font-bold text-charcoal-500">Bank Settlement Info</span>
                  <p className="text-charcoal-800"><b>Account:</b> •••••••• 8901</p>
                  <p className="text-charcoal-800"><b>IFSC:</b> SBIN0001234</p>
                  <p className="text-charcoal-800"><b>Beneficiary:</b> {selectedSeller.business_name}</p>
                </div>
              </div>

              {/* PICKUP ADDRESS */}
              <div className="p-3 bg-white border border-ivory-300 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-500">Shiprocket Pickup Hub</span>
                <p className="text-charcoal-800 font-medium">{selectedSeller.pickup_address?.street_address}, {selectedSeller.pickup_address?.city}, {selectedSeller.pickup_address?.state} - {selectedSeller.pickup_address?.postal_code}</p>
                <p className="text-charcoal-500">Contact: {selectedSeller.pickup_address?.phone}</p>
              </div>

              {/* COMMISSION RATE ADJUSTER */}
              <div className="p-3 bg-ivory-50 border border-ivory-300 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-charcoal-900 block">Marketplace Commission Rate (%)</span>
                  <span className="text-[11px] text-charcoal-500">Platform percentage deducted upon sale completion.</span>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={customCommission}
                    onChange={(e) => setCustomCommission(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-ivory-400 rounded text-xs font-bold text-brand-900 text-center"
                  />
                  <span className="font-bold text-charcoal-700">%</span>
                </div>
              </div>

              {/* MODERATION BUTTONS */}
              <div className="flex justify-between items-center pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => handleUpdateKyc(selectedSeller.id, 'rejected')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs transition-colors"
                >
                  Reject Application
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSeller(null)}
                    className="px-4 py-2 border border-ivory-400 text-charcoal-700 rounded font-semibold text-xs hover:bg-ivory-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateKyc(selectedSeller.id, 'approved', 'active', parseFloat(customCommission))}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs transition-colors"
                  >
                    Approve KYC & Activate Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
