import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Layers, 
  ShieldAlert, 
  ArrowLeft,
  LogOut,
  Crown,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/common/NotificationBell';

export const AdminLayout: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-ivory-300 max-w-md w-full text-center space-y-4 shadow-warm-lg">
          <Crown size={40} className="mx-auto text-brand-700" />
          <h2 className="font-serif font-bold text-xl text-charcoal-900">Admin CRM Access Restricted</h2>
          <p className="text-xs text-charcoal-600">
            This area requires administrative authorization. Sign in with an authorized Super Admin credential.
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => quickSwitchRole('admin')}
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded text-xs font-semibold"
            >
              Sign In as Super Admin (Admin@123)
            </button>
            <Link to="/" className="block text-xs text-charcoal-500 hover:underline pt-2">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Operations Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Catalog Moderation', path: '/admin/products', icon: Package },
    { label: 'Categories & Taxonomy', path: '/admin/categories', icon: Layers },
    { label: 'Sellers & Weavers', path: '/admin/sellers', icon: Users },
    { label: 'Customers CRM', path: '/admin/customers', icon: Users },
    { label: 'Orders & Refunds', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Shiprocket Logistics', path: '/admin/shipments', icon: ShieldAlert },
    { label: 'Finance & Payouts', path: '/admin/finance', icon: DollarSign },
    { label: 'CMS & Promotions', path: '/admin/cms', icon: Layers },
  ];

  return (
    <div className="min-h-screen flex bg-ivory-100 text-charcoal-900">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-ivory-300 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* LOGO */}
          <div className="p-6 border-b border-ivory-300 bg-brand-900 text-white">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold-400 text-brand-900 font-serif font-bold text-sm flex items-center justify-center">
                GW
              </div>
              <div>
                <span className="font-serif font-bold text-sm block leading-tight">Gadwal Weaves</span>
                <span className="text-[9px] font-bold text-gold-300 uppercase tracking-widest">Admin CRM</span>
              </div>
            </Link>
          </div>

          {/* NAV LINKS */}
          <nav className="p-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-brand-700 text-white shadow-sm' : 'text-charcoal-700 hover:bg-ivory-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER & STOREFRONT LINK */}
        <div className="p-4 border-t border-ivory-300 space-y-3">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xs text-charcoal-600 hover:text-brand-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Storefront Public View</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVBAR WITH NOTIFICATIONS & PROFILE */}
        <header className="bg-white border-b border-ivory-300 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-brand-900">Super Admin Operations</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell role="admin" />

            <Link 
              to="/" 
              className="text-xs text-charcoal-600 hover:text-brand-800 font-medium hidden sm:flex items-center gap-1"
            >
              <span>Public Store</span>
              <ExternalLink size={12} />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-ivory-300">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span className="text-xs font-semibold text-charcoal-800 hidden sm:inline">
                {user.full_name || 'Super Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
