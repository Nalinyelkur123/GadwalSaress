import React, { useState, useEffect } from 'react';
import { RotateCcw, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Customer cancellation request');
  const [refunding, setRefunding] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
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

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;
    setRefunding(true);
    try {
      const res = await api.post(`/admin/orders/${refundModalOrder.id}/refund`, {
        reason: refundReason,
      });
      alert(res.data.message || 'Refund processed successfully!');
      setRefundModalOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process refund.');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Order & Fulfillment CRM</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Multi-vendor orders, fulfillment status, and Razorpay integrated refunds.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
            <div className="bg-ivory-100 p-4 border-b border-ivory-300 flex flex-wrap justify-between items-center text-xs gap-3">
              <div>
                <span className="font-mono font-bold text-brand-900">{o.order_number}</span>
                <span className="text-charcoal-500 ml-2">({new Date(o.created_at).toLocaleDateString()})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-serif font-bold text-sm text-charcoal-900">
                  Total: ₹{o.final_amount.toLocaleString('en-IN')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  o.payment_status === 'captured' ? 'bg-emerald-100 text-emerald-800' :
                  o.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {o.payment_status}
                </span>
                {o.payment_status === 'captured' && (
                  <button
                    onClick={() => setRefundModalOrder(o)}
                    className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-[10px] font-semibold flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Issue Refund</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
              {/* CUSTOMER & SHIPPING */}
              <div className="md:col-span-4 space-y-1 text-charcoal-600">
                <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px]">Customer & Destination</h4>
                <p className="font-semibold text-charcoal-900">{o.customer_name}</p>
                <p>{o.customer_email}</p>
                <p>{o.customer_phone}</p>
                <p className="text-charcoal-500 pt-1">
                  {o.shipping_address?.street_address}, {o.shipping_address?.city}, {o.shipping_address?.state} - {o.shipping_address?.postal_code}
                </p>
              </div>

              {/* ITEMS & WEAVER GROUPS */}
              <div className="md:col-span-8 space-y-3">
                <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px]">Fulfillment Groups ({o.fulfillment_groups?.length || 1})</h4>
                {o.fulfillment_groups?.map((fg) => (
                  <div key={fg.id} className="p-3 bg-ivory-50 rounded border border-ivory-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-charcoal-900">{fg.seller_name}</p>
                      <p className="text-[11px] text-charcoal-500">{fg.items.length} items • Status: <b className="capitalize">{fg.fulfillment_status}</b></p>
                    </div>
                    {fg.shipping_awb && (
                      <span className="font-mono text-charcoal-600 font-semibold">AWB: {fg.shipping_awb}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-sm w-full p-6 border border-ivory-300 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Confirm Razorpay Refund
            </h3>
            <p className="text-xs text-charcoal-600">
              Order: <b>{refundModalOrder.order_number}</b> <br />
              Amount to refund: <b>₹{refundModalOrder.final_amount.toLocaleString('en-IN')}</b>
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Reason for Refund</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="flex-1 py-2 border border-ivory-400 rounded text-xs font-semibold text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold"
                >
                  {refunding ? 'Reversing Payment...' : 'Authorize Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
