import React, { useState, useEffect } from 'react';
import { Truck, Search, ExternalLink, Package, CheckCircle2, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { SellerFulfillmentGroup } from '../../types';

export const AdminShipments: React.FC = () => {
  const [shipments, setShipments] = useState<SellerFulfillmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTracking, setSelectedTracking] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/shipments');
      setShipments(res.data || []);
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleTrackAwb = async (awb: string) => {
    try {
      setTrackingLoading(true);
      const res = await api.get(`/shipping/track/${awb}`);
      setSelectedTracking(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesSearch =
      (s.shipping_awb && s.shipping_awb.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.fulfillment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Shiprocket Logistics & Tracking</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Monitor handloom consignments, AWBs, pickup schedules, and delivery milestones across India.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Total Consignments</span>
          <p className="font-serif text-2xl font-bold text-charcoal-900 mt-1">{shipments.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-amber-700">In Transit</span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">
            {shipments.filter(s => s.fulfillment_status === 'shipped').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Delivered</span>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">
            {shipments.filter(s => s.fulfillment_status === 'delivered').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Pending Packing</span>
          <p className="font-serif text-2xl font-bold text-charcoal-700 mt-1">
            {shipments.filter(s => s.fulfillment_status === 'processing' || s.fulfillment_status === 'pending').length}
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search AWB, seller, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-ivory-400 rounded text-xs focus:border-brand-700 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-ivory-400 rounded text-xs text-charcoal-700 focus:border-brand-700 outline-none"
        >
          <option value="all">All Shipping Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped (In Transit)</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* SHIPMENTS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Consignment & Order</th>
              <th className="p-4">Artisan / Weaver</th>
              <th className="p-4">Courier & AWB</th>
              <th className="p-4">Parcel Specs</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500">Loading shipments...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500">No shipments found.</td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-charcoal-900 block">{s.id}</span>
                    <span className="text-[10px] text-charcoal-500">Order: {s.order_id}</span>
                    <span className="text-[10px] text-charcoal-400 block">{s.items.length} item(s)</span>
                  </td>
                  <td className="p-4">
                    <span className="font-serif font-bold text-charcoal-900 block">{s.seller_name}</span>
                    <span className="text-[10px] text-gold-600 font-semibold">Net: ₹{s.net_seller_amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-4">
                    {s.shipping_awb ? (
                      <div>
                        <span className="font-mono font-bold text-brand-900 block">{s.shipping_awb}</span>
                        <span className="text-[10px] text-charcoal-500">{s.courier_name || 'BlueDart Express'}</span>
                      </div>
                    ) : (
                      <span className="text-charcoal-400 italic">Not generated yet</span>
                    )}
                  </td>
                  <td className="p-4 text-charcoal-600">
                    <span>{s.package_weight_kg ? `${s.package_weight_kg} kg` : '0.95 kg'}</span>
                    <span className="text-[10px] text-charcoal-400 block">Insured Box Packing</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.fulfillment_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      s.fulfillment_status === 'shipped' ? 'bg-amber-100 text-amber-800' :
                      s.fulfillment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-ivory-200 text-charcoal-700'
                    }`}>
                      {s.fulfillment_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {s.shipping_awb ? (
                      <button
                        onClick={() => handleTrackAwb(s.shipping_awb!)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded font-semibold text-[11px] transition-colors"
                      >
                        <Truck size={12} /> Live Track
                      </button>
                    ) : (
                      <span className="text-charcoal-400 text-[10px] italic">Awaiting packing</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TRACKING MODAL */}
      {selectedTracking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal-900">Consignment Tracking</h3>
                <p className="font-mono text-xs text-brand-900 font-bold">{selectedTracking.awb}</p>
              </div>
              <button
                onClick={() => setSelectedTracking(null)}
                className="text-charcoal-400 hover:text-charcoal-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-ivory-100 rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase">Carrier</span>
                <p className="font-bold text-charcoal-900">{selectedTracking.courier}</p>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase text-[10px]">
                {selectedTracking.status}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">Milestones</span>
              {selectedTracking.events?.map((ev: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-700 mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-bold text-charcoal-900">{ev.status}</p>
                    <p className="text-[11px] text-charcoal-500">{ev.location} • {new Date(ev.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-ivory-200 flex justify-end">
              <button
                onClick={() => setSelectedTracking(null)}
                className="px-4 py-2 bg-brand-700 text-white rounded text-xs font-semibold"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
