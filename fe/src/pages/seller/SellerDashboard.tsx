import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  Wallet, 
  AlertTriangle, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { SellerProfile } from '../../types';

export const SellerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/seller/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-charcoal-500">Loading seller workspace...</p>
      </div>
    );
  }

  const { seller, metrics, recentOrders } = data;

  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-warm-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-charcoal-900">{seller.business_name}</h1>
            {seller.is_verified && (
              <span className="text-[10px] font-bold bg-gold-100 text-gold-700 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck size={12} /> Verified Weaver
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Seller Portal • Location: {seller.location} • Commission Rate: {seller.commission_rate}%
          </p>
        </div>

        <Link
          to="/seller/products?new=true"
          className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span>Add New Saree</span>
        </Link>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <div className="flex justify-between items-center text-charcoal-500 text-xs">
            <span>Gross Sales</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            ₹{metrics.grossSales.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-charcoal-500">Total handloom order value</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <div className="flex justify-between items-center text-charcoal-500 text-xs">
            <span>Available Payout</span>
            <Wallet size={16} className="text-brand-700" />
          </div>
          <div className="font-serif font-bold text-2xl text-brand-900">
            ₹{metrics.availablePayout.toLocaleString('en-IN')}
          </div>
          <Link to="/seller/finance" className="text-[10px] text-brand-700 font-semibold hover:underline block">
            Request Payout →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <div className="flex justify-between items-center text-charcoal-500 text-xs">
            <span>Orders to Process</span>
            <Package size={16} className="text-amber-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            {metrics.pendingOrdersCount}
          </div>
          <p className="text-[10px] text-amber-700 font-medium">Awaiting loom packing & dispatch</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-ivory-300 shadow-warm-sm space-y-1">
          <div className="flex justify-between items-center text-charcoal-500 text-xs">
            <span>Active Listings</span>
            <Truck size={16} className="text-gold-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-charcoal-900">
            {metrics.activeListings} <span className="text-xs font-normal text-charcoal-500">/ {metrics.totalProducts}</span>
          </div>
          <p className="text-[10px] text-charcoal-500">Approved for storefront discovery</p>
        </div>
      </div>

      {/* RECENT FULFILLMENT ORDERS */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-warm-sm overflow-hidden">
        <div className="p-5 border-b border-ivory-300 flex justify-between items-center">
          <h2 className="font-serif font-bold text-base text-charcoal-900">
            Recent Fulfillment Orders
          </h2>
          <Link to="/seller/orders" className="text-xs font-semibold text-brand-700 hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            No active fulfillment orders yet.
          </div>
        ) : (
          <div className="divide-y divide-ivory-200">
            {recentOrders.map((fg: any) => (
              <div key={fg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">Order #{fg.order_id}</span>
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                      {fg.fulfillment_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    {fg.items.length} items • Subtotal: ₹{fg.subtotal.toLocaleString('en-IN')} (Net: ₹{fg.net_seller_amount.toLocaleString('en-IN')})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {fg.shipping_awb ? (
                    <span className="font-mono text-charcoal-600">AWB: {fg.shipping_awb}</span>
                  ) : (
                    <Link
                      to="/seller/orders"
                      className="px-3 py-1.5 bg-brand-700 text-white rounded text-xs font-medium hover:bg-brand-800"
                    >
                      Pack & Ship
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
