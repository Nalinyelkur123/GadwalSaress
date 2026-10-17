import React, { useState, useEffect } from 'react';
import { Search, User, ShieldCheck, ShieldAlert, ShoppingBag, MapPin, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { CustomerSummary } from '../../types';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleSuspend = async (customer: CustomerSummary) => {
    const action = customer.is_suspended ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${customer.full_name}'s account?`)) return;

    try {
      await api.put(`/admin/customers/${customer.id}/status`, {
        is_suspended: !customer.is_suspended
      });
      fetchCustomers();
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...customer, is_suspended: !customer.is_suspended });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update customer status.');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Customer Management</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Audit customer accounts, order frequency, total lifetime value, and support status.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-ivory-400 rounded text-xs focus:border-brand-700 outline-none"
          />
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Total Customers</span>
          <p className="font-serif text-2xl font-bold text-charcoal-900 mt-1">{customers.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Active Accounts</span>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">
            {customers.filter(c => !c.is_suspended).length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-ivory-300 shadow-warm-sm">
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase">Total Customer GMV</span>
          <p className="font-serif text-2xl font-bold text-brand-900 mt-1">
            ₹{customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-500">Loading customers...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-500">No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-ivory-300 text-brand-800 font-bold flex items-center justify-center font-serif">
                        {c.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-charcoal-900 block">{c.full_name}</span>
                        <span className="text-[10px] text-charcoal-400">ID: {c.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-charcoal-700">{c.email}</p>
                    <p className="text-[11px] text-charcoal-500">{c.phone || 'No phone registered'}</p>
                  </td>
                  <td className="p-4 font-bold text-charcoal-800">{c.total_orders} orders</td>
                  <td className="p-4 font-serif font-bold text-brand-900">
                    ₹{(c.total_spent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-charcoal-500">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.is_suspended ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded text-[11px] font-semibold transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(c)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        c.is_suspended
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {c.is_suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-warm-xl border border-ivory-300">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Customer Profile & Audit</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-charcoal-400 hover:text-charcoal-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-ivory-100 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-brand-700 text-white font-serif font-bold text-lg flex items-center justify-center">
                  {selectedCustomer.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-charcoal-900">{selectedCustomer.full_name}</h4>
                  <p className="text-charcoal-600">{selectedCustomer.email}</p>
                  <p className="text-[11px] text-charcoal-500">{selectedCustomer.phone || 'No phone'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-ivory-300 rounded">
                  <span className="text-[10px] uppercase font-bold text-charcoal-500">Orders Placed</span>
                  <p className="font-serif font-bold text-base text-charcoal-900">{selectedCustomer.total_orders}</p>
                </div>
                <div className="p-3 bg-white border border-ivory-300 rounded">
                  <span className="text-[10px] uppercase font-bold text-charcoal-500">Lifetime Spent</span>
                  <p className="font-serif font-bold text-base text-brand-900">
                    ₹{(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white border border-ivory-300 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Account Status:</span>
                  <span className={`font-bold uppercase ${selectedCustomer.is_suspended ? 'text-red-600' : 'text-emerald-700'}`}>
                    {selectedCustomer.is_suspended ? 'Suspended' : 'Active & Verified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Member Since:</span>
                  <span className="font-medium text-charcoal-800">
                    {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Last Order:</span>
                  <span className="font-medium text-charcoal-800">
                    {selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString() : 'None'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-ivory-200">
                <button
                  onClick={() => handleToggleSuspend(selectedCustomer)}
                  className={`px-4 py-2 rounded font-semibold text-xs transition-colors ${
                    selectedCustomer.is_suspended
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {selectedCustomer.is_suspended ? 'Reactivate Account' : 'Suspend Account'}
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
