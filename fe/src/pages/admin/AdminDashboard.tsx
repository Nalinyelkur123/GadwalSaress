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
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-xs text-charcoal-500">
        Loading Admin Operations CRM...
      </div>
    );
  }

  const { metrics, recentOrders, recentAuditLogs } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-charcoal-900">Marketplace Executive Operations</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Live marketplace analytics derived from authoritative database records.
        </p>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Gross Merchandise Value (GMV)</span>
          <div className="font-serif font-bold text-2xl text-brand-900">
            ₹{metrics.gmv.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">{metrics.paidOrdersCount} Paid Orders</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Platform Commission Earned</span>
          <div className="font-serif font-bold text-2xl text-emerald-700">
            ₹{metrics.totalPlatformCommission.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-charcoal-500">Net marketplace revenue</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Artisan Weavers</span>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            {metrics.approvedSellers} <span className="text-xs font-normal text-charcoal-500">/ {metrics.totalSellers}</span>
          </div>
          <p className="text-[10px] text-amber-700 font-medium">
            {metrics.pendingSellerKyc} Pending KYC applications
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <span className="text-xs text-charcoal-500">Pending Catalog Approvals</span>
          <div className="font-serif font-bold text-2xl text-amber-700">
            {metrics.pendingProductApprovals}
          </div>
          <Link to="/admin/products" className="text-[10px] text-brand-700 font-semibold hover:underline block">
            Moderate listings →
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-ivory-300 flex justify-between items-center">
          <h2 className="font-serif font-bold text-sm text-charcoal-900">Recent Marketplace Orders</h2>
          <Link to="/admin/orders" className="text-xs text-brand-700 font-semibold hover:underline">
            View All Orders →
          </Link>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Order Ref</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Final Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfillment</th>
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
                    o.payment_status === 'captured' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-4 capitalize text-charcoal-700">
                  {o.fulfillment_groups?.[0]?.fulfillment_status || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SENSITIVE AUDIT LOGS */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-ivory-300 font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2">
          <ShieldAlert size={16} className="text-brand-700" />
          <span>Security Audit Trail</span>
        </div>

        <div className="p-4 space-y-2.5 text-xs">
          {recentAuditLogs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-2 rounded bg-ivory-50 border border-ivory-200">
              <div>
                <span className="font-mono text-brand-900 font-bold uppercase mr-2">{log.action}</span>
                <span className="text-charcoal-600">by {log.actor_email} ({log.actor_role})</span>
              </div>
              <span className="text-[10px] text-charcoal-400 font-mono">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
