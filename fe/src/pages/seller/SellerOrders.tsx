import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, ExternalLink, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { SellerFulfillmentGroup } from '../../types';

export const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<SellerFulfillmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [packingModalGroup, setPackingModalGroup] = useState<SellerFulfillmentGroup | null>(null);
  
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Fulfillment Orders</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Pack sarees, print shipping labels, and track Shiprocket courier dispatches.
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-ivory-300 text-xs text-charcoal-500">
            No orders assigned to your loom yet.
          </div>
        ) : (
          orders.map((fg) => (
            <div key={fg.id} className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
              <div className="p-4 bg-ivory-100 border-b border-ivory-300 flex flex-wrap justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal-900">Fulfillment Group #{fg.id}</span>
                  <span className="text-charcoal-500">• Order #{fg.order_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    fg.fulfillment_status === 'shipped' || fg.fulfillment_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fg.fulfillment_status}
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
                <div className="text-right space-y-2 border-t md:border-t-0 md:border-l border-ivory-200 pt-3 md:pt-0 md:pl-6">
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Net Payout After Commission</span>
                    <span className="font-serif font-bold text-base text-brand-900">
                      ₹{fg.net_seller_amount.toLocaleString('en-IN')}
                    </span>
                  </div>

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
                  ) : (
                    <button
                      onClick={() => setPackingModalGroup(fg)}
                      className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <Package size={14} />
                      <span>Pack & Ship with Shiprocket</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PACKING MODAL */}
      {packingModalGroup && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-md w-full p-6 border border-ivory-300 space-y-4">
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
                  className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
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

    </div>
  );
};
