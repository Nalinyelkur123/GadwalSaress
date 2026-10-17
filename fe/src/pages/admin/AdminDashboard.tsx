import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Truck,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [range, setRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (selectedRange = range) => {
    try {
      setLoading(true);
      const [dashRes, analRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get(`/admin/analytics?range=${selectedRange}`)
      ]);
      setData(dashRes.data);
      setAnalytics(analRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-xs text-charcoal-500">
        <div className="animate-spin w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading authoritative marketplace analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const recentAuditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* HEADER & DATE RANGE FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-charcoal-900">Marketplace Executive Operations</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real-time analytics and audit trail computed directly from live PostgreSQL database records.
          </p>
        </div>

        {/* DATE RANGE FILTER */}
        <div className="flex items-center gap-1.5 bg-ivory-200 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === t.id
                  ? 'bg-brand-900 text-white shadow-warm-xs'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500 flex items-center justify-between">
            <span>Gross Merchandise Value (GMV)</span>
            <TrendingUp size={14} className="text-brand-700" />
          </span>
          <div className="font-serif font-bold text-2xl text-brand-900">
            ₹{(analytics?.totalRevenue || metrics.gmv || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">
            {analytics?.orderCount ?? metrics.paidOrdersCount} Orders in selected period
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500 flex items-center justify-between">
            <span>Marketplace Commission</span>
            <DollarSign size={14} className="text-emerald-700" />
          </span>
          <div className="font-serif font-bold text-2xl text-emerald-700">
            ₹{(analytics?.commissionEarned || metrics.totalPlatformCommission || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-charcoal-500">Net platform revenue</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500 flex items-center justify-between">
            <span>Active Handloom Weavers</span>
            <Users size={14} className="text-charcoal-700" />
          </span>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            {metrics.approvedSellers} <span className="text-xs font-normal text-charcoal-500">/ {metrics.totalSellers}</span>
          </div>
          <p className="text-[10px] text-amber-700 font-medium">
            {metrics.pendingSellerKyc} Pending KYC applications
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500 flex items-center justify-between">
            <span>Pending Saree Approvals</span>
            <Package size={14} className="text-amber-700" />
          </span>
          <div className="font-serif font-bold text-2xl text-amber-700">
            {metrics.pendingProductApprovals}
          </div>
          <Link to="/admin/products" className="text-[10px] text-brand-700 font-semibold hover:underline flex items-center gap-0.5">
            <span>Moderate listings</span>
            <ArrowUpRight size={10} />
          </Link>
        </div>
      </div>

      {/* SECONDARY OPERATIONAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-ivory-100 rounded-xl border border-ivory-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">Catalog Ready</span>
            <p className="font-serif font-bold text-lg text-charcoal-900">{metrics.publishedProducts || 0} Sarees</p>
          </div>
        </div>

        <div className="p-4 bg-ivory-100 rounded-xl border border-ivory-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">Low Stock Sarees</span>
            <p className="font-serif font-bold text-lg text-charcoal-900">{metrics.lowStockProducts || 0} Alert</p>
          </div>
        </div>

        <div className="p-4 bg-ivory-100 rounded-xl border border-ivory-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Truck size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">Active Shipments</span>
            <p className="font-serif font-bold text-lg text-charcoal-900">{metrics.shippedOrders || 0} In Transit</p>
          </div>
        </div>

        <div className="p-4 bg-ivory-100 rounded-xl border border-ivory-300 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <RotateCcw size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-charcoal-500 tracking-wider">Treasury Payouts</span>
            <p className="font-serif font-bold text-lg text-charcoal-900">₹{(metrics.pendingPayoutsAmount || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-ivory-300 flex justify-between items-center">
          <h2 className="font-serif font-bold text-sm text-charcoal-900">Recent Marketplace Orders</h2>
          <Link to="/admin/orders" className="text-xs text-brand-700 font-semibold hover:underline flex items-center gap-1">
            <span>View All Orders</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Final Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-ivory-50">
                  <td className="p-4 font-mono font-bold text-brand-900">{o.order_number}</td>
                  <td className="p-4">
                    <p className="font-semibold text-charcoal-900">{o.customer_name}</p>
                    <p className="text-[10px] text-charcoal-500">{o.customer_email}</p>
                  </td>
                  <td className="p-4 font-serif font-bold">₹{o.final_amount.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      o.payment_status === 'captured' ? 'bg-emerald-100 text-emerald-800' :
                      o.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4 capitalize text-charcoal-700 font-medium">
                    {o.fulfillment_groups?.[0]?.fulfillment_status || 'Pending'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-2.5 py-1 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 rounded text-[11px] font-semibold"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SENSITIVE AUDIT LOGS */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-ivory-300 font-serif font-bold text-sm text-charcoal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-brand-700" />
            <span>Security & Governance Audit Trail</span>
          </div>
          <span className="text-[11px] text-charcoal-500 font-mono">Immutable Log</span>
        </div>

        <div className="p-4 space-y-2.5 text-xs max-h-72 overflow-y-auto">
          {recentAuditLogs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-ivory-50 border border-ivory-200">
              <div>
                <span className="font-mono text-brand-900 font-bold uppercase text-[11px] mr-2 px-1.5 py-0.5 bg-brand-50 border border-brand-200 rounded">
                  {log.action}
                </span>
                <span className="text-charcoal-700">by {log.actor_email} ({log.actor_role})</span>
              </div>
              <span className="text-[10px] text-charcoal-400 font-mono">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
