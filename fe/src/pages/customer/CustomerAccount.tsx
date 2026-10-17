import React, { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Order, Address } from '../../types';

export const CustomerAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'tickets' | 'wishlist'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'order' | 'delivery' | 'return' | 'product'>('order');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

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
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-lg text-charcoal-900 mb-2">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-ivory-300 text-center text-xs text-charcoal-500">
                  You haven't placed any orders yet.
                </div>
              ) : (
                orders.map((order) => (
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
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
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

                    {/* FULFILLMENT STATUS & TRACKING */}
                    {order.fulfillment_groups && order.fulfillment_groups.length > 0 && (
                      <div className="p-4 bg-ivory-50 border-t border-ivory-200 text-xs flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Truck size={15} className="text-gold-600" />
                          <span>Fulfillment Status: <b className="capitalize text-charcoal-900">{order.fulfillment_groups[0].fulfillment_status}</b></span>
                        </div>
                        {order.fulfillment_groups[0].shipping_awb && (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-charcoal-700">AWB: {order.fulfillment_groups[0].shipping_awb}</span>
                            <a
                              href={order.fulfillment_groups[0].tracking_url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-700 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <span>Track Courier</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
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

          {/* SUPPORT TICKETS TAB */}
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
    </div>
  );
};
