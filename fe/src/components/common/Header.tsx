import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ShieldCheck, ChevronDown, Store, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Header: React.FC = () => {
  const { user, logout, quickSwitchRole, setIsAuthModalOpen } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ivory-300">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-brand-900 text-gold-200 text-xs py-2 px-4 border-b border-brand-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center gap-1">
          <div className="flex items-center space-x-2 font-medium tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
            <span>Authentic Gadwal Handlooms</span>
            <span className="opacity-40">|</span>
            <span>Direct from Weavers</span>
            <span className="opacity-40">|</span>
            <span>Pan-India Insured Delivery</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-ivory-300">
            <Link to="/track-order" className="hover:text-gold-300 transition-colors">Track Order</Link>
            <span className="opacity-40">•</span>
            <Link to="/contact" className="hover:text-gold-300 transition-colors">Help</Link>
            <span className="opacity-40">•</span>
            {user?.role === 'seller' ? (
              <Link to="/seller/dashboard" className="text-gold-300 hover:text-white font-medium flex items-center gap-1">
                <Store size={12} /> Seller Portal
              </Link>
            ) : user?.role === 'admin' ? (
              <Link to="/admin/dashboard" className="text-gold-300 hover:text-white font-medium flex items-center gap-1">
                <Crown size={12} /> Admin CRM
              </Link>
            ) : (
              <Link to="/seller/register" className="hover:text-gold-300 transition-colors">Seller Login / Register</Link>
            )}

            {/* DEMO ROLE SWITCHER PILL */}
            <div className="relative">
              <button 
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold"
              >
                <span>Role: {user?.role || 'Guest'}</span>
                <ChevronDown size={10} />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white text-charcoal-900 shadow-warm-lg rounded border border-ivory-300 py-1.5 z-50 text-left">
                  <div className="px-3 py-1 text-[10px] font-bold text-charcoal-500 uppercase tracking-wider border-b border-ivory-300">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => { quickSwitchRole('customer'); setDemoMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-ivory-200 flex items-center justify-between"
                  >
                    <span>Customer (Ananya)</span>
                    {user?.role === 'customer' && <span className="text-brand-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('seller'); setDemoMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-ivory-200 flex items-center justify-between"
                  >
                    <span>Seller (Venkateswara)</span>
                    {user?.role === 'seller' && <span className="text-brand-700 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('admin'); setDemoMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-ivory-200 flex items-center justify-between"
                  >
                    <span>Admin (Super Admin)</span>
                    {user?.role === 'admin' && <span className="text-brand-700 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-brand-700 flex items-center justify-center text-gold-300 font-serif font-bold text-xl border-2 border-gold-400/60 shadow-warm-sm group-hover:scale-105 transition-transform">
              GW
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-wider text-brand-900 block leading-tight">
                Gadwal Weaves
              </span>
              <span className="text-[10px] tracking-[0.25em] text-gold-600 font-semibold block uppercase">
                Handwoven Authentic Sarees
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-charcoal-700">
            <Link to="/shop" className="hover:text-brand-700 transition-colors">Sarees</Link>
            <Link to="/shop?category=bridal-collection" className="hover:text-brand-700 transition-colors">Collections</Link>
            <Link to="/weavers" className="hover:text-brand-700 transition-colors">Our Weavers</Link>
            <Link to="/about" className="hover:text-brand-700 transition-colors">About</Link>
            <Link to="/craft-and-heritage" className="hover:text-brand-700 transition-colors">Craft & Heritage</Link>
            <Link to="/contact" className="hover:text-brand-700 transition-colors">Contact</Link>
          </nav>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Search sarees, colours, weaves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-ivory-200 border border-ivory-400 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-charcoal-900 placeholder-charcoal-500"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-charcoal-500" />
          </form>

          {/* ACTION ICONS */}
          <div className="flex items-center space-x-4">
            
            {/* USER / PROFILE */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 text-charcoal-700 hover:text-brand-700 rounded-full hover:bg-ivory-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-300 flex items-center justify-center text-xs font-bold text-brand-800">
                      {user.full_name.charAt(0)}
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-warm-lg border border-ivory-300 py-2 z-50 text-left">
                      <div className="px-4 py-2 border-b border-ivory-300">
                        <p className="text-xs font-semibold text-charcoal-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-charcoal-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 capitalize">
                          {user.role} Account
                        </span>
                      </div>

                      {user.role === 'customer' && (
                        <>
                          <Link
                            to="/account"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2 text-xs text-charcoal-700 hover:bg-ivory-200"
                          >
                            My Account & Orders
                          </Link>
                          <Link
                            to="/account/addresses"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2 text-xs text-charcoal-700 hover:bg-ivory-200"
                          >
                            Saved Addresses
                          </Link>
                        </>
                      )}

                      {user.role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-brand-700 font-semibold hover:bg-ivory-200"
                        >
                          Seller Workspace
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-brand-700 font-semibold hover:bg-ivory-200"
                        >
                          Admin CRM Operations
                        </Link>
                      )}

                      <div className="border-t border-ivory-300 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 border border-brand-300 rounded-full px-3 py-1.5 hover:bg-brand-50 transition-colors"
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* WISHLIST */}
            <Link to="/account/wishlist" className="relative text-charcoal-700 hover:text-brand-700 p-1.5 transition-colors hidden sm:block" title="My Wishlist">
              <Heart size={20} />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistIds.size}
                </span>
              )}
            </Link>

            {/* CART DRAWER BUTTON */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-1.5 text-charcoal-700 hover:text-brand-700 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={21} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-700 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* MOBILE HAMBURGER MENU */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-charcoal-700 hover:text-brand-700"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU ACCORDION */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ivory-300 py-4 space-y-3 bg-white">
            <form onSubmit={handleSearch} className="px-2 mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sarees, colours, weaves..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-ivory-200 border border-ivory-400 focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-charcoal-500" />
              </div>
            </form>
            <div className="flex flex-col space-y-2 px-3 text-sm font-medium">
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">Sarees</Link>
              <Link to="/shop?category=bridal-collection" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">Collections</Link>
              <Link to="/weavers" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">Our Weavers</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">About Us</Link>
              <Link to="/craft-and-heritage" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">Craft & Heritage</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1 text-charcoal-800">Contact</Link>
              {user?.role === 'seller' && (
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1 text-brand-700 font-semibold">Seller Portal</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1 text-brand-700 font-semibold">Admin CRM</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
