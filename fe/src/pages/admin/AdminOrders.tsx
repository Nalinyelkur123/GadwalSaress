import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  CreditCard,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, SellerFulfillmentGroup } from '../../types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Customer cancellation request');
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Status Updating State
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
        amount: refundAmount ? parseFloat(refundAmount) : refundModalOrder.final_amount,
      });
      alert(res.data.message || 'Refund processed successfully!');
      setRefundModalOrder(null);
      if (selectedOrder?.id === refundModalOrder.id) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process refund.');
    } finally {
      setRefunding(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, payment_status?: string, fulfillment_status?: string) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/admin/orders/${orderId}/status`, {
        payment_status,
        fulfillment_status,
      });
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = orders.find(o => o.id === orderId);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Search filter
    const matchesSearch = 
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.fulfillment_groups.some(fg => fg.shipping_awb?.toLowerCase().includes(searchQuery.toLowerCase()) || fg.seller_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return o.payment_status === 'captured';
    if (statusFilter === 'refunded') return o.payment_status === 'refunded';
    if (statusFilter === 'cancelled') return o.payment_status === 'cancelled' || o.fulfillment_groups.some(fg => fg.fulfillment_status === 'cancelled');
    if (statusFilter === 'return_requested') return o.fulfillment_groups.some(fg => fg.fulfillment_status === 'return_requested');
    
    // Fulfillment status checks
    return o.fulfillment_groups.some(fg => fg.fulfillment_status === statusFilter);
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Order & Fulfillment CRM</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real-time multi-vendor orders, logistics tracking, payments, and Razorpay refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-ivory-200 text-charcoal-700 px-3 py-1.5 rounded-full font-medium">
            Total Orders: <b>{orders.length}</b>
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl border border-ivory-300 p-4 shadow-warm-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, email, weaver, or AWB tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-ivory-300 rounded-lg bg-ivory-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'paid', label: 'Paid / Confirmed' },
              { id: 'processing', label: 'Processing' },
              { id: 'packed', label: 'Packed' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'return_requested', label: 'Return Requests' },
              { id: 'refunded', label: 'Refunded' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-brand-900 text-white'
                    : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-ivory-300 p-12 text-center text-charcoal-500">
            <div className="animate-spin w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs">Loading marketplace orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-ivory-300 p-12 text-center text-charcoal-500">
            <Package size={36} className="mx-auto text-charcoal-400 mb-2 opacity-60" />
            <p className="font-serif font-bold text-charcoal-800">No orders found</p>
            <p className="text-xs text-charcoal-500 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredOrders.map((o) => {
            const hasReturnRequest = o.fulfillment_groups.some(fg => fg.fulfillment_status === 'return_requested');
            const isCancelled = o.payment_status === 'cancelled' || o.fulfillment_groups.every(fg => fg.fulfillment_status === 'cancelled');

            return (
              <div 
                key={o.id} 
                className={`bg-white rounded-xl border shadow-warm-sm overflow-hidden transition-all ${
                  hasReturnRequest ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-ivory-300'
                }`}
              >
                {/* ORDER HEADER */}
                <div className="bg-ivory-100 p-4 border-b border-ivory-300 flex flex-wrap justify-between items-center text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-900 text-sm">{o.order_number}</span>
                    <span className="text-charcoal-500 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {hasReturnRequest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        Return Requested
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-serif font-bold text-base text-charcoal-900">
                      ₹{o.final_amount.toLocaleString('en-IN')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      o.payment_status === 'captured' ? 'bg-emerald-100 text-emerald-800' :
                      o.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      o.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {o.payment_status}
                    </span>

                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-2.5 py-1 bg-white hover:bg-ivory-100 border border-ivory-300 rounded text-[11px] font-semibold text-charcoal-700 flex items-center gap-1 shadow-sm"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>

                    {o.payment_status === 'captured' && (
                      <button
                        onClick={() => {
                          setRefundModalOrder(o);
                          setRefundAmount(o.final_amount.toString());
                        }}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RotateCcw size={12} />
                        <span>Refund</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ORDER BODY */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                  {/* CUSTOMER & SHIPPING */}
                  <div className="md:col-span-4 space-y-1.5 text-charcoal-600 border-r border-ivory-200 pr-4">
                    <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <User size={12} className="text-brand-700" />
                      <span>Customer & Destination</span>
                    </h4>
                    <p className="font-semibold text-charcoal-900 text-sm">{o.customer_name}</p>
                    <p className="text-charcoal-600">{o.customer_email}</p>
                    <p className="text-charcoal-600">{o.customer_phone}</p>
                    <p className="text-charcoal-500 pt-1 text-[11px] leading-relaxed">
                      {o.shipping_address?.street_address}, {o.shipping_address?.city}, {o.shipping_address?.state} - {o.shipping_address?.postal_code}
                    </p>
                    {o.notes && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase text-charcoal-500">Order Notes:</span>
                        <p className="text-[11px] text-charcoal-700 italic bg-ivory-100 p-2 rounded border border-ivory-200 mt-0.5">
                          {o.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ITEMS & WEAVER FULFILLMENT GROUPS */}
                  <div className="md:col-span-8 space-y-3">
                    <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck size={12} className="text-brand-700" />
                        <span>Artisan Consignments ({o.fulfillment_groups?.length || 1})</span>
                      </span>
                      <span className="text-charcoal-500 font-normal">
                        {o.items.reduce((acc, i) => acc + i.quantity, 0)} Total Sarees
                      </span>
                    </h4>

                    {o.fulfillment_groups?.map((fg) => (
                      <div key={fg.id} className="p-3.5 bg-ivory-50 rounded-lg border border-ivory-200 space-y-2.5">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <p className="font-bold text-charcoal-900 text-xs">{fg.seller_name}</p>
                            <p className="text-[11px] text-charcoal-500">
                              Subtotal: ₹{fg.subtotal.toLocaleString('en-IN')} • 
                              Weaver Payout: <b className="text-brand-900 font-serif">₹{fg.net_seller_amount.toLocaleString('en-IN')}</b>
                              <span className="text-charcoal-400"> (Comm: ₹{fg.commission_amount.toLocaleString('en-IN')})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* STATUS SELECTOR */}
                            <select
                              value={fg.fulfillment_status}
                              disabled={updatingOrderId === o.id || isCancelled}
                              onChange={(e) => handleUpdateOrderStatus(o.id, undefined, e.target.value)}
                              className="px-2.5 py-1 rounded text-[11px] font-bold border border-ivory-300 bg-white cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="return_requested">Return Requested</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {fg.shipping_awb && (
                              <span className="px-2 py-0.5 bg-brand-50 border border-brand-200 rounded text-[10px] font-mono font-bold text-brand-900">
                                AWB: {fg.shipping_awb}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* LINE ITEMS PREVIEW */}
                        <div className="space-y-1.5 pt-1 border-t border-ivory-200">
                          {fg.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.product_image}
                                  alt={item.product_title}
                                  className="w-7 h-9 object-cover rounded border border-ivory-300"
                                />
                                <div>
                                  <p className="font-medium text-charcoal-900">{item.product_title}</p>
                                  <p className="text-[10px] text-charcoal-500 font-mono">SKU: {item.sku} • {item.fabric}</p>
                                </div>
                              </div>
                              <span className="font-medium text-charcoal-800">
                                {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')} = ₹{item.subtotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* RETURN OR CANCELLATION REASON */}
                        {fg.return_reason && (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                            <b>Return Reason:</b> {fg.return_reason}
                          </div>
                        )}
                        {fg.cancellation_reason && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-900">
                            <b>Cancellation Reason:</b> {fg.cancellation_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-2xl w-full p-6 border border-ivory-300 space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-ivory-300 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500">Order Dossier</span>
                <h3 className="font-serif font-bold text-xl text-charcoal-900">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-charcoal-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-ivory-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* CUSTOMER & PAYMENT OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-ivory-50 p-4 rounded-lg border border-ivory-200">
              <div>
                <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px] mb-1">Customer</h4>
                <p className="font-semibold">{selectedOrder.customer_name}</p>
                <p>{selectedOrder.customer_email}</p>
                <p>{selectedOrder.customer_phone}</p>
                <p className="text-charcoal-600 mt-1">
                  {selectedOrder.shipping_address?.street_address}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.postal_code}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-[10px] mb-1">Payment Reference</h4>
                <p><span className="text-charcoal-500">Status:</span> <b className="capitalize">{selectedOrder.payment_status}</b></p>
                {selectedOrder.razorpay_order_id && (
                  <p><span className="text-charcoal-500">Razorpay Order:</span> <code className="font-mono text-[11px]">{selectedOrder.razorpay_order_id}</code></p>
                )}
                {selectedOrder.razorpay_payment_id && (
                  <p><span className="text-charcoal-500">Razorpay Payment:</span> <code className="font-mono text-[11px]">{selectedOrder.razorpay_payment_id}</code></p>
                )}
              </div>
            </div>

            {/* ORDER LINE ITEMS */}
            <div className="space-y-3">
              <h4 className="font-bold text-charcoal-900 uppercase tracking-wider text-xs">Purchased Saree Articles</h4>
              <div className="divide-y divide-ivory-200 border border-ivory-200 rounded-lg overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product_image}
                        alt={item.product_title}
                        className="w-12 h-16 object-cover rounded border border-ivory-300 shadow-warm-xs"
                      />
                      <div>
                        <h5 className="font-serif font-bold text-charcoal-900">{item.product_title}</h5>
                        <p className="text-[11px] text-charcoal-500">SKU: <span className="font-mono">{item.sku}</span> • Fabric: {item.fabric}</p>
                        <p className="text-[11px] text-charcoal-600">Qty: {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-sm text-charcoal-900">₹{item.subtotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="p-4 bg-ivory-100 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Items Subtotal:</span>
                <span>₹{selectedOrder.total_items_price.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({selectedOrder.coupon_code || 'APPLIED'}):</span>
                  <span>-₹{selectedOrder.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Shipping & Insurance (Shiprocket):</span>
                <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>GST (5% Handloom):</span>
                <span>₹{selectedOrder.tax_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-charcoal-900 font-serif font-bold text-sm pt-2 border-t border-ivory-300">
                <span>Final Order Amount:</span>
                <span className="text-brand-900">₹{selectedOrder.final_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ivory-300">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-ivory-400 rounded-lg text-xs font-semibold text-charcoal-700 hover:bg-ivory-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-warm-lg max-w-sm w-full p-6 border border-ivory-300 space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Confirm Razorpay Refund
            </h3>
            <p className="text-xs text-charcoal-600">
              Order: <b>{refundModalOrder.order_number}</b> <br />
              Total paid: <b>₹{refundModalOrder.final_amount.toLocaleString('en-IN')}</b>
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                />
              </div>

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
