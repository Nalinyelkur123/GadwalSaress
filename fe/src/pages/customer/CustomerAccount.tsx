import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  LifeBuoy, 
  Heart, 
  User, 
  Truck, 
  ChevronRight, 
  Plus, 
  Trash2,
  ExternalLink,
  MessageSquare,
  ShoppingBag,
  RotateCcw,
  XCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Order, Address } from '../../types';

export const CustomerAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'tickets' | 'wishlist'>(
    location.pathname.includes('wishlist') ? 'wishlist' : 'orders'
  );
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation & Return Modal State
  const [actionOrder, setActionOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'return' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'order' | 'delivery' | 'return' | 'product'>('order');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [ordersRes, addrRes, ticketsRes] = await Promise.all([
        api.get('/customer/orders'),
        api.get('/customer/addresses'),
        api.get('/customer/tickets')
      ]);
      setOrders(ordersRes.data || []);
      setAddresses(addrRes.data || []);
      setTickets(ticketsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('wishlist')) {
      setActiveTab('wishlist');
    }
  }, [location.pathname]);

  const handleOrderAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionOrder || !actionType) return;
    if (!actionReason || actionReason.trim().length < 5) {
      setActionFeedback({ type: 'error', message: 'Please provide a clear reason (minimum 5 characters).' });
      return;
    }

    try {
      setIsSubmittingAction(true);
      setActionFeedback(null);
      if (actionType === 'cancel') {
        const res = await api.post(`/customer/orders/${actionOrder.id}/cancel`, {
          reason: actionReason.trim()
        });
        setActionFeedback({ type: 'success', message: res.data.message || 'Order cancelled successfully.' });
      } else {
        const res = await api.post(`/customer/orders/${actionOrder.id}/return`, {
          reason: actionReason.trim()
        });
        setActionFeedback({ type: 'success', message: res.data.message || 'Return request submitted successfully.' });
      }

      await fetchCustomerData();
      setTimeout(() => {
        setActionOrder(null);
        setActionType(null);
        setActionReason('');
        setActionFeedback(null);
      }, 1800);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.error || `Failed to process ${actionType} request.`
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    try {
      const res = await api.post('/customer/tickets', {
        subject: ticketSubject,
        category: ticketCategory,
        message: ticketMessage,
      });
      setTickets([res.data, ...tickets]);
      setTicketSubject('');
      setTicketMessage('');
      alert('Support ticket created! Our team will respond shortly.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create support ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/customer/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = async (productId: string) => {
    await addToCart(productId, 1);
    await removeFromWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER PROFILE STRIP */}
      <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-800 font-serif font-bold text-xl flex items-center justify-center border border-brand-200">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-charcoal-900">{user?.full_name}</h1>
            <p className="text-xs text-charcoal-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Verified Marketplace Customer
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded font-semibold self-start sm:self-center"
        >
          Sign Out
        </button>
      </div>

      {/* TABS & MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR TABS */}
        <aside className="lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'orders' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-charcoal-700 hover:bg-ivory-200'
            }`}
          >
            <Package size={16} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'wishlist' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-charcoal-700 hover:bg-ivory-200'
            }`}
          >
            <Heart size={16} />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'addresses' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-charcoal-700 hover:bg-ivory-200'
            }`}
          >
            <MapPin size={16} />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tickets' ? 'bg-brand-700 text-white shadow-sm' : 'bg-white text-charcoal-700 hover:bg-ivory-200'
            }`}
          >
            <LifeBuoy size={16} />
            <span>Help & Support ({tickets.length})</span>
          </button>
        </aside>

        {/* TAB CONTENT (9 cols) */}
        <main className="lg:col-span-9">
          
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-lg text-charcoal-900 mb-2">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-ivory-300 text-center text-xs text-charcoal-500 space-y-3">
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="inline-block px-4 py-2 bg-brand-700 text-white font-semibold rounded text-xs hover:bg-brand-800">
                    Explore Gadwal Sarees
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const fg = order.fulfillment_groups?.[0];
                  const isDelivered = fg?.fulfillment_status === 'delivered';
                  const isCancelled = order.payment_status === 'cancelled' || fg?.fulfillment_status === 'cancelled';
                  const canCancel = !isCancelled && !isDelivered && (order.payment_status === 'captured' || fg?.fulfillment_status === 'unfulfilled');
                  const canReturn = isDelivered && fg?.fulfillment_status !== 'return_requested';

                  return (
                    <div key={order.id} className="bg-white rounded-xl border border-ivory-300 overflow-hidden shadow-warm-sm">
                      <div className="bg-ivory-100 p-4 border-b border-ivory-300 flex flex-wrap justify-between items-center text-xs gap-3">
                        <div>
                          <span className="text-charcoal-500 block text-[10px] uppercase tracking-wider font-semibold">Order Placed</span>
                          <span className="font-medium text-charcoal-900">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block text-[10px] uppercase tracking-wider font-semibold">Total</span>
                          <span className="font-serif font-bold text-brand-900">₹{order.final_amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block text-[10px] uppercase tracking-wider font-semibold">Order Reference</span>
                          <span className="font-mono font-semibold text-charcoal-800">{order.order_number}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block text-[10px] uppercase tracking-wider font-semibold">Payment</span>
                          <span className={`capitalize px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.payment_status === 'captured'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.payment_status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : order.payment_status === 'refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 divide-y divide-ivory-200">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img src={item.product_image} alt={item.product_title} className="w-14 h-16 object-cover object-top rounded border border-ivory-300" />
                              <div>
                                <h4 className="font-serif font-semibold text-xs text-charcoal-900">{item.product_title}</h4>
                                <p className="text-[11px] text-charcoal-500">Qty: {item.quantity} • ₹{item.unit_price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <span className="font-serif font-bold text-xs text-brand-900">₹{item.subtotal.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* FULFILLMENT & ACTIONS BAR */}
                      <div className="p-4 bg-ivory-50 border-t border-ivory-200 text-xs flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Truck size={15} className="text-gold-600" />
                            <span>Status: <b className="capitalize text-charcoal-900">{fg?.fulfillment_status || 'Processing'}</b></span>
                          </div>
                          {fg?.shipping_awb && (
                            <div className="flex items-center gap-1.5 border-l border-ivory-300 pl-3">
                              <span className="font-mono text-charcoal-700">AWB: {fg.shipping_awb}</span>
                              <a
                                href={fg.tracking_url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-700 font-bold hover:underline flex items-center gap-0.5"
                              >
                                <span>Track</span>
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* ORDER ACTION BUTTONS */}
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <button
                              onClick={() => {
                                setActionOrder(order);
                                setActionType('cancel');
                                setActionReason('');
                                setActionFeedback(null);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-700 border border-red-300 bg-red-50 hover:bg-red-100 rounded transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                          {canReturn && (
                            <button
                              onClick={() => {
                                setActionOrder(order);
                                setActionType('return');
                                setActionReason('');
                                setActionFeedback(null);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                            >
                              Request Return
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveTab('tickets');
                              setTicketCategory('order');
                              setTicketSubject(`Inquiry regarding Order ${order.order_number}`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-charcoal-700 border border-ivory-400 bg-white hover:bg-ivory-100 rounded transition-colors"
                          >
                            Need Help
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-serif font-bold text-lg text-charcoal-900">Saved Wishlist</h2>
                <span className="text-xs text-charcoal-500 font-medium">{wishlist.length} heirloom sarees saved</span>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-ivory-300 text-center space-y-3 shadow-warm-sm">
                  <Heart size={36} className="mx-auto text-charcoal-300" />
                  <h3 className="font-serif font-bold text-base text-charcoal-800">Your wishlist is currently empty</h3>
                  <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                    Explore our curated collection of authentic Gadwal sarees, handwoven by master pit-loom artisans.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold shadow-warm-sm"
                  >
                    Browse Handloom Catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl border border-ivory-300 shadow-warm-sm flex gap-4 hover:shadow-warm-md transition-shadow"
                    >
                      <Link to={`/product/${item.slug}`} className="w-24 h-32 flex-shrink-0 bg-ivory-100 rounded overflow-hidden border border-ivory-200">
                        <img
                          src={item.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
                          alt={item.title}
                          className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gold-600 block">
                            {item.category_name}
                          </span>
                          <Link to={`/product/${item.slug}`} className="font-serif font-bold text-xs text-charcoal-900 hover:text-brand-800 line-clamp-1 block">
                            {item.title}
                          </Link>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-serif font-bold text-sm text-brand-900">
                              ₹{item.base_price.toLocaleString('en-IN')}
                            </span>
                            {item.original_price > item.base_price && (
                              <span className="text-[11px] text-charcoal-400 line-through">
                                ₹{item.original_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                            {item.stock_quantity > 0 ? '✓ Available on Loom' : 'Out of stock'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-ivory-200">
                          <button
                            onClick={() => handleMoveToCart(item.id)}
                            disabled={item.stock_quantity <= 0}
                            className="flex-1 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:bg-charcoal-300 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                            <ShoppingBag size={13} />
                            <span>Move to Cart</span>
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-lg text-charcoal-900 mb-2">Saved Addresses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div key={a.id} className="p-5 bg-white rounded-xl border border-ivory-300 space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-charcoal-900">{a.full_name}</span>
                      <button
                        onClick={() => handleDeleteAddress(a.id!)}
                        className="text-charcoal-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-charcoal-600">{a.street_address}</p>
                    <p className="text-xs text-charcoal-600">{a.city}, {a.state} - {a.postal_code}</p>
                    <p className="text-xs text-charcoal-500 font-mono">Phone: {a.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SUPPORT TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-charcoal-900">
                  Create Support Request
                </h3>
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">Issue Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Inquiring about custom bridal saree blouse piece"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded border border-ivory-400 bg-white"
                      >
                        <option value="order">Order Query</option>
                        <option value="delivery">Delivery & Tracking</option>
                        <option value="return">Return & Exchange</option>
                        <option value="product">Product Details & Weave</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Detailed Message</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please provide order number if applicable and details..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-ivory-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
                  >
                    {submittingTicket ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>

              {/* TICKET HISTORY */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-charcoal-900">Previous Inquiries</h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-charcoal-500">No support tickets found.</p>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className="p-4 bg-white rounded-xl border border-ivory-300 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-charcoal-900">{t.subject}</span>
                        <span className="font-mono text-[10px] text-charcoal-500">{t.ticket_number}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-brand-50 text-brand-800 capitalize font-medium">{t.category}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 capitalize font-medium">{t.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* CANCELLATION / RETURN MODAL */}
      {actionOrder && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
                {actionType === 'cancel' ? (
                  <>
                    <XCircle size={18} className="text-red-600" />
                    <span>Cancel Order #{actionOrder.order_number}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} className="text-amber-600" />
                    <span>Request Return for #{actionOrder.order_number}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setActionOrder(null);
                  setActionType(null);
                }}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {actionFeedback && (
              <div className={`p-3 rounded text-xs flex items-center gap-2 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleOrderAction} className="space-y-3 text-xs">
              <p className="text-charcoal-600">
                {actionType === 'cancel'
                  ? 'Are you sure you want to cancel this order? If payment was captured, our administrative treasury will process a full refund to your original source.'
                  : 'Handloom products are crafted with great care. If there is a genuine defect or weave issue, our concierge will coordinate a pickup.'}
              </p>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Reason for {actionType === 'cancel' ? 'Cancellation' : 'Return'} *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    actionType === 'cancel'
                      ? 'e.g. Placed order by mistake, decided on another color...'
                      : 'e.g. Significant color discrepancy or defect in zari border...'
                  }
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-400 rounded focus:border-brand-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => {
                    setActionOrder(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 border border-ivory-400 rounded text-charcoal-700 hover:bg-ivory-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className={`px-4 py-2 rounded font-semibold text-white transition-colors ${
                    actionType === 'cancel'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSubmittingAction ? 'Submitting...' : actionType === 'cancel' ? 'Confirm Cancellation' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
