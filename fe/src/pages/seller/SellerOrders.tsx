import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, ExternalLink, Printer, Search, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { SellerFulfillmentGroup } from '../../types';

export const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<SellerFulfillmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [packingModalGroup, setPackingModalGroup] = useState<SellerFulfillmentGroup | null>(null);
  const [packingSlipGroup, setPackingSlipGroup] = useState<SellerFulfillmentGroup | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Package dimensions & weight form
  const [weightKg, setWeightKg] = useState('0.95');
  const [lengthCm, setLengthCm] = useState('30');
  const [breadthCm, setBreadthCm] = useState('25');
  const [heightCm, setHeightCm] = useState('5');
  const [shippingLoading, setShippingLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seller/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePackAndShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packingModalGroup) return;
    setShippingLoading(true);
    try {
      const res = await api.post(`/seller/orders/${packingModalGroup.id}/pack-and-ship`, {
        weight_kg: parseFloat(weightKg),
        length_cm: parseFloat(lengthCm),
        breadth_cm: parseFloat(breadthCm),
        height_cm: parseFloat(heightCm),
      });

      alert(`Shipment booked via ${res.data.shipment.courier_name}! AWB: ${res.data.shipment.awb_code}`);
      setPackingModalGroup(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate shipment.');
    } finally {
      setShippingLoading(false);
    }
  };

  const filteredOrders = orders.filter((fg) => {
    if (statusFilter === 'all') return true;
    return fg.fulfillment_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Fulfillment Orders</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Pack sarees, generate Shiprocket AWB labels, print packing slips, and dispatch parcels.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-ivory-300 gap-1 overflow-x-auto text-xs font-bold">
        {[
          { key: 'all', label: `All Orders (${orders.length})` },
          { key: 'processing', label: `Pending Packing (${orders.filter(o => o.fulfillment_status === 'processing' || o.fulfillment_status === 'pending').length})` },
          { key: 'shipped', label: `In Transit (${orders.filter(o => o.fulfillment_status === 'shipped').length})` },
          { key: 'delivered', label: `Delivered (${orders.filter(o => o.fulfillment_status === 'delivered').length})` },
          { key: 'cancelled', label: `Cancelled (${orders.filter(o => o.fulfillment_status === 'cancelled').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? 'border-brand-700 text-brand-900 font-bold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-ivory-300 text-xs text-charcoal-500">
            Loading fulfillment orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-ivory-300 text-xs text-charcoal-500">
            No orders found matching status filter.
          </div>
        ) : (
          filteredOrders.map((fg) => (
            <div key={fg.id} className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
              <div className="p-4 bg-ivory-100 border-b border-ivory-300 flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal-900">Parcel #{fg.id}</span>
                  <span className="text-charcoal-500">• Order #{fg.order_id}</span>
                  {fg.created_at && (
                    <span className="text-charcoal-400">• {new Date(fg.created_at).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    fg.fulfillment_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    fg.fulfillment_status === 'shipped' ? 'bg-amber-100 text-amber-800' :
                    fg.fulfillment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-ivory-200 text-charcoal-700'
                  }`}>
                    {fg.fulfillment_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* ITEMS */}
                <div className="space-y-3 flex-1">
                  {fg.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img src={item.product_image} alt={item.product_title} className="w-12 h-14 object-cover object-top rounded border border-ivory-300" />
                      <div>
                        <h4 className="font-serif font-bold text-xs text-charcoal-900">{item.product_title}</h4>
                        <p className="text-[11px] text-charcoal-500">
                          SKU: {item.sku} • Qty: {item.quantity} • Subtotal: ₹{item.subtotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FINANCIALS & COURIER ACTIONS */}
                <div className="text-right space-y-2 border-t md:border-t-0 md:border-l border-ivory-200 pt-3 md:pt-0 md:pl-6 min-w-[200px]">
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Net Payout After Commission</span>
                    <span className="font-serif font-bold text-base text-brand-900">
                      ₹{fg.net_seller_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-charcoal-400 block">Fee: ₹{fg.commission_amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setPackingSlipGroup(fg)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded font-semibold text-[11px] transition-colors"
                    >
                      <Printer size={12} /> Packing Slip
                    </button>

                    {fg.shipping_awb ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-1 font-mono text-xs text-charcoal-700">
                          <Truck size={14} className="text-gold-600" />
                          <span>AWB: {fg.shipping_awb}</span>
                        </div>
                        <a
                          href={fg.tracking_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-700 font-semibold hover:underline flex items-center justify-end gap-1"
                        >
                          <span>Live Courier Status</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ) : fg.fulfillment_status !== 'cancelled' ? (
                      <button
                        onClick={() => setPackingModalGroup(fg)}
                        className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        <Package size={14} />
                        <span>Pack & Ship with Shiprocket</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PACKING MODAL */}
      {packingModalGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-xl max-w-md w-full p-6 border border-ivory-300 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Prepare Parcel & Generate Shiprocket AWB
            </h3>
            <p className="text-xs text-charcoal-500">
              Enter packed parcel dimensions and weight for pickup from your Gadwal loom address.
            </p>

            <form onSubmit={handlePackAndShip} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    required
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Breadth (cm)</label>
                  <input
                    type="number"
                    required
                    value={breadthCm}
                    onChange={(e) => setBreadthCm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPackingModalGroup(null)}
                  className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shippingLoading}
                  className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
                >
                  {shippingLoading ? 'Generating AWB...' : 'Confirm & Generate AWB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKING SLIP MODAL */}
      {packingSlipGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-xl max-w-lg w-full p-6 border border-ivory-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-ivory-300 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal-900">Official Packing Slip</h3>
                <span className="text-[10px] text-charcoal-500 font-mono">Consignment #{packingSlipGroup.id}</span>
              </div>
              <button onClick={() => setPackingSlipGroup(null)} className="font-bold text-charcoal-400">✕</button>
            </div>

            <div className="p-4 bg-ivory-100 rounded-lg space-y-2 text-xs border border-ivory-300">
              <div className="flex justify-between">
                <span className="font-bold text-charcoal-900">Shipped By (Artisan Origin):</span>
                <span className="text-charcoal-700 font-serif font-bold">{packingSlipGroup.seller_name}</span>
              </div>
              <p className="text-charcoal-600 text-[11px]">Weavers Colony, Gadwal, Telangana 509125, India (GI Tagged)</p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-charcoal-700 uppercase text-[10px] tracking-wider">Parcel Enclosed Handlooms:</span>
              <table className="w-full text-left text-xs border border-ivory-300">
                <thead className="bg-ivory-100 border-b border-ivory-300 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {packingSlipGroup.items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2 font-serif font-bold">{it.product_title}</td>
                      <td className="p-2 font-mono text-[10px]">{it.sku}</td>
                      <td className="p-2 text-center font-bold">{it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-ivory-200">
              <span className="text-[10px] text-charcoal-500">Includes Silk Mark & GI Authenticity Inspection Seal</span>
              <div className="space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Slip
                </button>
                <button
                  onClick={() => setPackingSlipGroup(null)}
                  className="px-4 py-2 bg-brand-700 text-white rounded text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
